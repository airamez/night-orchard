import { describe, expect, it } from "vitest";
import { addPlayer, isLegal, newLobby, removePlayer, resolve, startGame, type Action, type GameState } from "./engine";
import { PASSWORD_PHRASES, PASSWORD_WORD_COUNT, passwordClue } from "./map";

function game(n = 2): GameState {
  let s = newLobby("p0", "P0");
  for (let i = 1; i < n; i++) s = addPlayer(s, `p${i}`, `P${i}`);
  return startGame(s);
}
const act = (s: GameState, m: Record<string, Action>) => ({ ...s, pending: Object.fromEntries(Object.entries(m).map(([k, a]) => [k, { action: a, locked: true }])) });

describe("Night Orchard rules", () => {
  it("deals start rooms and lanterns by join order", () => {
    const s = game(5);
    expect(s.players.map((p) => p.room)).toEqual(["fountain", "bell_lawn", "well", "hedge_knot", "fountain"]);
    expect(s.players.map((p) => p.lantern)).toEqual(["Oak", "Well", "Bell", "Moon", "Oak"]);
  });

  it("shares all starting room tips once for the team without posting to chat", () => {
    const s = game(5);
    expect(s.log.filter((entry) => entry.roomId).map((entry) => entry.roomId))
      .toEqual(["fountain", "bell_lawn", "well", "hedge_knot"]);
    expect(s.log.filter((entry) => entry.roomId).every((entry) => entry.r === 1)).toBe(true);
    expect(s.chat).toEqual([]);
  });

  it("shares newly reached room tips in the resolved round without revealing unvisited rooms", () => {
    const s = resolve(act(game(), { p0: { type: "move", dir: "north" } }));
    expect(s.log.filter((entry) => entry.roomId).map((entry) => [entry.roomId, entry.r]))
      .toEqual([["fountain", 1], ["bell_lawn", 1], ["hedge_knot", 1]]);
    expect(s.chat).toEqual([]);
  });

  it("does not repeat room tips for simultaneous arrivals, waiting, or revisits", () => {
    let s = resolve(act(game(), { p0: { type: "move", dir: "north" }, p1: { type: "move", dir: "west" } }));
    s = resolve(act(s, {}));
    s = resolve(act(s, { p0: { type: "move", dir: "south" } }));
    s = resolve(act(s, { p0: { type: "move", dir: "north" } }));
    expect(s.log.filter((entry) => entry.roomId === "hedge_knot")).toHaveLength(1);
    expect(s.log.filter((entry) => entry.roomId === "fountain")).toHaveLength(1);
  });

  it("reshare starting tips on restart with no old discoveries", () => {
    const s = startGame(resolve(act(game(), { p0: { type: "move", dir: "north" } })));
    expect(s.log.filter((entry) => entry.roomId).map((entry) => entry.roomId))
      .toEqual(["fountain", "bell_lawn"]);
  });

  it("restarts the whole team at round 1 while retaining seats and chat", () => {
    const previous = resolve(act(game(), { p0: { type: "move", dir: "north" } }));
    previous.doorUnlocked = true;
    previous.passwordSolved = true;
    previous.keyRoom = null;
    previous.players = previous.players.map((p) => ({ ...p, lit: true, hasKey: true, helped: 2 }));
    previous.pending = { p0: { action: { type: "wait" }, locked: true } };
    previous.chat = [{ name: "Jose", text: "Try again together", t: 1 }];
    const restarted = startGame(previous);
    expect(restarted.round).toBe(1);
    expect(restarted.phase).toBe("playing");
    expect(restarted.hostId).toBe(previous.hostId);
    expect(restarted.players.map((p) => p.id)).toEqual(previous.players.map((p) => p.id));
    expect(restarted.players.map((p) => p.room)).toEqual(["fountain", "bell_lawn"]);
    expect(restarted.players.every((p) => !p.lit && !p.hasKey && !p.delayed && p.helped === 0)).toBe(true);
    expect(restarted.keyRoom).toBe("bell_lawn");
    expect(restarted.doorUnlocked).toBe(false);
    expect(restarted.passwordSolved).toBe(false);
    expect(restarted.pending).toEqual({});
    expect(restarted.chat).toEqual(previous.chat);
  });

  it("hedge stays shut without a holder and opens with one", () => {
    let s = game(4);
    s = resolve(act(s, { p3: { type: "move", dir: "north" } }));
    expect(s.players[3]!.room).toBe("hedge_knot");
    s.players[0]!.room = "sun_stone";
    s = resolve(act(s, { p0: { type: "hold" }, p3: { type: "move", dir: "north" } }));
    expect(s.players[3]!.room).toBe("rose_walk");
  });

  it("gate needs the password and a lit lantern", () => {
    let s = game(2);
    s.password = "nightbloom moonvine";
    s.players[0]!.room = "gate";
    s = resolve(act(s, { p0: { type: "speak", text: "  NightBloom  MoonVine " } }));
    expect(s.passwordSolved).toBe(true);
    s = resolve(act(s, { p0: { type: "move", dir: "north" } }));
    expect(s.players[0]!.room).toBe("gate");
    s.players[0]!.lit = true;
    s = resolve(act(s, { p0: { type: "move", dir: "north" } }));
    expect(s.players[0]!.room).toBe("outer_lawn");
  });

  it("every game draws its password words from the phrase list", () => {
    const s = game(3);
    const words = s.password.split(" ");
    expect(words).toHaveLength(PASSWORD_WORD_COUNT);
    expect(words.every((w) => PASSWORD_PHRASES.includes(w))).toBe(true);
    expect(new Set(words).size).toBe(words.length);
  });

  it("restart draws a fresh password from the list and the gate accepts it", () => {
    let s = startGame(game(2));
    expect(PASSWORD_PHRASES).toContain(...s.password.split(" "));
    s.players[0]!.room = "gate";
    s = resolve(act(s, { p0: { type: "speak", text: s.password.toUpperCase() } }));
    expect(s.passwordSolved).toBe(true);
  });

  it("the password words must be spoken in the carved order", () => {
    let s = game(2);
    s.password = "nightbloom moonvine";
    s.players[0]!.room = "gate";
    s = resolve(act(s, { p0: { type: "speak", text: "moonvine nightbloom" } }));
    expect(s.passwordSolved).toBe(false);
    s = resolve(act(s, { p0: { type: "speak", text: "nightbloom moonvine" } }));
    expect(s.passwordSolved).toBe(true);
  });

  it("the orchard clue shows every password word in order", () => {
    expect(passwordClue("nightbloom moonvine"))
      .toBe("The night flowers are called NIGHTBLOOM and MOONVINE — speak them at the Gate, in this order.");
  });

  it("the phrase list offers many unique lowercase words", () => {
    expect(new Set(PASSWORD_PHRASES).size).toBeGreaterThan(5);
    expect(PASSWORD_PHRASES.every((p) => /^[a-z]+$/.test(p))).toBe(true);
  });

  it("earlier seat gets the key when two take it", () => {
    let s = game(2);
    s.players[0]!.room = "bell_lawn";
    s = resolve(act(s, { p0: { type: "pickup" }, p1: { type: "pickup" } }));
    expect(s.players[0]!.hasKey).toBe(true);
    expect(s.players[1]!.hasKey).toBe(false);
  });

  it("groundskeeper delays players unless someone distracts", () => {
    let s = game(2); // gk moves to bell_lawn where p1 stands
    s = resolve(act(s, {}));
    expect(s.players[1]!.delayed).toBe(true);
    let t = game(2);
    t = resolve(act(t, { p1: { type: "distract" } }));
    expect(t.players[1]!.delayed).toBe(false);
  });

  it("distract is only legal the round the groundskeeper walks into your room", () => {
    const s = game(2); // gk at oak_shrine, next stop bell_lawn where p1 stands
    expect(isLegal(s, s.players[1]!, { type: "distract" })).toBe(true);
    expect(isLegal(s, s.players[0]!, { type: "distract" })).toBe(false);
  });

  it("loses after round 16", () => {
    let s = game(2);
    for (let i = 0; i < 16; i++) s = resolve(act(s, {}));
    expect(s.phase).toBe("lost");
  });

  it("a removed player no longer blocks the round and the host role passes on", () => {
    let s = game(3);
    s = removePlayer(s, "p0");
    expect(s.players.map((p) => p.id)).toEqual(["p1", "p2"]);
    expect(s.hostId).toBe("p1");
    s = act(s, { p1: { type: "wait" } });
    s.pending["p2"] = { action: { type: "wait" }, locked: true };
    s = resolve(s);
    expect(s.round).toBe(2);
  });

  it("the game is won when the only players left inside are removed", () => {
    let s = game(2);
    s.players[0]!.room = "outer_lawn";
    s.players[0]!.outAt = 1;
    s = removePlayer(s, "p1");
    expect(s.phase).toBe("won");
  });
});
