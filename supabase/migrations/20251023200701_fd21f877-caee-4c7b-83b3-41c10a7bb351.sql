-- Create urls table for URL shortening
CREATE TABLE public.urls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  short_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  clicks INTEGER NOT NULL DEFAULT 0,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT valid_url CHECK (original_url ~* '^https?://')
);

-- Create index for faster lookups
CREATE INDEX idx_urls_short_code ON public.urls(short_code);
CREATE INDEX idx_urls_user_id ON public.urls(user_id);

-- Enable Row Level Security
ALTER TABLE public.urls ENABLE ROW LEVEL SECURITY;

-- Users can view their own URLs
CREATE POLICY "Users can view their own URLs"
ON public.urls
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own URLs
CREATE POLICY "Users can create their own URLs"
ON public.urls
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own URLs
CREATE POLICY "Users can delete their own URLs"
ON public.urls
FOR DELETE
USING (auth.uid() = user_id);

-- Public read access for redirects (needed for stateless redirect)
CREATE POLICY "Public can read URLs for redirects"
ON public.urls
FOR SELECT
USING (true);

-- Function to generate random short code
CREATE OR REPLACE FUNCTION public.generate_short_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Function to increment click count
CREATE OR REPLACE FUNCTION public.increment_url_clicks(url_short_code TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.urls
  SET clicks = clicks + 1
  WHERE short_code = url_short_code;
END;
$$;