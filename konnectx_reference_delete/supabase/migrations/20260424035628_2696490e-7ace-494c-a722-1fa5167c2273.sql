ALTER TABLE public.wa_contacts DROP CONSTRAINT IF EXISTS wa_contacts_phone_number_check;
ALTER TABLE public.wa_contacts ADD CONSTRAINT wa_contacts_phone_number_check
  CHECK (phone_number ~ '^\+?[1-9][0-9]{7,15}$');