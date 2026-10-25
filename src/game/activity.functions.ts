import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { dashboardSchema } from "./activity";

export const getActivityDashboard = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeader("Cache-Control", "no-store");
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error("Activity is temporarily unavailable.");
  const db = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
  const { data, error } = await db.rpc("activity_dashboard");
  if (error) throw new Error("Activity is temporarily unavailable. Please try again.");
  return dashboardSchema.parse(data);
});

// Read only a proxy-provided address; never return or log it.
export function visitorAddress() {
  return getRequestHeader("cf-connecting-ip") ?? getRequestHeader("x-real-ip") ?? getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim();
}