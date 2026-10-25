import { approximateLocationSchema, locationFromResponse } from "./activity";
import { trackRoomVisit } from "./room.functions";

/** Browser fallback sends only parsed location fields, never the provider's IP. */
export async function trackVisit(data: { code: string; token: string; godMode: boolean }) {
  const result = await trackRoomVisit({ data });
  if (result.located) return;
  try {
    const response = await fetch("https://ipwho.is/?fields=success,city,region,country", { signal: AbortSignal.timeout(6000), credentials: "omit", referrerPolicy: "no-referrer" });
    if (!response.ok) return;
    const location = approximateLocationSchema.safeParse(locationFromResponse(await response.json()));
    if (location.success) await trackRoomVisit({ data: { ...data, location: location.data } });
  } catch { /* Optional analytics must never interrupt gameplay or log provider data. */ }
}