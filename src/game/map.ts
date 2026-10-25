export type RoomId =
  | "fountain" | "hedge_knot" | "sun_stone" | "bell_lawn" | "ivy_wall" | "oak_shrine"
  | "rose_walk" | "gate" | "outer_lawn" | "well" | "moon_arch" | "glass_house" | "orchard";

export type Lantern = "Oak" | "Well" | "Bell" | "Moon";
export type Dir = "north" | "south" | "east" | "west";

export interface Room {
  id: RoomId;
  title: string;
  exits: Partial<Record<Dir, RoomId>>;
  prose: string[];
  shrine?: Lantern;
  /** exit directions that are the woven hedge */
  hedge?: Dir[];
  /** exit that needs the iron key */
  lockedExit?: Dir;
  pos: [number, number];
}

/** Authored Orchard clue; the engine and UI substitute each game's own password for this line. */
export const PASSWORD_LINE = "The night flowers are carved here.";

/** How many words each game's password draws from the phrase list. */
export const PASSWORD_WORD_COUNT = 4;

/** The Orchard clue text for a game's password, e.g. "The night flowers are called NIGHTBLOOM and MOONVINE — speak them at the Gate, in this order." */
export function passwordClue(password: string): string {
  const words = password.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return PASSWORD_LINE;
  const upper = words.map((w) => w.toUpperCase());
  if (upper.length === 1) return `The night flower is called ${upper[0]}.`;
  return `The night flowers are called ${upper.slice(0, -1).join(", ")} and ${upper.at(-1)} — speak them at the Gate, in this order.`;
}

export const ROOMS: Record<RoomId, Room> = {
  fountain: { id: "fountain", title: "Fountain Court", exits: { north: "hedge_knot", south: "well" }, prose: ["A dry fountain and a stone fish.", "Chalk on the rim reads:", "The big key is under the bell."], pos: [200, 300] },
  hedge_knot: { id: "hedge_knot", title: "Hedge Knot", exits: { south: "fountain", west: "sun_stone", east: "bell_lawn", north: "rose_walk" }, hedge: ["north"], prose: ["Four hedges meet. The north one is woven shut.", "A sign reads:", "It opens while someone holds the sun stone, or holds the walk beyond it."], pos: [200, 220] },
  sun_stone: { id: "sun_stone", title: "Sun Stone", exits: { east: "hedge_knot" }, prose: ["A flat stone, still warm.", "Standing here and choosing Hold opens the shut hedge for this round only."], pos: [90, 220] },
  bell_lawn: { id: "bell_lawn", title: "Bell Lawn", exits: { west: "hedge_knot", east: "ivy_wall", south: "oak_shrine" }, shrine: "Bell", prose: ["A brass bell on a post.", "An iron key lies in the grass beneath it.", "A plaque reads:", "Bell lanterns wake here."], pos: [310, 220] },
  ivy_wall: { id: "ivy_wall", title: "Ivy Wall", exits: { west: "bell_lawn" }, prose: ["Thick ivy and a dead end.", "Initials are carved in the leaves.", "The groundskeeper never walks here."], pos: [420, 220] },
  oak_shrine: { id: "oak_shrine", title: "Oak Shrine", exits: { north: "bell_lawn" }, shrine: "Oak", prose: ["A hollow oak with a slot the size of a lantern.", "A plaque reads:", "Oak lanterns wake here."], pos: [310, 300] },
  rose_walk: { id: "rose_walk", title: "Rose Walk", exits: { south: "hedge_knot", north: "gate" }, hedge: ["south"], prose: ["Roses gone to sleep. North is the gate.", "Choosing Hold here opens the shut hedge for this round only."], pos: [200, 140] },
  gate: { id: "gate", title: "The Gate", exits: { south: "rose_walk", north: "outer_lawn" }, prose: ["An iron gate.", "A plaque reads:", "Say the night-flower words carved in the Orchard, in their order. The answer is not written here."], pos: [200, 75] },
  outer_lawn: { id: "outer_lawn", title: "Outer Lawn", exits: { south: "gate" }, prose: ["Open grass under the stars. You are outside.", "Wait for the others."], pos: [200, 15] },
  well: { id: "well", title: "The Well", exits: { north: "fountain", east: "glass_house", south: "moon_arch" }, shrine: "Well", prose: ["A ring of old stones.", "A plaque reads:", "Well lanterns wake here."], pos: [200, 380] },
  moon_arch: { id: "moon_arch", title: "Moon Arch", exits: { north: "well" }, shrine: "Moon", prose: ["A pale stone arch.", "A plaque reads:", "Moon lanterns wake here."], pos: [200, 455] },
  glass_house: { id: "glass_house", title: "Glass House", exits: { west: "well", east: "orchard" }, lockedExit: "east", prose: ["Fogged glass panes.", "The east door has a heavy lock made for the iron key."], pos: [310, 380] },
  orchard: { id: "orchard", title: "The Orchard", exits: { west: "glass_house" }, prose: ["Dark fruit trees.", "Words are carved in the bark:", PASSWORD_LINE], pos: [420, 380] },
};

export const START_ROOMS: RoomId[] = ["fountain", "bell_lawn", "well", "hedge_knot"];
export const LANTERNS: Lantern[] = ["Oak", "Well", "Bell", "Moon"];
export const SHRINE_OF: Record<Lantern, RoomId> = { Oak: "oak_shrine", Well: "well", Bell: "bell_lawn", Moon: "moon_arch" };
export const GK_PATH: RoomId[] = ["oak_shrine", "bell_lawn", "hedge_knot", "fountain", "hedge_knot", "bell_lawn"];
export const ROUND_LIMIT = 16;
/** Max characters in a player name — kept short so names always fit inside map room boxes. */
export const NAME_MAX = 14;
/** The gate password is drawn fresh from this list for every game start and restart.
 *  Keep every word lowercase, unique, and at most 8 letters so four words fit the Speak input. */
export const PASSWORD_PHRASES = [
  "night", "bloom", "moon", "vine", "dusk", "rose", "star", "lily", "fern", "iris",
  "thorn", "briar", "hedge", "maze", "gate", "wall", "ivy", "moss", "dew", "fog",
  "mist", "haze", "moth", "owl", "bat", "fox", "toad", "newt", "crow", "raven",
  "wren", "finch", "robin", "sparrow", "beetle", "firefly", "glowworm", "snail", "slug", "worm",
  "ant", "bee", "wasp", "hornet", "spider", "web", "cocoon", "larva", "pollen", "nectar",
  "petal", "stem", "leaf", "root", "seed", "sprout", "sapling", "acorn", "pinecone", "willow",
  "cedar", "yew", "elm", "birch", "aspen", "rowan", "holly", "laurel", "juniper", "poppy",
  "daisy", "tulip", "orchid", "violet", "pansy", "lilac", "jasmine", "gardenia", "camellia", "bluebell",
  "foxglove", "hemlock", "nettle", "thistle", "bramble", "clover", "trefoil", "meadow", "orchard", "trellis",
  "arbor", "gazebo", "fountain", "statue", "obelisk", "lantern", "candle", "ember", "ash", "smoke",
];
