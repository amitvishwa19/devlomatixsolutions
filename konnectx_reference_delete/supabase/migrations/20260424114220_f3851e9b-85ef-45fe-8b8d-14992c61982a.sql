CREATE TABLE public.wa_test_numbers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label text NOT NULL,
  phone text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.wa_test_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public app can read test numbers" ON public.wa_test_numbers FOR SELECT USING (true);
CREATE POLICY "Public app can create test numbers" ON public.wa_test_numbers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public app can update test numbers" ON public.wa_test_numbers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public app can delete test numbers" ON public.wa_test_numbers FOR DELETE USING (true);

CREATE TRIGGER update_wa_test_numbers_updated_at
BEFORE UPDATE ON public.wa_test_numbers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();