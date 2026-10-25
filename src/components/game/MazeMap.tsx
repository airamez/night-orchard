import { ROOMS, type RoomId } from "@/game/map";
import type { GameState } from "@/game/engine";

export function MazeMap({ state, me, full = false, label = "Map of explored rooms" }: { state: Pick<GameState, "visited" | "players" | "doorUnlocked">; me?: string; full?: boolean; label?: string }) {
  const visited = new Set(full ? Object.values(ROOMS).map((room) => room.id) : state.visited);
  const myRoom = state.players.find((p) => p.id === me)?.room;
  const edges: { a: RoomId; b: RoomId; hedge: boolean; locked: boolean }[] = [];
  const seen = new Set<string>();
  for (const id of visited) {
    const r = ROOMS[id];
    for (const [dir, to] of Object.entries(r.exits)) {
      if (!to) continue;
      const k = [id, to].sort().join("|");
      if (seen.has(k)) continue;
      seen.add(k);
      const neighbor = ROOMS[to];
      edges.push({ a: id, b: to, hedge: !!r.hedge?.some((d) => d === dir) || !!neighbor.hedge?.some((d) => neighbor.exits[d] === id), locked: !!(r.lockedExit === dir || neighbor.lockedExit && neighbor.exits[neighbor.lockedExit] === id) && !state.doorUnlocked });
    }
  }
  const shown = new Set<RoomId>(visited);
  for (const e of edges) { shown.add(e.a); shown.add(e.b); }

  return (
    <svg viewBox="0 -30 780 535" className="w-full min-w-[620px]" role="img" aria-label={label}>
      {edges.map((e) => {
        const [ax, y1] = ROOMS[e.a].pos; const [bx, y2] = ROOMS[e.b].pos;
        const x1 = (ax - 90) * 18 / 11 + 120; const x2 = (bx - 90) * 18 / 11 + 120;
        return <line key={e.a + e.b} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={e.hedge || e.locked ? 4 : 2}
          strokeDasharray={e.locked ? "6 5" : undefined}
          className={e.hedge || e.locked ? "stroke-shut" : "stroke-hedge"} />;
      })}
      {[...shown].map((id) => {
        const r = ROOMS[id]; const [rx, y] = r.pos; const known = visited.has(id);
        const x = (rx - 90) * 18 / 11 + 120;
        const here = state.players.filter((p) => p.room === id);
        return (
          <g key={id}>
            <circle cx={x} cy={y} r={id === myRoom ? 11 : 8}
              className={id === myRoom ? "fill-lantern" : known ? "fill-parchment" : "fill-muted stroke-border"} />
            <text x={x} y={y - 19} textAnchor="middle" className="fill-foreground text-[16px] font-sans">{known ? r.title : "?"}</text>
            {here.map((p, index) => (
              <g key={p.id} aria-label={`${p.name}${p.id === me ? " (you)" : ""} at ${r.title}`}>
                <title>{p.name}{p.id === me ? " (you)" : ""} — {r.title}</title>
                <circle cx={x + (index - (here.length - 1) / 2) * 22} cy={y + 24} r={10} className={p.id === me ? "fill-lantern" : "fill-parchment"} />
                <text x={x + (index - (here.length - 1) / 2) * 22} y={y + 29} textAnchor="middle" className="fill-ink text-[13px] font-sans font-bold">{state.players.findIndex((player) => player.id === p.id) + 1}</text>
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
