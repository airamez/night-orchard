CREATE TABLE public.game_activity (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 room_code text NOT NULL,
 started_at timestamptz NOT NULL DEFAULT now(),
 ended_at timestamptz,
 outcome text NOT NULL DEFAULT 'playing' CHECK (outcome IN ('playing','won','lost','restarted','abandoned')),
 god_mode boolean NOT NULL DEFAULT false,
 historical boolean NOT NULL DEFAULT false
);
GRANT ALL ON public.game_activity TO service_role;
ALTER TABLE public.game_activity ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.player_locations (
 seat_id text PRIMARY KEY,
 city text,
 region text,
 country text,
 captured_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.player_locations TO service_role;
ALTER TABLE public.player_locations ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.game_participants (
 game_id uuid NOT NULL REFERENCES public.game_activity(id),
 seat_id text NOT NULL,
 PRIMARY KEY (game_id, seat_id)
);
GRANT ALL ON public.game_participants TO service_role;
ALTER TABLE public.game_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ADD COLUMN activity_game_id uuid;
ALTER TABLE public.rooms ADD COLUMN activity_god_mode boolean NOT NULL DEFAULT false;
INSERT INTO public.game_activity (room_code, started_at, ended_at, outcome, historical)
 SELECT code, updated_at, CASE WHEN state->>'phase' IN ('won','lost') THEN updated_at ELSE NULL END, state->>'phase', true
 FROM public.rooms WHERE state->>'phase' IN ('playing','won','lost');
UPDATE public.rooms r SET activity_game_id = g.id FROM public.game_activity g WHERE g.room_code = r.code;
INSERT INTO public.game_participants (game_id, seat_id)
 SELECT r.activity_game_id, p->>'id' FROM public.rooms r CROSS JOIN LATERAL jsonb_array_elements(r.state->'players') p WHERE r.activity_game_id IS NOT NULL;
CREATE FUNCTION public.track_game_activity() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF NEW.activity_game_id IS DISTINCT FROM OLD.activity_game_id AND NEW.activity_game_id IS NOT NULL THEN
  UPDATE public.game_activity SET outcome = 'restarted', ended_at = now() WHERE id = OLD.activity_game_id AND outcome = 'playing';
  INSERT INTO public.game_activity (id, room_code, god_mode) VALUES (NEW.activity_game_id, NEW.code, NEW.activity_god_mode);
  INSERT INTO public.game_participants (game_id, seat_id) SELECT NEW.activity_game_id, p->>'id' FROM jsonb_array_elements(NEW.state->'players') p ON CONFLICT DO NOTHING;
 END IF;
 IF NEW.activity_game_id IS NOT NULL THEN
  UPDATE public.game_activity SET god_mode = god_mode OR NEW.activity_god_mode,
   outcome = CASE WHEN NEW.state->>'phase' IN ('won','lost') THEN NEW.state->>'phase' WHEN jsonb_array_length(NEW.state->'players') = 0 THEN 'abandoned' ELSE outcome END,
   ended_at = CASE WHEN NEW.state->>'phase' IN ('won','lost') OR jsonb_array_length(NEW.state->'players') = 0 THEN COALESCE(ended_at, now()) ELSE ended_at END
  WHERE id = NEW.activity_game_id;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.track_game_activity() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER track_game_activity AFTER UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.track_game_activity();
CREATE FUNCTION public.activity_dashboard() RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT jsonb_build_object(
 'games', (SELECT count(*) FROM public.game_activity),
 'players', (SELECT count(DISTINCT seat_id) FROM public.game_participants),
 'wins', (SELECT count(*) FROM public.game_activity WHERE outcome = 'won'),
 'losses', (SELECT count(*) FROM public.game_activity WHERE outcome = 'lost'),
 'godMode', (SELECT count(*) FROM public.game_activity WHERE god_mode),
 'active', (SELECT count(*) FROM public.game_activity WHERE outcome = 'playing'),
 'restarted', (SELECT count(*) FROM public.game_activity WHERE outcome = 'restarted'),
 'abandoned', (SELECT count(*) FROM public.game_activity WHERE outcome = 'abandoned'),
 'historical', (SELECT count(*) FROM public.game_activity WHERE historical),
 'since', (SELECT min(started_at) FROM public.game_activity WHERE NOT historical),
 'locations', COALESCE((SELECT jsonb_agg(t) FROM (SELECT l.city, l.region, l.country, count(*) AS players FROM public.player_locations l WHERE l.country IS NOT NULL AND EXISTS (SELECT 1 FROM public.game_participants p WHERE p.seat_id = l.seat_id) GROUP BY l.city, l.region, l.country ORDER BY count(*) DESC, l.country, l.region, l.city) t), '[]'::jsonb),
 'locatedPlayers', (SELECT count(*) FROM public.player_locations l WHERE l.country IS NOT NULL AND EXISTS (SELECT 1 FROM public.game_participants p WHERE p.seat_id = l.seat_id))
 );
$$;
REVOKE ALL ON FUNCTION public.activity_dashboard() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.activity_dashboard() TO anon, authenticated, service_role;