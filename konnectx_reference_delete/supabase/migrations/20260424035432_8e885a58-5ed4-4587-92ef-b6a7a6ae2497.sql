-- Deduplicate any existing duplicates first (keep the oldest, move messages to it)
WITH ranked AS (
  SELECT id, phone_number_id, external_contact_phone,
         ROW_NUMBER() OVER (PARTITION BY phone_number_id, external_contact_phone ORDER BY created_at) AS rn,
         FIRST_VALUE(id) OVER (PARTITION BY phone_number_id, external_contact_phone ORDER BY created_at) AS keeper
  FROM public.wa_conversations
  WHERE phone_number_id IS NOT NULL
)
UPDATE public.wa_messages m
SET conversation_id = r.keeper
FROM ranked r
WHERE m.conversation_id = r.id AND r.rn > 1;

DELETE FROM public.wa_conversations c
USING (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY phone_number_id, external_contact_phone ORDER BY created_at) AS rn
  FROM public.wa_conversations
  WHERE phone_number_id IS NOT NULL
) d
WHERE c.id = d.id AND d.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS wa_conversations_phone_external_uniq
  ON public.wa_conversations (phone_number_id, external_contact_phone);