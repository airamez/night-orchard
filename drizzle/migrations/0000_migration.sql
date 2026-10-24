CREATE TABLE public.rooms (
  code text PRIMARY KEY,
  round int NOT NULL DEFAULT 0,
  state jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.rooms TO anon, authenticated;
GRANT ALL ON public.rooms TO service_role;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rooms are publicly readable" ON public.rooms FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.room_seats (
  code text NOT NULL REFERENCES public.rooms(code) ON DELETE CASCADE,
  seat_id text NOT NULL,
  token text NOT NULL,
  PRIMARY KEY (code, seat_id)
);
GRANT ALL ON public.room_seats TO service_role;
ALTER TABLE public.room_seats ENABLE ROW LEVEL SECURITY;

-- Idempotent, round-guarded write of a resolved round. Only the server calls it.
CREATE OR REPLACE FUNCTION public.resolve_round(p_code text, p_round int, p_state jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n int;
BEGIN
  UPDATE public.rooms SET state = p_state, round = p_round + 1, updated_at = now()
  WHERE code = p_code AND round = p_round;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n = 1;
END $$;
REVOKE ALL ON FUNCTION public.resolve_round(text,int,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_round(text,int,jsonb) TO service_role;

ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;