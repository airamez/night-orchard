import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { GameState } from "./engine";

export interface Seat { token: string; seatId: string }
const key = (code: string) => `night-orchard:seat:${code.toUpperCase()}`;

export function loadSeat(code: string): Seat | null {
  try { const v = localStorage.getItem(key(code)); return v ? (JSON.parse(v) as Seat) : null; } catch { return null; }
}
export function saveSeat(code: string, seat: Seat) { localStorage.setItem(key(code), JSON.stringify(seat)); }
export function clearSeat(code: string) { localStorage.removeItem(key(code)); }

export function useRoom(code: string) {
  const [state, setState] = useState<GameState | null>(null);
  const [missing, setMissing] = useState(false);

  const refetch = useCallback(async () => {
    const { data } = await supabase.from("rooms").select("state").eq("code", code).maybeSingle();
    if (!data) setMissing(true);
    else setState(data.state as unknown as GameState);
  }, [code]);

  useEffect(() => {
    void refetch();
    const channel = supabase
      .channel(`room-${code}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: `code=eq.${code}` }, (payload) => {
        setState((payload.new as { state: GameState }).state);
      })
      .subscribe((status) => { if (status === "SUBSCRIBED") void refetch(); });
    return () => { void supabase.removeChannel(channel); };
  }, [code, refetch]);

  return { state, missing, refetch };
}
