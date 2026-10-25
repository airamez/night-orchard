import { it } from "vitest";
import { winningPlan } from "./winningPlan";
import { resolve } from "./engine";
import { GK_PATH } from "./map";
it("repro", () => {
  const s: any = {chat:[],doorUnlocked:false,firstVisitor:{},gkIndex:4,hostId:"a",keyRoom:"bell_lawn",log:[],password:"smoke bee raven vine",passwordSolved:false,pending:{},phase:"playing",
   players:[{delayed:false,hasKey:false,helped:2,id:"a",lantern:"Oak",lit:true,name:"Master",outAt:null,room:"sun_stone"},{delayed:true,hasKey:false,helped:0,id:"b",lantern:"Well",lit:true,name:"Player",outAt:null,room:"hedge_knot"}],round:11,visited:[]};
  const p = winningPlan(s);
  console.log(p.won, GK_PATH, JSON.stringify(p.steps.map(st=>[st.round, st.players.map(x=>x.room+":"+JSON.stringify(x.action))])));
});
