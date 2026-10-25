import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { GameState } from "./engine";

export interface Seat { token: string; seatId: string }
const key = (code: string) => `night-orchard:seat:${code.toUpperCase()}`;

export function loadSeat(code: string): Seat | null {
  try { const v = sessionStorage.getItem(key(code)); return v ? (JSON.parse(v) as Seat) : null; } catch { return null; }
}
export function saveSeat(code: string, seat: Seat) { sessionStorage.setItem(key(code), JSON.stringify(seat)); }
export function clearSeat(code: string) { sessionStorage.removeItem(key(code)); }

export function useRoom(code: string) {
  const [state, setState] = useState<GameState | null>(null);
  const [missing, setMissing] = useState(false);
  const latest = useRef({ code, updatedAt: "" });

  const accept = useCallback((row: { state: unknown; updated_at: string }) => {
    if (latest.current.code !== code) return;
    if (row.updated_at < latest.current.updatedAt) return;
    latest.current.updatedAt = row.updated_at;
    setMissing(false);
    setState(row.state as GameState);
  }, [code]);

  const refetch = useCallback(async () => {
    const { data, error } = await supabase.from("rooms").select("state, updated_at").eq("code", code).maybeSingle();
    if (latest.current.code !== code) return;
    if (error) throw new Error("Could not refresh the room. Please try again.");
    if (!data) { setMissing(true); return; }
    accept(data);
  }, [code, accept]);

  useEffect(() => {
    latest.current = { code, updatedAt: "" };
    setState(null);
    setMissing(false);
    const refresh = () => { void refetch().catch(() => {}); };
    refresh();
    const channel = supabase
      .channel(`room-${code}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: `code=eq.${code}` }, (payload) => {
        accept(payload.new as { state: unknown; updated_at: string });
      })
      .subscribe((status) => { if (status === "SUBSCRIBED") refresh(); });
    return () => { latest.current = { code: "", updatedAt: "" }; void supabase.removeChannel(channel); };
  }, [code, refetch, accept]);

  return { state, missing, refetch };
}
