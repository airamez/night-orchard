import { describe, expect, it } from "vitest";
import { addPlayer, newLobby, resolve, startGame, type Action, type GameState } from "./engine";

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

  it("hedge stays shut without a holder and opens with one", () => {
    let s = game(4);
    s = resolve(act(s, { p3: { type: "move", dir: "north" } }));
    expect(s.players[3].room).toBe("hedge_knot");
    s.players[0].room = "sun_stone";
    s = resolve(act(s, { p0: { type: "hold" }, p3: { type: "move", dir: "north" } }));
    expect(s.players[3].room).toBe("rose_walk");
  });

  it("gate needs the password and a lit lantern", () => {
    let s = game(2);
    s.players[0].room = "gate";
    s = resolve(act(s, { p0: { type: "speak", text: "  NightBloom " } }));
    expect(s.passwordSolved).toBe(true);
    s = resolve(act(s, { p0: { type: "move", dir: "north" } }));
    expect(s.players[0].room).toBe("gate");
    s.players[0].lit = true;
    s = resolve(act(s, { p0: { type: "move", dir: "north" } }));
    expect(s.players[0].room).toBe("outer_lawn");
  });

  it("earlier seat gets the key when two take it", () => {
    let s = game(2);
    s.players[0].room = "bell_lawn";
    s = resolve(act(s, { p0: { type: "pickup" }, p1: { type: "pickup" } }));
    expect(s.players[0].hasKey).toBe(true);
    expect(s.players[1].hasKey).toBe(false);
  });

  it("groundskeeper delays players unless someone distracts", () => {
    let s = game(2); // gk moves to bell_lawn where p1 stands
    s = resolve(act(s, {}));
    expect(s.players[1].delayed).toBe(true);
    let t = game(2);
    t = resolve(act(t, { p1: { type: "distract" } }));
    expect(t.players[1].delayed).toBe(false);
  });

  it("loses after round 16", () => {
    let s = game(2);
    for (let i = 0; i < 16; i++) s = resolve(act(s, {}));
    expect(s.phase).toBe("lost");
  });
});
