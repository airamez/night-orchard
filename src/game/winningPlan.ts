import { isLegal, resolve, startGame, type Action, type GameState, type Player } from "./engine";
import { GK_PATH, PASSWORD_PHRASES, ROOMS, ROUND_LIMIT, SHRINE_OF, type Dir, type RoomId } from "./map";

export interface WinningStep { round: number; players: { id: string; name: string; room: RoomId; action: Action }[] }
export interface WinningPlan { steps: WinningStep[]; won: boolean }

const BEYOND: RoomId[] = ["rose_walk", "gate"];

// Time-expanded shortest path: patrol arrivals and cancelled actions count as rounds.
// The woven hedge and the locked Glass House door are impassable here; crossing the
// hedge is coordinated by the main plan, never by preparation.
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
        if (ROOMS[node.room].hedge?.includes(dir as Dir)) continue;
        if (ROOMS[node.room].lockedExit === dir && !s.doorUnlocked) continue;
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

/**
 * Read-only testing plan. Knowing the password skips the optional Orchard expedition.
 * The plan is recomputed from the live room state, so it must recover from any
 * reachable position: delays, deviating locked actions, stranded holders, and
 * players stuck on the wrong side of the hedge.
 */
export function winningPlan(input: GameState): WinningPlan {
  let s = input.phase === "lobby" ? startGame(input) : structuredClone(input);
  const steps: WinningStep[] = [];
  if (s.players.length < 2) return { steps, won: s.phase === "won" };
  for (let attempt = 0; attempt < ROUND_LIMIT && s.phase === "playing"; attempt++) {
    const gkNext = GK_PATH[(s.gkIndex + 1) % GK_PATH.length];
    const inside = s.players.filter((p) => p.room !== "outer_lawn");
    const out = s.players.filter((p) => p.room === "outer_lawn");
    const atRose = inside.filter((p) => p.room === "rose_walk");
    const atGate = inside.filter((p) => p.room === "gate");
    const behind = inside.filter((p) => !BEYOND.includes(p.room));
    const unlitBeyond = inside.filter((p) => !p.lit && BEYOND.includes(p.room));
    const lockedAction = (p: Player) => (s.pending[p.id]?.locked ? s.pending[p.id]?.action : undefined);
    // A holder only counts if they are free to actually Hold this round.
    const freeToHold = (p: Player) => !p.delayed && (!lockedAction(p) || lockedAction(p)!.type === "hold");

    // This round's hedge holder: prefer a lit player at the Rose Walk, then the Sun Stone.
    const holder = atRose.find((p) => p.lit && freeToHold(p)) ?? atRose.find(freeToHold)
      ?? behind.find((p) => p.room === "sun_stone" && freeToHold(p));
    // Nobody holds yet: send a Hedge Knot player to stage at the Sun Stone — never the last inside player.
    const stager = !holder && !atRose.length && behind.length > 1
      ? behind.find((p) => p.room === "hedge_knot" && freeToHold(p))
      : undefined;
    // Someone who cannot finish alone needs a player to come back and hold the hedge.
    const lone = inside.length === 1 ? inside[0] : undefined;
    const loneTrapped = !!lone && !(lone.lit && BEYOND.includes(lone.room));
    const retreatBlocked = unlitBeyond.length > 0 && !holder && !stager;
    const readyStuck = !holder && !stager && behind.length > 0
      && behind.every((p) => p.lit && (p.room === "hedge_knot" || p.room === "sun_stone"));
    const rescuer = loneTrapped || retreatBlocked || readyStuck
      ? atGate.find((p) => p.lit && !p.delayed) ?? out.find((p) => !p.delayed)
      : undefined;

    const password = (s.password || PASSWORD_PHRASES[0]!).toUpperCase();
    const actions: Record<string, Action> = {};
    for (const p of s.players) {
      let action: Action = { type: "wait" };
      if (!p.delayed) {
        if (p.room === "outer_lawn") {
          if (p.id === rescuer?.id) action = { type: "move", dir: "south" };
        } else if (!p.lit && BEYOND.includes(p.room)) {
          // Unlit and north of the hedge: retreat south while someone holds it open.
          action = p.id === holder?.id ? { type: "hold" } : { type: "move", dir: "south" };
        } else if (!p.lit) {
          action = nextPreparation(s, p);
        } else if (p.room === "gate") {
          if (p.id === rescuer?.id) action = { type: "move", dir: "south" };
          else action = s.passwordSolved ? { type: "move", dir: "north" } : { type: "speak", text: password };
        } else if (p.room === "rose_walk") {
          const needed = behind.length > 0 || unlitBeyond.some((q) => q.id !== p.id);
          action = needed && p.id === holder?.id ? { type: "hold" } : { type: "move", dir: "north" };
        } else if (p.room === "sun_stone") {
          action = p.id === holder?.id && !rescuer ? { type: "hold" } : { type: "move", dir: "east" };
        } else if (p.room === "hedge_knot") {
          if (holder) action = { type: "move", dir: "north" };
          else if (p.id === stager?.id) action = { type: "move", dir: "west" };
          else if (gkNext === p.room) action = { type: "distract" };
        } else {
          action = nextPreparation(s, p);
        }
      }
      // Respect an already locked action; like the engine, anything illegal becomes Wait.
      const effective = lockedAction(p) ?? action;
      actions[p.id] = isLegal(s, p, effective) ? effective : { type: "wait" };
    }
    const players = s.players.map((p) => ({ id: p.id, name: p.name, room: p.room, action: actions[p.id] ?? { type: "wait" } as Action }));
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
