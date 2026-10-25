import { it } from "vitest";
import { winningPlan } from "./winningPlan";
import { addPlayer, newLobby, startGame } from "./engine";
it("repro", { timeout: 120000 }, () => {
  for (const n of [2,3,4,5,8]) {
  let l = newLobby("a","Master"); for (let i=1;i<n;i++) l = addPlayer(l, "p"+i, "P"+i);
  const t=performance.now(); const p = winningPlan(startGame(l));
  console.log(n, p.won, p.steps.length, Math.round(performance.now()-t)+"ms");
  }
});
