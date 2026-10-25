import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, DoorOpen, Flame, Hand, Hourglass, Key, Mic, Music2, PackageMinus } from "lucide-react";
import type { Action } from "@/game/engine";
import type { Dir } from "@/game/map";

const DIR_ICON: Record<Dir, typeof ArrowUp> = { north: ArrowUp, south: ArrowDown, east: ArrowRight, west: ArrowLeft };

const TYPE_ICON: Record<Exclude<Action["type"], "move">, typeof Key> = {
  pickup: Key,
  drop: PackageMinus,
  usekey: DoorOpen,
  hold: Hand,
  light: Flame,
  wait: Hourglass,
  speak: Mic,
  distract: Music2,
};

/** Small icon for an action: direction arrows for moves, themed icons for everything else. */
export function ActionIcon({ action, size = 16, className }: { action: Action | undefined; size?: number; className?: string }) {
  if (!action) return null;
  const Icon = action.type === "move" && action.dir ? DIR_ICON[action.dir] : TYPE_ICON[action.type];
  if (!Icon) return null;
  return <Icon size={size} strokeWidth={2.25} aria-hidden="true" className={className} />;
}
