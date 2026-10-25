import type { Lantern } from "@/game/map";

/**
 * Retro 12x12 pixel-art icons for each lantern and its shrine room.
 * `LanternPixels` renders the raw <rect> pixels inside an existing SVG
 * (used by the map); `LanternIcon` wraps them in a standalone <svg> for HTML.
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

/** Variant for pale/lit backgrounds (the yellow header of the room you are in). */
const DARK_PALETTE: Record<string, string> = {
  g: "var(--icon-leaf-dark)",
  t: "var(--icon-trunk-dark)",
  s: "var(--icon-stone-dark)",
  d: "var(--icon-hole-dark)",
  b: "var(--icon-brass-dark)",
  h: "var(--icon-brass-hi-dark)",
  m: "var(--icon-moon-dark)",
  r: "var(--icon-roof-dark)",
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
export function LanternPixels({ lantern, dark = false }: { lantern: Lantern; dark?: boolean }) {
  const palette = dark ? DARK_PALETTE : PALETTE;
  const rects: { x: number; y: number; fill: string }[] = [];
  GRIDS[lantern].forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const fill = palette[ch];
      if (fill) rects.push({ x, y, fill });
    });
  });
  return (
    <g shapeRendering="crispEdges">
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
      viewBox="0 0 12 12"
      role="img"
      aria-label={`${lantern} lantern icon: ${LANTERN_ICON_LABEL[lantern]}`}
      className={`inline-block align-[-3px] ${className ?? ""}`}
    >
      <LanternPixels lantern={lantern} />
    </svg>
  );
}
