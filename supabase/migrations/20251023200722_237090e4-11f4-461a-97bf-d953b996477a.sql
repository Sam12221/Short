-- Fix security warnings by setting search_path for functions

-- Drop and recreate generate_short_code with proper search_path
DROP FUNCTION IF EXISTS public.generate_short_code();

CREATE OR REPLACE FUNCTION public.generate_short_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Drop and recreate increment_url_clicks with proper search_path
DROP FUNCTION IF EXISTS public.increment_url_clicks(TEXT);

CREATE OR REPLACE FUNCTION public.increment_url_clicks(url_short_code TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.urls
  SET clicks = clicks + 1
  WHERE short_code = url_short_code;
END;
$$;