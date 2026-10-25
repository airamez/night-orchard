import type { GameState, Player } from "./engine";

function demoPlayer(id: string, name: string, lantern: Player["lantern"], room: Player["room"], outAt: number | null, helped: number): Player {
  return { id, name, room, lantern, lit: true, hasKey: false, delayed: false, outAt, helped };
}

/** A finished example game used by the /demo/victory and /demo/defeat preview pages. */
export function sampleEndState(won: boolean): GameState {
  const players: Player[] = won
    ? [
        demoPlayer("p1", "Jose", "Oak", "outer_lawn", 12, 2),
        demoPlayer("p2", "Leila", "Well", "outer_lawn", 13, 3),
        demoPlayer("p3", "Artur", "Bell", "outer_lawn", 14, 1),
        demoPlayer("p4", "Airamez", "Moon", "outer_lawn", 14, 0),
      ]
    : [
        demoPlayer("p1", "Jose", "Oak", "outer_lawn", 15, 2),
        demoPlayer("p2", "Leila", "Well", "rose_walk", null, 3),
        demoPlayer("p3", "Artur", "Bell", "hedge_knot", null, 1),
        demoPlayer("p4", "Airamez", "Moon", "moon_arch", null, 0),
      ];
  return {
    phase: won ? "won" : "lost",
    hostId: "p1",
    players,
    round: won ? 14 : 16,
    keyRoom: null,
    doorUnlocked: true,
    passwordSolved: true,
    gkIndex: 3,
    visited: ["fountain", "bell_lawn", "well", "hedge_knot", "oak_shrine", "glass_house", "orchard", "rose_walk", "gate", "outer_lawn"],
    firstVisitor: { fountain: "Jose", orchard: "Artur", hedge_knot: "Airamez" },
    pending: {},
    log: [],
    chat: [],
  };
}
