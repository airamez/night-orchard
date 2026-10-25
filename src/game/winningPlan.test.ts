import { describe, expect, it } from "vitest";
import { addPlayer, newLobby, resolve, startGame } from "./engine";
import { winningPlan } from "./winningPlan";

describe("testing winning guide", () => {
  for (const count of [2, 3, 4, 5, 6, 7, 8]) {
    it(`escapes with ${count} players within 16 rounds without changing the game`, () => {
      let lobby = newLobby("p0", "Jose");
      for (let i = 1; i < count; i++) lobby = addPlayer(lobby, `p${i}`, `Player ${i}`);
      let state = startGame(lobby);
      const before = structuredClone(state);
      const plan = winningPlan(state);
      expect(state).toEqual(before);
      expect(plan.won).toBe(true);
      for (const step of plan.steps) {
        expect(step.round).toBeLessThanOrEqual(16);
        state.pending = Object.fromEntries(step.players.map((p) => [p.id, { action: p.action, locked: true }]));
        state = resolve(state);
      }
      expect(state.phase).toBe("won");
      expect(state.players.every((p) => p.lit && p.room === "outer_lawn")).toBe(true);
    });
  }
  it("does not promise a win when dawn is too close", () => {
    const state = startGame(addPlayer(newLobby("p0", "Jose"), "p1", "Leila"));
    state.round = 16;
    expect(winningPlan(state).won).toBe(false);
  });
});