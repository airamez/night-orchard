import { it } from "vitest";
import { winningPlan } from "./winningPlan";
import { addPlayer, newLobby, startGame } from "./engine";
it("repro", () => {
  const s: any = {chat:[],doorUnlocked:false,firstVisitor:{},gkIndex:4,hostId:"a",keyRoom:"bell_lawn",log:[],password:"smoke bee raven vine",passwordSolved:false,pending:{},phase:"playing",
   players:[{delayed:false,hasKey:false,helped:2,id:"a",lantern:"Oak",lit:true,name:"Master",outAt:null,room:"sun_stone"},{delayed:true,hasKey:false,helped:0,id:"b",lantern:"Well",lit:true,name:"Player",outAt:null,room:"hedge_knot"}],round:11,visited:[]};
  let t=performance.now(); const r = winningPlan(s); console.log("repro", r.won, r.impossible, performance.now()-t);
  for (const n of [2,3,4,5,8]) {
  let l = newLobby("a","Master"); for (let i=1;i<n;i++) l = addPlayer(l, "p"+i, "P"+i);
  t=performance.now(); const p = winningPlan(startGame(l));
  console.log(n, p.won, p.steps.length, Math.round(performance.now()-t)+"ms");
  }
});
