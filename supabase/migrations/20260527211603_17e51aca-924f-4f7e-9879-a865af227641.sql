
CREATE TABLE public.queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  topic_category TEXT NOT NULL DEFAULT 'General',
  language TEXT NOT NULL DEFAULT 'english',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.queries TO anon;
GRANT SELECT, INSERT ON public.queries TO authenticated;
GRANT ALL ON public.queries TO service_role;

ALTER TABLE public.queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert queries"
  ON public.queries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read queries"
  ON public.queries FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX queries_created_at_idx ON public.queries (created_at DESC);
CREATE INDEX queries_topic_idx ON public.queries (topic_category);
