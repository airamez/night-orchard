import type { Lantern } from "@/game/map";

/**
 * Retro 12x12 pixel-art icons for each lantern and its shrine room.
 * `LanternPixels` renders the raw <rect> pixels inside an existing SVG
 * (used by the map); `LanternIcon` wraps them in a standalone <svg> for HTML.
 *
 * Every icon is drawn on its own dark plate so the same colors work on any
 * room-box header, including the lit (yellow) header of the room you are in.
 */

const PALETTE: Record<string, string> = {
  g: "var(--icon-leaf)",
  t: "var(--icon-trunk)",
  s: "var(--icon-stone)",
  d: "var(--icon-hole)",
  b: "var(--icon-brass)",
  h: "var(--icon-brass-hi)",
  m: "var(--icon-moon)",
  r: "var(--icon-roof)",
};

const GRIDS: Record<Lantern, string[]> = {
  Oak: [
    "...ggggg....",
    "..ggggggg...",
    ".ggggggggg..",
    ".ggggggggg..",
    "ggggggggggg.",
    ".ggggggggg..",
    "..ggggggg...",
    "....ttt.....",
    "....ttt.....",
    "....ttt.....",
    "...ttttt....",
    "............",
  ],
  Well: [
    "..rrrrrrrr..",
    ".rrrrrrrrrr.",
    "..s......s..",
    "..s......s..",
    "..s......s..",
    ".ssssssssss.",
    ".sdddddddds.",
    ".sdddddddds.",
    ".ssssssssss.",
    ".ssssssssss.",
    ".ssssssssss.",
    "............",
  ],
  Bell: [
    "....dddd....",
    "....bbbb....",
    "...bbbbbb...",
    "...bbbbbb...",
    "..bbbbbbbb..",
    "..bbbbbbbb..",
    "..bbbbbbbb..",
    ".bbbbbbbbbb.",
    ".bbbbbbbbbb.",
    "bbbbbbbbbbbb",
    "dddddddddddd",
    ".....dd.....",
  ],
  Moon: [
    "....mmmm....",
    "..mmmm......",
    ".mmmm.......",
    ".mmm........",
    "mmmm........",
    "mmmm........",
    "mmmm........",
    ".mmm........",
    ".mmmm.......",
    "..mmmm......",
    "....mmmm....",
    "............",
  ],
};

export const LANTERN_ICON_LABEL: Record<Lantern, string> = {
  Oak: "oak tree",
  Well: "stone well",
  Bell: "brass bell",
  Moon: "crescent moon",
};

/** Raw pixels for embedding inside another SVG. Grid origin is (0,0); scale via the parent <g>. */
export function LanternPixels({ lantern }: { lantern: Lantern }) {
  const rects: { x: number; y: number; fill: string }[] = [];
  GRIDS[lantern].forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const fill = PALETTE[ch];
      if (fill) rects.push({ x, y, fill });
    });
  });
  return (
    <g shapeRendering="crispEdges">
      <rect x={-0.8} y={-0.8} width={13.6} height={13.6} rx={1.8} fill="var(--icon-plate)" stroke="var(--icon-plate-edge)" strokeWidth={0.35} />
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={1} height={1} fill={r.fill} />
      ))}
    </g>
  );
}

/** Standalone inline icon for HTML content. */
export function LanternIcon({ lantern, size = 18, className }: { lantern: Lantern; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-1.4 -1.4 14.8 14.8"
      role="img"
      aria-label={`${lantern} lantern icon: ${LANTERN_ICON_LABEL[lantern]}`}
      className={`inline-block align-[-3px] ${className ?? ""}`}
    >
      <LanternPixels lantern={lantern} />
    </svg>
  );
}
