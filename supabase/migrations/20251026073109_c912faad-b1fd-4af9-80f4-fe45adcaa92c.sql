-- Add unique constraint: one URL per user
ALTER TABLE public.urls
ADD CONSTRAINT one_url_per_user UNIQUE (user_id);

-- Add check to prevent duplicate original URLs for the same user
CREATE UNIQUE INDEX idx_user_original_url ON public.urls(user_id, original_url);

-- Update the increment_url_clicks function to ensure it works correctly
CREATE OR REPLACE FUNCTION public.increment_url_clicks(url_short_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.urls
  SET clicks = clicks + 1
  WHERE short_code = url_short_code;
END;
$$;

-- Ensure RLS allows public to update clicks for redirects
CREATE POLICY "Public can increment clicks" ON public.urls
  FOR UPDATE
  USING (true)
  WITH CHECK (true);