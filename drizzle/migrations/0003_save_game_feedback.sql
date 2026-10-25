CREATE TABLE public.game_feedback (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 255),
 description text NOT NULL CHECK (char_length(btrim(description)) BETWEEN 1 AND 255),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.game_feedback TO anon, authenticated;
GRANT ALL ON public.game_feedback TO service_role;
ALTER TABLE public.game_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Feedback is publicly listed" ON public.game_feedback FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can submit feedback" ON public.game_feedback FOR INSERT TO anon, authenticated WITH CHECK (char_length(btrim(title)) BETWEEN 1 AND 255 AND char_length(btrim(description)) BETWEEN 1 AND 255);