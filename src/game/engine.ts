import { GK_PATH, LANTERNS, PASSWORD, ROOMS, ROUND_LIMIT, SHRINE_OF, START_ROOMS, type Dir, type Lantern, type RoomId } from "./map";

export type ActionType = "wait" | "move" | "pickup" | "drop" | "usekey" | "hold" | "light" | "speak" | "distract";
export interface Action { type: ActionType; dir?: Dir; text?: string }

export interface Player {
  id: string;
  name: string;
  room: RoomId;
  lantern: Lantern;
  lit: boolean;
  hasKey: boolean;
  delayed: boolean;
  outAt: number | null; // round they reached the lawn (last arrival)
  helped: number; // rounds spent on Hold / Distract
}

export interface GameState {
  phase: "lobby" | "playing" | "won" | "lost";
  hostId: string;
  players: Player[];
  round: number;
  keyRoom: RoomId | null;
  doorUnlocked: boolean;
  passwordSolved: boolean;
  gkIndex: number;
  visited: RoomId[];
  firstVisitor: Partial<Record<RoomId, string>>;
  pending: Record<string, { action: Action; locked: boolean }>;
  log: { r: number; text: string; roomId?: RoomId }[];
  chat: { name: string; text: string; t: number }[];
}

export function newLobby(hostId: string, hostName: string): GameState {
  return {
    phase: "lobby", hostId, players: [blankPlayer(hostId, hostName)], round: 0, keyRoom: "bell_lawn",
    doorUnlocked: false, passwordSolved: false, gkIndex: 0, visited: [], firstVisitor: {}, pending: {}, log: [], chat: [],
  };
}

function blankPlayer(id: string, name: string): Player {
  return { id, name, room: "fountain", lantern: "Oak", lit: false, hasKey: false, delayed: false, outAt: null, helped: 0 };
}

export function addPlayer(s: GameState, id: string, name: string): GameState {
  if (s.players.some((p) => p.id === id)) return s;
  return { ...s, players: [...s.players, blankPlayer(id, name)] };
}

/** Remove a player mid-game or from the lobby; the host role passes to the next player. */
export function removePlayer(s: GameState, id: string): GameState {
  const p = s.players.find((x) => x.id === id);
  if (!p) return s;
  const players = s.players.filter((x) => x.id !== id);
  const pending = { ...s.pending };
  delete pending[id];
  const next: GameState = {
    ...s,
    players,
    pending,
    hostId: s.hostId === id ? (players[0]?.id ?? s.hostId) : s.hostId,
    log: [...s.log, { r: s.round, text: `${p.name} leaves the garden.` }],
  };
  // If everyone still inside has already escaped, the game is won.
  if (next.phase === "playing" && players.length > 0 && players.every((x) => x.room === "outer_lawn")) {
    next.phase = "won";
    next.log = [...next.log, { r: s.round, text: "The gate closes behind you." }];
  }
  return next;
}

/** Start or restart: deal rooms and lanterns by join order, reset the world. */
function roomTip(r: number, roomId: RoomId, players: Player[]): GameState["log"][number] {
  const room = ROOMS[roomId];
  const names = players.filter((p) => p.room === roomId).map((p) => p.name).join(", ");
  return { r, roomId, text: `${names} discovers ${room.title}: ${room.prose.join(" ")}` };
}

export function startGame(s: GameState): GameState {
  const players = s.players.map((p, i) => ({
    ...blankPlayer(p.id, p.name),
    room: START_ROOMS[i % 4]!,
    lantern: LANTERNS[i % 4]!,
  }));
  const visited = Array.from(new Set(players.map((p) => p.room)));
  const firstVisitor: GameState["firstVisitor"] = {};
  for (const p of players) firstVisitor[p.room] ??= p.name;
  return {
    ...s, phase: "playing", players, round: 1, keyRoom: "bell_lawn", doorUnlocked: false, passwordSolved: false,
    gkIndex: 0, visited, firstVisitor, pending: {}, log: [
      { r: 1, text: "The gate locks behind you. The groundskeeper is in the Oak Shrine." },
      ...visited.map((roomId) => roomTip(1, roomId, players)),
    ],
  };
}

export function gkRoom(s: GameState): RoomId { return GK_PATH[s.gkIndex % GK_PATH.length]!; }

/** Which actions are legal for this player right now. */
export function isLegal(s: GameState, p: Player, a: Action): boolean {
  const room = ROOMS[p.room];
  switch (a.type) {
    case "wait": case "distract": return true;
    case "move": {
      if (!a.dir || !room.exits[a.dir]) return false;
      if (room.lockedExit === a.dir && !s.doorUnlocked) return false;
      return true;
    }
    case "pickup": return s.keyRoom === p.room && !p.hasKey;
    case "drop": return p.hasKey;
    case "usekey": return p.room === "glass_house" && p.hasKey && !s.doorUnlocked;
    case "hold": return p.room === "sun_stone" || p.room === "rose_walk";
    case "light": return !p.lit && SHRINE_OF[p.lantern] === p.room;
    case "speak": return p.room === "gate" && typeof a.text === "string";
  }
}

export function normalizePassword(t: string) { return t.trim().replace(/\s+/g, " ").toLowerCase(); }

