import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { setResponseHeader } from "@tanstack/react-start/server";
import type { Database } from "@/integrations/supabase/types";

export const listFeedback = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeader("Cache-Control", "no-store");
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error("Reports are temporarily unavailable.");
  const db = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
  const { data, error } = await db.from("game_feedback").select("id,title,description,created_at").order("created_at", { ascending: false }).limit(200);
  if (error) throw new Error("Reports could not be loaded.");
  return data;
});