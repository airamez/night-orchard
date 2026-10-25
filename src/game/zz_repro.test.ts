import { it } from "vitest";
import { winningPlan } from "./winningPlan";
import { addPlayer, newLobby, startGame } from "./engine";
it("repro", () => {
  for (const n of [2,3,4,5,6,8]) {
  let l = newLobby("a","Master"); for (let i=1;i<n;i++) l = addPlayer(l, "p"+i, "P"+i);
  const p = winningPlan(startGame(l));
  console.log(n, p.won, p.steps.length);
  if (n===2) console.log(p.steps.map(st=>st.round+" "+st.players.map(x=>x.room+":"+x.action.type+(x.action.dir??"")).join(" | ")).join("\n"));
  }
});
