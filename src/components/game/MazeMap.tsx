import { ROOMS, type RoomId } from "@/game/map";
import type { GameState } from "@/game/engine";
import { LanternPixels, LANTERN_ICON_LABEL } from "@/components/game/LanternIcon";

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
  const roomWidth = 150;
  const headerHeight = 26;
  const playerLineHeight = 18;
  const bodyHeight = (id: RoomId) => {
    const count = state.players.filter((player) => player.room === id).length;
    return count ? count * playerLineHeight + 8 : 6;
  };
  const height = (id: RoomId) => headerHeight + bodyHeight(id);
  const rows = [...new Set([...shown].map((id) => ROOMS[id].pos[1]))].sort((a, b) => a - b);
  const rowY = new Map<number, number>();
  let nextY = 0;
  for (const row of rows) {
    rowY.set(row, nextY);
    nextY += Math.max(...[...shown].filter((id) => ROOMS[id].pos[1] === row).map(height)) + 28;
  }
  const position = (id: RoomId): [number, number] => [(ROOMS[id].pos[0] - 90) / 110 * (roomWidth + 24), rowY.get(ROOMS[id].pos[1]) ?? 0];
  const points = [...shown].map((id) => {
    const [x, y] = position(id);
    return { x, y, bottom: y + height(id) };
  });
  const left = (points.length ? Math.min(...points.map((point) => point.x)) : 0) - roomWidth / 2 - 3;
  const right = (points.length ? Math.max(...points.map((point) => point.x)) : 0) + roomWidth / 2 + 3;
  const visibleTop = (points.length ? Math.min(...points.map((point) => point.y)) : 0) - 3;
  const bottom = Math.max(42, ...points.map((point) => point.bottom)) + 3;

  return (
    <svg viewBox={`${left} ${visibleTop} ${right - left} ${bottom - visibleTop}`} className="w-full" role="img" aria-label={label}>
      {edges.map((e) => {
        const [ax, ay] = position(e.a); const [bx, by] = position(e.b);
        const horizontal = ay === by;
        const direction = horizontal ? Math.sign(bx - ax) : Math.sign(by - ay);
        const x1 = horizontal ? ax + direction * roomWidth / 2 : ax;
        const x2 = horizontal ? bx - direction * roomWidth / 2 : bx;
        const y1 = horizontal ? ay + headerHeight / 2 : direction > 0 ? ay + height(e.a) : ay;
        const y2 = horizontal ? by + headerHeight / 2 : direction > 0 ? by : by + height(e.b);
        return <line key={e.a + e.b} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={e.hedge || e.locked ? 4 : 2}
          strokeDasharray={e.locked ? "6 5" : undefined}
          className={e.hedge || e.locked ? "stroke-shut" : "stroke-hedge"} />;
      })}
      {[...shown].map((id) => {
        const r = ROOMS[id]; const [x, y] = position(id); const known = visited.has(id);
        const here = state.players.filter((p) => p.room === id);
        return (
          <g key={id} aria-label={`${r.title}${known ? "" : " (unexplored)"}, ${here.length} players`}>
            <rect x={x - roomWidth / 2} y={y} width={roomWidth} height={height(id)} rx={6}
              strokeWidth={id === myRoom ? 2 : 1} className={`fill-card ${id === myRoom ? "stroke-lantern" : known ? "stroke-border" : "stroke-muted-foreground/30"}`} />
            <path d={`M ${x - roomWidth / 2 + 6} ${y} H ${x + roomWidth / 2 - 6} Q ${x + roomWidth / 2} ${y} ${x + roomWidth / 2} ${y + 6} V ${y + headerHeight} H ${x - roomWidth / 2} V ${y + 6} Q ${x - roomWidth / 2} ${y} ${x - roomWidth / 2 + 6} ${y} Z`}
              className={id === myRoom ? "fill-lantern" : known ? "fill-hedge" : "fill-muted"} />
            {r.shrine && (
              <g transform={`translate(${x - roomWidth / 2 + 5} ${y + 4}) scale(1.5)`} aria-label={`${r.shrine} lantern shrine icon: ${LANTERN_ICON_LABEL[r.shrine]}`}>
                <LanternPixels lantern={r.shrine} />
              </g>
            )}
            <text x={x + (r.shrine ? 8 : 0)} y={y + headerHeight / 2} dominantBaseline="middle" textAnchor="middle"
              className={`${id === myRoom ? "fill-ink" : known ? "fill-parchment" : "fill-muted-foreground"} text-[13px] font-sans font-bold ${known ? "" : "opacity-70"}`}>{r.title}</text>
            {here.map((p, index) => {
              const rowY = y + headerHeight + 5 + playerLineHeight * (index + 0.5);
              const icon = 11;
              const gap = 5;
              const pad = 8;
              const est = Math.min(p.name.length * 6.9, roomWidth - pad * 2 - icon - gap);
              const startX = x - roomWidth / 2 + pad;

              return (
                <g key={p.id} aria-label={`${p.name}${p.id === me ? " (you)" : ""} at ${r.title} with the ${p.lantern} lantern`}>
                  <title>{p.name}{p.id === me ? " (you)" : ""} — {r.title} · {p.lantern} lantern</title>
                  <g transform={`translate(${startX} ${rowY - icon / 2}) scale(${icon / 12})`} aria-label={`${p.lantern} lantern icon: ${LANTERN_ICON_LABEL[p.lantern]}`}>
                    <LanternPixels lantern={p.lantern} />
                  </g>
                  <text x={startX + icon + gap} y={rowY} dominantBaseline="middle" textAnchor="start" textLength={est} lengthAdjust="spacingAndGlyphs" className={`${p.id === me ? "fill-lantern" : "fill-parchment"} text-[12px] font-sans font-bold`}>{p.name}</text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
