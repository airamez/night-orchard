import { Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MazeMap } from "@/components/game/MazeMap";
import type { GameState } from "@/game/engine";
import { ROOMS } from "@/game/map";

type MapState = Pick<GameState, "visited" | "players" | "doorUnlocked">;

function Positions({ state, me }: { state: MapState; me?: string }) {
  if (!state.players.length) return null;
  return <ul aria-label="Player positions" className="grid gap-x-6 gap-y-2 border-t border-border pt-3 text-sm sm:grid-cols-2">
    {state.players.map((player, index) => <li key={player.id} className="flex items-start gap-2">
      <span className={`flex size-6 shrink-0 items-center justify-center rounded-full font-bold ${player.id === me ? "bg-lantern text-ink" : "bg-parchment text-ink"}`}>{index + 1}</span>
      <span className="min-w-0 break-words"><b>{player.name}{player.id === me ? " (you)" : ""}</b><span className="block text-muted-foreground">{ROOMS[player.room].title}</span></span>
    </li>)}
  </ul>;
}

export function MapView({ state, me, full = false }: { state: MapState; me?: string; full?: boolean }) {
  return <div className="min-w-0 space-y-3">
    <Dialog>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-serif text-xl">{full ? "The full maze" : "Team map"}</h3>
        <DialogTrigger asChild><Button variant="outline" size="sm"><Expand className="size-4" />Full map</Button></DialogTrigger>
      </div>
      <div className="overflow-x-auto"><MazeMap state={state} me={me} full={full} /></div>
      <Positions state={state} me={me} />
      <DialogContent aria-describedby={undefined} className="max-h-[92dvh] w-[calc(100%_-_2rem)] max-w-5xl overflow-y-auto p-4 sm:p-6">
        <DialogHeader><DialogTitle className="font-serif text-2xl">Night Orchard — full map</DialogTitle></DialogHeader>
        <div className="overflow-x-auto"><MazeMap state={state} me={me} full label="Entire Night Orchard maze and current player positions" /></div>
        <Positions state={state} me={me} />
      </DialogContent>
    </Dialog>
  </div>;
}