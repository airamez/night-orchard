import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { addPlayer, allLocked, isLegal, newLobby, resolve, startGame, type Action, type GameState } from "./engine";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const randomCode = () => Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
const randomToken = () => crypto.randomUUID() + crypto.randomUUID();

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

type Db = Awaited<ReturnType<typeof admin>>;

async function seatFor(db: Db, code: string, token: string): Promise<string> {
  const { data } = await db.from("room_seats").select("seat_id").eq("code", code).eq("token", token).maybeSingle();
  if (!data) throw new Error("Your seat was not found in this room.");
  return data.seat_id;
}

/** Optimistic read-modify-write on the single room row. */
async function mutate(db: Db, code: string, fn: (s: GameState) => GameState) {
  for (let i = 0; i < 6; i++) {
    const { data: row, error } = await db.from("rooms").select("*").eq("code", code).maybeSingle();
    if (error || !row) throw new Error("Room not found.");
    const next = fn(row.state as unknown as GameState);
    const { data: upd } = await db.from("rooms")
      .update({ state: next as never, updated_at: new Date().toISOString() })
      .eq("code", code).eq("updated_at", row.updated_at).select("round");
    if (upd && upd.length) return { state: next, round: upd[0].round };
  }
  throw new Error("The room is busy. Try again.");
}

async function maybeResolve(db: Db, code: string, state: GameState, round: number) {
  if (state.phase !== "playing" || !allLocked(state)) return;
  await db.rpc("resolve_round", { p_code: code, p_round: round, p_state: resolve(state) as never });
}

export const createRoom = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ name: z.string().trim().min(1).max(20) }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const seatId = crypto.randomUUID();
    for (let i = 0; i < 8; i++) {
      const code = randomCode();
      const { error } = await db.from("rooms").insert({ code, state: newLobby(seatId, data.name) as never });
      if (error) continue;
      const token = randomToken();
      await db.from("room_seats").insert({ code, seat_id: seatId, token });
      return { code, token, seatId };
    }
    throw new Error("Could not create a room.");
  });

export const joinRoom = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ code: z.string().length(4), name: z.string().trim().min(1).max(20) }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const code = data.code.toUpperCase();
    const seatId = crypto.randomUUID();
    await mutate(db, code, (s) => {
      if (s.phase !== "lobby") throw new Error("This game has already started.");
      if (s.players.length >= 8) throw new Error("This room is full.");
      return addPlayer(s, seatId, data.name);
    });
    const token = randomToken();
    await db.from("room_seats").insert({ code, seat_id: seatId, token });
    return { code, token, seatId };
  });

const actionSchema = z.object({
  type: z.enum(["wait", "move", "pickup", "drop", "usekey", "hold", "light", "speak", "distract"]),
  dir: z.enum(["north", "south", "east", "west"]).optional(),
  text: z.string().max(40).optional(),
});

const opSchema = z.discriminatedUnion("op", [
  z.object({ op: z.literal("start") }),
  z.object({ op: z.literal("restart") }),
  z.object({ op: z.literal("choose"), action: actionSchema }),
  z.object({ op: z.literal("lock") }),
  z.object({ op: z.literal("unlock") }),
  z.object({ op: z.literal("forceWait"), target: z.string() }),
  z.object({ op: z.literal("chat"), text: z.string().trim().min(1).max(240) }),
]);

export type RoomOp = z.infer<typeof opSchema>;

export const roomAction = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ code: z.string().length(4), token: z.string().min(10), body: opSchema }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const code = data.code.toUpperCase();
    const me = await seatFor(db, code, data.token);
    const b = data.body;
    const res = await mutate(db, code, (s) => {
      const player = s.players.find((p) => p.id === me);
      if (!player) throw new Error("You are not in this room.");
      const isHost = s.hostId === me;
      switch (b.op) {
        case "start":
          if (!isHost || s.phase !== "lobby") throw new Error("Only the host can start.");
          if (s.players.length < 2) throw new Error("You need at least 2 players.");
          return startGame(s);
        case "restart":
          if (!isHost) throw new Error("Only the host can restart.");
          return startGame(s);
        case "choose": {
          if (s.phase !== "playing" || s.pending[me]?.locked) return s;
          const a = b.action as Action;
          if (!isLegal(s, player, a)) throw new Error("That action is not possible here.");
          return { ...s, pending: { ...s.pending, [me]: { action: a, locked: false } } };
        }
        case "lock":
          if (s.phase !== "playing") return s;
          return { ...s, pending: { ...s.pending, [me]: { action: s.pending[me]?.action ?? { type: "wait" }, locked: true } } };
        case "unlock":
          if (s.phase !== "playing" || !s.pending[me]) return s;
          return { ...s, pending: { ...s.pending, [me]: { ...s.pending[me], locked: false } } };
        case "forceWait":
          if (!isHost || s.phase !== "playing") throw new Error("Only the host can do that.");
          if (s.pending[b.target]?.locked) return s;
          return { ...s, pending: { ...s.pending, [b.target]: { action: { type: "wait" }, locked: true } },
            log: [...s.log, { r: s.round, text: `${s.players.find((p) => p.id === b.target)?.name ?? "A player"} is set to Wait by the host.` }] };
        case "chat":
          return { ...s, chat: [...s.chat, { name: player.name, text: b.text, t: Date.now() }].slice(-150) };
      }
    });
    await maybeResolve(db, code, res.state, res.round);
    return { ok: true };
  });
