ALTER TABLE public.wa_phone_numbers
  ADD COLUMN IF NOT EXISTS verified_name text,
  ADD COLUMN IF NOT EXISTS last_verified_at timestamp with time zone;