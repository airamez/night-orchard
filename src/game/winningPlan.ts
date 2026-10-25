import { isLegal, resolve, startGame, type Action, type GameState, type Player } from "./engine";
import { GK_PATH, PASSWORD_PHRASES, ROOMS, ROUND_LIMIT, SHRINE_OF, type RoomId } from "./map";

export interface WinningStep { round: number; players: { id: string; name: string; room: RoomId; action: Action }[] }
export interface WinningPlan { steps: WinningStep[]; won: boolean }

// Time-expanded shortest path: patrol arrivals and cancelled actions count as rounds.
function nextPreparation(s: GameState, player: Player): Action {
  const queue = [{ room: player.room, lit: player.lit, delayed: player.delayed, time: 0, first: { type: "wait" } as Action }];
  const seen = new Set<string>();
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i];
    if (!node) continue;
    if (node.room === "hedge_knot" && node.lit) return node.first;
    if (node.time >= ROUND_LIMIT - s.round + 1) continue;
    const actions: Action[] = [{ type: "wait" }];
    if (!node.delayed) {
      if (!node.lit && node.room === SHRINE_OF[player.lantern]) actions.push({ type: "light" });
      for (const [dir, dest] of Object.entries(ROOMS[node.room].exits)) {
        if (dest === "rose_walk" || dest === "gate" || dest === "outer_lawn" || dest === "orchard") continue;
        actions.push({ type: "move", dir: dir as NonNullable<Action["dir"]> });
      }
    }
    for (const action of actions) {
      const room = action.type === "move" && action.dir ? ROOMS[node.room].exits[action.dir] ?? node.room : node.room;
      const lit = node.lit || action.type === "light";
      const time = node.time + 1;
      const delayed = room === GK_PATH[(s.gkIndex + time) % GK_PATH.length];
      const key = `${room}:${lit}:${delayed}:${time}`;
      if (seen.has(key)) continue;
      seen.add(key);
      queue.push({ room, lit, delayed, time, first: node.time === 0 ? action : node.first });
    }
  }
  return { type: "wait" };
}

/** Read-only testing plan. Knowing the password skips the optional Orchard expedition. */
export function winningPlan(input: GameState): WinningPlan {
  let s = input.phase === "lobby" ? startGame(input) : structuredClone(input);
  const steps: WinningStep[] = [];
  if (s.players.length < 2) return { steps, won: s.phase === "won" };
  for (let attempt = 0; attempt < ROUND_LIMIT && s.phase === "playing"; attempt++) {
    const actions: Record<string, Action> = {};
    const inside = s.players.filter((p) => p.room !== "outer_lawn");
    const beyond = inside.filter((p) => p.lit && (p.room === "rose_walk" || p.room === "gate"));
    const behind = inside.filter((p) => !beyond.includes(p));
    const roseHolder = beyond.find((p) => p.room === "rose_walk" && !p.delayed);
    const sunHolder = behind.find((p) => p.room === "sun_stone" && p.lit && !p.delayed);
    const allReady = behind.every((p) => p.lit && !p.delayed && (p.room === "hedge_knot" || p.room === "sun_stone"));
    const designated = allReady && !beyond.length && !sunHolder ? behind[0]?.id : undefined;
    for (const p of s.players) {
      let action: Action = { type: "wait" };
      if (!p.delayed && p.room !== "outer_lawn") {
        if (!p.lit) action = nextPreparation(s, p);
        else if (p.room === "gate") action = s.passwordSolved ? { type: "move", dir: "north" } : { type: "speak", text: (s.password || PASSWORD_PHRASES[0]!).toUpperCase() };
        else if (p.room === "rose_walk") action = behind.length && p.id === roseHolder?.id ? { type: "hold" } : { type: "move", dir: "north" };
        else if (p.room === "sun_stone") action = roseHolder ? { type: "move", dir: "east" } : { type: "hold" };
        else if (p.room === "hedge_knot") {
          if (roseHolder || sunHolder) action = { type: "move", dir: "north" };
          else if (p.id === designated) action = { type: "move", dir: "west" };
          else if (GK_PATH[(s.gkIndex + 1) % GK_PATH.length] === p.room) action = { type: "distract" };
        } else action = nextPreparation(s, p);
      }
      actions[p.id] = s.pending[p.id]?.locked ? s.pending[p.id]?.action ?? action : action;
    }
    const players = s.players.map((p) => ({ id: p.id, name: p.name, room: p.room, action: actions[p.id] ?? { type: "wait" } as Action }));
    if (s.players.some((p) => !isLegal(s, p, actions[p.id] ?? { type: "wait" }))) break;
    steps.push({ round: s.round, players });
    s.pending = Object.fromEntries(players.map((p) => [p.id, { action: p.action, locked: true }]));
    s = resolve(s);
  }
  return { steps, won: s.phase === "won" };
}

export function winningAction(action: Action, room: RoomId): string {
  if (action.type === "move" && action.dir) {
    const destination = ROOMS[room].exits[action.dir];
    return `Go ${action.dir} to ${destination ? ROOMS[destination].title : "the next room"}`;
  }
  if (action.type === "light") return "Light your lantern";
  if (action.type === "speak") return `Speak ${action.text}`;
  if (action.type === "hold") return "Hold — keep the hedge open";
  if (action.type === "distract") return "Distract the groundskeeper";
  return "Wait";
}