export function allLocked(s: GameState) { return s.players.every((p) => s.pending[p.id]?.locked); }

/** Pure round resolution, in the authored order. */
export function resolve(prev: GameState): GameState {
  const s: GameState = structuredClone(prev);
  const r = s.round;
  const log = (text: string) => s.log.push({ r, text });
  const acts = new Map<string, Action>();

  // 0 + 1. Delays cancel actions, illegal actions become Wait.
  for (const p of s.players) {
    let a = s.pending[p.id]?.action ?? { type: "wait" };
    if (p.delayed) { log(`${p.name} stumbles and loses the round.`); p.delayed = false; a = { type: "wait" }; }
    else if (!isLegal(s, p, a)) a = { type: "wait" };
    acts.set(p.id, a);
  }
  // 2. Hold and Distract.
  const holders = s.players.filter((p) => acts.get(p.id)!.type === "hold");
  const distracters = new Set(s.players.filter((p) => acts.get(p.id)!.type === "distract").map((p) => p.id));
  for (const p of s.players) if (holders.includes(p) || distracters.has(p.id)) p.helped++;
  const hedgeOpen = holders.length > 0;
  for (const h of holders) log(`${h.name} holds the ${ROOMS[h.room].title}.`);

  // 3. Pick up and drop (drops first, then earliest seat takes the key).
  for (const p of s.players) if (acts.get(p.id)!.type === "drop" && p.hasKey) { p.hasKey = false; s.keyRoom = p.room; log(`${p.name} drops the iron key.`); }
  for (const p of s.players) {
    if (acts.get(p.id)!.type !== "pickup") continue;
    if (s.keyRoom === p.room && !p.hasKey) { p.hasKey = true; s.keyRoom = null; log(`${p.name} picks up the iron key.`); }
    else acts.set(p.id, { type: "wait" });
  }
  // 4. Use key.
  for (const p of s.players) {
    if (acts.get(p.id)!.type === "usekey" && p.hasKey && p.room === "glass_house" && !s.doorUnlocked) {
      s.doorUnlocked = true; p.hasKey = false; log("The east door of the Glass House unlocks.");
    }
  }
  // 5. Lanterns.
  for (const p of s.players) {
    if (acts.get(p.id)!.type === "light" && !p.lit && SHRINE_OF[p.lantern] === p.room) { p.lit = true; log(`${p.name} lights their ${p.lantern} lantern.`); }
  }
  // 6. Password.
  for (const p of s.players) {
    const a = acts.get(p.id)!;
    if (a.type === "speak" && p.room === "gate") {
      if (normalizePassword(a.text ?? "") === PASSWORD) { if (!s.passwordSolved) log(`${p.name} speaks the password. The gate answers.`); s.passwordSolved = true; }
      else log(`${p.name} speaks a word. The gate stays silent.`);
    }
  }
  // 7. Simultaneous moves.
  let hedgeShutLogged = false;
  const dests = new Map<string, RoomId>();
  for (const p of s.players) {
    const a = acts.get(p.id)!;
    if (a.type !== "move" || !a.dir) continue;
    const room = ROOMS[p.room];
    const to = room.exits[a.dir]!;
    if (room.hedge?.includes(a.dir) && !hedgeOpen) { if (!hedgeShutLogged) log("The hedge stays shut."); hedgeShutLogged = true; continue; }
    if (p.room === "gate" && to === "outer_lawn") {
      if (!s.passwordSolved) { log(`${p.name} pushes the gate, but it will not open without the password.`); continue; }
      if (!p.lit) { log(`${p.name} cannot pass the gate with an unlit lantern.`); continue; }
    }
    dests.set(p.id, to);
  }
  const discovered: RoomId[] = [];
  for (const p of s.players) {
    const to = dests.get(p.id);
    if (!to) continue;
    p.room = to;
    if (!s.visited.includes(to)) { s.visited.push(to); s.firstVisitor[to] = p.name; discovered.push(to); }
    if (to === "outer_lawn") { p.outAt = r; log(`${p.name} steps onto the Outer Lawn.`); }
    else if (p.outAt !== null) p.outAt = null;
  }
  // Share each newly explored room once, after all simultaneous arrivals are known.
  for (const roomId of discovered) s.log.push(roomTip(r, roomId, s.players));
  // 8. Groundskeeper.
  s.gkIndex = (s.gkIndex + 1) % GK_PATH.length;
  const gk = gkRoom(s);
  log(`The groundskeeper walks to ${ROOMS[gk].title}.`);
  // 9. Delay.
  const caught = s.players.filter((p) => p.room === gk);
  if (caught.length && !caught.some((p) => distracters.has(p.id))) {
    for (const p of caught) { p.delayed = true; log(`${p.name} is delayed.`); }
  } else if (caught.length) log("Someone distracts the groundskeeper.");
  // 10. Win / lose.
  s.pending = {};
  if (s.players.every((p) => p.room === "outer_lawn")) { s.phase = "won"; log("The gate closes behind you."); }
  else if (r >= ROUND_LIMIT) { s.phase = "lost"; log("Dawn comes. The garden locks again."); }
  else s.round = r + 1;
  return s;
}
