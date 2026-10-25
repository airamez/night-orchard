import { ROOMS, type RoomId } from "@/game/map";
import type { GameState } from "@/game/engine";

export function MazeMap({ state, me, full = false, label = "Map of explored rooms" }: { state: Pick<GameState, "visited" | "players" | "doorUnlocked">; me?: string | undefined; full?: boolean; label?: string }) {
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
  const rows = [...new Set(Object.values(ROOMS).map((room) => room.pos[1]))].sort((a, b) => a - b);
  const rowY = new Map<number, number>();
  let nextY = 0;
  for (const row of rows) {
    rowY.set(row, nextY);
    const occupants = Math.max(0, ...Object.values(ROOMS).filter((room) => room.pos[1] === row).map((room) => state.players.filter((player) => player.room === room.id).length));
    nextY += Math.max(78, 54 + occupants * 20);
  }
  const position = (id: RoomId): [number, number] => [(ROOMS[id].pos[0] - 90) * 21 / 11, rowY.get(ROOMS[id].pos[1]) ?? 0];
  const points = [...shown].map((id) => {
    const [x, y] = position(id);
    return { x, y, bottom: y + Math.max(12, state.players.filter((player) => player.room === id).length * 20 + 10) };
  });
  const left = (points.length ? Math.min(...points.map((point) => point.x)) : 0) - 110;
  const right = Math.max(0, ...points.map((point) => point.x)) + 110;
  const top = Math.min(...points.map((point) => point.y), 0);
  const visibleTop = points.length ? Math.min(...points.map((point) => point.y)) - 38 : top - 38;
  const bottom = Math.max(0, ...points.map((point) => point.bottom)) + 12;

  return (
    <svg viewBox={`${left} ${visibleTop} ${right - left} ${bottom - visibleTop}`} className="w-full min-w-[620px]" role="img" aria-label={label}>
      {edges.map((e) => {
        const [x1, y1] = position(e.a); const [x2, y2] = position(e.b);
        return <line key={e.a + e.b} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={e.hedge || e.locked ? 4 : 2}
          strokeDasharray={e.locked ? "6 5" : undefined}
          className={e.hedge || e.locked ? "stroke-shut" : "stroke-hedge"} />;
      })}
      {[...shown].map((id) => {
        const r = ROOMS[id]; const [x, y] = position(id); const known = visited.has(id);
        const here = state.players.filter((p) => p.room === id);
        return (
          <g key={id}>
            <circle cx={x} cy={y} r={here.length ? 10 : 7}
              className={id === myRoom ? "fill-lantern" : known ? "fill-parchment" : "fill-muted stroke-border"} />
            <text x={x} y={y - 19} textAnchor="middle" className="fill-foreground text-[18px] font-sans">{known ? r.title : "?"}</text>
            {here.map((p, index) => (
              <g key={p.id} aria-label={`${p.name}${p.id === me ? " (you)" : ""} at ${r.title}`}>
                <title>{p.name}{p.id === me ? " (you)" : ""} — {r.title}</title>
                <text x={x} y={y + 29 + index * 20} textAnchor="middle" textLength={p.name.length > 18 ? 180 : undefined} lengthAdjust="spacingAndGlyphs" className={`${p.id === me ? "fill-lantern" : "fill-parchment"} text-[16px] font-sans font-bold`}>{p.name}</text>
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
