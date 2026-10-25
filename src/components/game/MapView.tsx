import { Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MazeMap } from "@/components/game/MazeMap";
import type { GameState } from "@/game/engine";

type MapState = Pick<GameState, "visited" | "players" | "doorUnlocked">;

export function MapView({ state, me, full = false }: { state: MapState; me?: string; full?: boolean }) {
  return <div className="min-w-0 space-y-3">
    <Dialog>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-serif text-xl">{full ? "The full maze" : "Team map"}</h3>
        <DialogTrigger asChild><Button variant="outline" size="sm"><Expand className="size-4" />Full map</Button></DialogTrigger>
      </div>
      <div className="overflow-x-auto"><MazeMap state={state} me={me} full={full} /></div>
      <DialogContent aria-describedby={undefined} className="max-h-[92dvh] w-[calc(100%_-_2rem)] max-w-5xl overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pr-8 text-left"><DialogTitle className="font-serif text-2xl">Night Orchard — full map</DialogTitle></DialogHeader>
        <div className="overflow-x-auto"><MazeMap state={state} me={me} full label="Entire Night Orchard maze and current player positions" /></div>
      </DialogContent>
    </Dialog>
  </div>;
}