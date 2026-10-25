import ipaddr from "ipaddr.js";
import { z } from "zod";

const count = z.number().int().nonnegative();
export const dashboardSchema = z.object({
  games: count, players: count, wins: count, losses: count, godMode: count,
  active: count, restarted: count, abandoned: count, historical: count,
  since: z.string().nullable(), locatedPlayers: count,
  locations: z.array(z.object({ city: z.string().nullable(), region: z.string().nullable(), country: z.string(), players: count })),
});
export type Dashboard = z.infer<typeof dashboardSchema>;

export function publicAddress(value: string | undefined): string | null {
  if (!value || !ipaddr.isValid(value.trim())) return null;
  const address = ipaddr.process(value.trim());
  return address.range() === "unicast" ? address.toString() : null;
}

export function locationFromResponse(value: unknown) {
  const parsed = z.object({ success: z.literal(true), city: z.string().optional(), region: z.string().optional(), country: z.string().min(1) }).safeParse(value);
  if (!parsed.success) return null;
  const clean = (s: string | undefined) => s?.trim().slice(0, 100) || null;
  return { city: clean(parsed.data.city), region: clean(parsed.data.region), country: clean(parsed.data.country) };
}