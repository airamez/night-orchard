import { describe, expect, it } from "vitest";
import { addPlayer, newLobby, resolve, startGame } from "./engine";
import { lockWarnings, winningPlan } from "./winningPlan";

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
        expect(step.players.map((p) => p.id)).toEqual(state.players.map((p) => p.id));
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
  it("keeps an already locked action when planning the current round", () => {
    const state = startGame(addPlayer(newLobby("p0", "Jose"), "p1", "Leila"));
    state.pending["p0"] = { action: { type: "wait" }, locked: true };
    const plan = winningPlan(state);
    expect(plan.steps[0]?.players.find((p) => p.id === "p0")?.action).toEqual({ type: "wait" });
    expect(plan.won).toBe(true);
  });

  function playOut(state: ReturnType<typeof startGame>) {
    const plan = winningPlan(state);
    for (const step of plan.steps) {
      state.pending = Object.fromEntries(step.players.map((p) => [p.id, { action: p.action, locked: true }]));
      state = resolve(state);
    }
    return { plan, state };
  }

  it("recovers after the rose walk holder abandons the hold and reaches the gate", () => {
    let state = startGame(addPlayer(newLobby("p0", "Jose"), "p1", "Leila"));
    state.players[0]!.room = "hedge_knot"; state.players[0]!.lit = true;
    state.players[1]!.room = "gate"; state.players[1]!.lit = true;
    state.round = 10;
    const { plan, state: end } = playOut(state);
    expect(plan.won).toBe(true);
    expect(end.phase).toBe("won");
  });

  it("rescues a lone lit player left behind the hedge after everyone escaped", () => {
    let state = startGame(addPlayer(newLobby("p0", "Jose"), "p1", "Leila"));
    state.players[0]!.room = "hedge_knot"; state.players[0]!.lit = true;
    state.players[1]!.room = "outer_lawn"; state.players[1]!.lit = true; state.players[1]!.outAt = 8;
    state.round = 8; state.passwordSolved = true;
    const { plan, state: end } = playOut(state);
    expect(plan.won).toBe(true);
    expect(end.phase).toBe("won");
  });

  it("brings an unlit player stuck past the hedge back to their shrine", () => {
    let state = startGame(addPlayer(newLobby("p0", "Jose"), "p1", "Leila"));
    state.players[0]!.room = "rose_walk"; state.players[0]!.lit = false;
    state.players[1]!.room = "hedge_knot"; state.players[1]!.lit = true;
    state.round = 4;
    const { plan, state: end } = playOut(state);
    expect(plan.won).toBe(true);
    expect(end.phase).toBe("won");
  });

  it("downgrades a locked action that is no longer legal instead of giving up", () => {
    let state = startGame(addPlayer(newLobby("p0", "Jose"), "p1", "Leila"));
    // Distract is only legal when the groundskeeper is about to enter your room.
    state.pending["p0"] = { action: { type: "distract" }, locked: true };
    const { plan, state: end } = playOut(state);
    expect(plan.steps.length).toBeGreaterThan(0);
    expect(plan.won).toBe(true);
    expect(end.phase).toBe("won");
  });

  it("recovers when the whole team waits a round off-plan", () => {
    let lobby = newLobby("p0", "Jose");
    for (let i = 1; i < 4; i++) lobby = addPlayer(lobby, `p${i}`, `Player ${i}`);
    let state = startGame(lobby);
    const plan = winningPlan(state);
    for (const step of plan.steps.slice(0, 5)) {
      state.pending = Object.fromEntries(step.players.map((p) => [p.id, { action: p.action, locked: true }]));
      state = resolve(state);
    }
    state.pending = Object.fromEntries(state.players.map((p) => [p.id, { action: { type: "wait" } as const, locked: true }]));
    state = resolve(state);
    const { plan: recovery, state: end } = playOut(state);
    expect(recovery.won).toBe(true);
    expect(end.phase).toBe("won");
  });

  // Jose's two-player room T3CA at round 11: one player delayed at the Hedge Knot.
  function tightTwoPlayer(round: number, gkIndex: number, delayed: boolean) {
    const state = startGame(addPlayer(newLobby("p0", "Master"), "p1", "Player"));
    state.round = round; state.gkIndex = gkIndex;
    state.players[0]!.room = "sun_stone"; state.players[0]!.lit = true;
    state.players[1]!.room = "hedge_knot"; state.players[1]!.lit = true; state.players[1]!.delayed = delayed;
    return state;
  }

  it("proves the escape is impossible when dawn can no longer be beaten", () => {
    const plan = winningPlan(tightTwoPlayer(11, 4, true));
    expect(plan.won).toBe(false);
    expect(plan.impossible).toBe(true);
  });

  it("warns when a locked Wait costs the escape, suggesting the winning move", () => {
    const state = tightTwoPlayer(10, 3, false);
    expect(winningPlan(state).won).toBe(true);
    state.pending["p1"] = { action: { type: "wait" }, locked: true };
    const warnings = lockWarnings(state, winningPlan(state));
    expect(warnings).toHaveLength(1);
    expect(warnings[0]!.id).toBe("p1");
    expect(warnings[0]!.suggested).toEqual({ type: "move", dir: "north" });
  });

  it("does not warn when the locked action matches the plan", () => {
    const state = tightTwoPlayer(10, 3, false);
    state.pending["p1"] = { action: { type: "move", dir: "north" }, locked: true };
    expect(lockWarnings(state, winningPlan(state))).toEqual([]);
  });
});
