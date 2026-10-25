CREATE OR REPLACE FUNCTION public.track_game_activity() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF NEW.activity_game_id IS DISTINCT FROM OLD.activity_game_id AND NEW.activity_game_id IS NOT NULL THEN
  UPDATE public.game_activity SET outcome = 'restarted', ended_at = now() WHERE id = OLD.activity_game_id AND outcome = 'playing';
  INSERT INTO public.game_activity (id, room_code, god_mode) VALUES (NEW.activity_game_id, NEW.code, NEW.activity_god_mode);
  INSERT INTO public.game_participants (game_id, seat_id) SELECT NEW.activity_game_id, p->>'id' FROM jsonb_array_elements(NEW.state->'players') p ON CONFLICT DO NOTHING;
 END IF;
 IF NEW.activity_game_id IS NOT NULL THEN
  UPDATE public.game_activity SET god_mode = god_mode OR NEW.activity_god_mode,
   outcome = CASE WHEN outcome <> 'playing' THEN outcome WHEN NEW.state->>'phase' IN ('won','lost') THEN NEW.state->>'phase' WHEN jsonb_array_length(NEW.state->'players') = 0 THEN 'abandoned' ELSE outcome END,
   ended_at = CASE WHEN outcome = 'playing' AND (NEW.state->>'phase' IN ('won','lost') OR jsonb_array_length(NEW.state->'players') = 0) THEN COALESCE(ended_at, now()) ELSE ended_at END
  WHERE id = NEW.activity_game_id;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.track_game_activity() FROM PUBLIC, anon, authenticated;