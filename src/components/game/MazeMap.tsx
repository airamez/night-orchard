import { ROOMS, type RoomId } from "@/game/map";
import type { GameState } from "@/game/engine";

export function MazeMap({ state, me }: { state: GameState; me?: string }) {
  const visited = new Set(state.visited);
  const myRoom = state.players.find((p) => p.id === me)?.room;
  const edges: { a: RoomId; b: RoomId; hedge: boolean; locked: boolean }[] = [];
  const seen = new Set<string>();
  for (const id of visited) {
    const r = ROOMS[id];
    for (const [dir, to] of Object.entries(r.exits)) {
      const k = [id, to].sort().join("|");
      if (seen.has(k)) continue;
      seen.add(k);
      edges.push({ a: id, b: to!, hedge: !!r.hedge?.includes(dir as never) || !!ROOMS[to!].hedge?.some((d) => ROOMS[to!].exits[d] === id), locked: (r.lockedExit === dir || ROOMS[to!].lockedExit && ROOMS[to!].exits[ROOMS[to!].lockedExit!] === id) && !state.doorUnlocked });
    }
  }
  const shown = new Set<RoomId>(visited);
  for (const e of edges) { shown.add(e.a); shown.add(e.b); }

  return (
    <svg viewBox="40 -10 440 490" className="w-full" role="img" aria-label="Map of explored rooms">
      {edges.map((e) => {
        const [x1, y1] = ROOMS[e.a].pos; const [x2, y2] = ROOMS[e.b].pos;
        return <line key={e.a + e.b} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={e.hedge || e.locked ? 4 : 2}
          strokeDasharray={e.locked ? "6 5" : undefined}
          className={e.hedge || e.locked ? "stroke-shut" : "stroke-hedge"} />;
      })}
      {[...shown].map((id) => {
        const r = ROOMS[id]; const [x, y] = r.pos; const known = visited.has(id);
        const here = state.players.filter((p) => p.room === id);
        return (
          <g key={id}>
            <circle cx={x} cy={y} r={id === myRoom ? 11 : 8}
              className={id === myRoom ? "fill-lantern" : known ? "fill-parchment" : "fill-muted stroke-border"} />
            <text x={x} y={y - 15} textAnchor="middle" className="fill-foreground text-[11px] font-sans">{known ? r.title : "?"}</text>
            {here.length > 0 && <text x={x} y={y + 24} textAnchor="middle" className="fill-lantern text-[10px]">{here.map((p) => p.name).join(", ")}</text>}
          </g>
        );
      })}
    </svg>
  );
}
