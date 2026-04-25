ALTER TABLE public.wa_messages REPLICA IDENTITY FULL;
ALTER TABLE public.wa_conversations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wa_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wa_conversations;