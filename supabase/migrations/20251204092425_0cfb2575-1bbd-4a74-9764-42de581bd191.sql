-- -- Add region column to apartments
-- ALTER TABLE public.apartments ADD COLUMN region text DEFAULT 'kenya';

-- -- Update existing apartments with regions
-- UPDATE public.apartments SET region = 'kenya';