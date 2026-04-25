import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { db } from "../_lib/api";

const ACTIVE_ACCOUNT_KEY = "wa-cloud-api:active-account-id";

async function unwrap(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export function useWaData() {
  const phoneNumbers = useQuery({ queryKey: ["wa_phone_numbers"], queryFn: () => unwrap(db.phoneNumbers()) });
  const contacts = useQuery({ queryKey: ["wa_contacts"], queryFn: () => unwrap(db.contacts()) });
  const conversations = useQuery({ queryKey: ["wa_conversations"], queryFn: () => unwrap(db.conversations()) });
  const templates = useQuery({ queryKey: ["wa_templates"], queryFn: () => unwrap(db.templates()) });
  const media = useQuery({ queryKey: ["wa_media_assets"], queryFn: () => unwrap(db.media()) });
  const campaigns = useQuery({ queryKey: ["wa_campaigns"], queryFn: () => unwrap(db.campaigns()) });
  const events = useQuery({ queryKey: ["wa_webhook_events"], queryFn: () => unwrap(db.events()) });
  const quickReplies = useQuery({ queryKey: ["wa_quick_replies"], queryFn: () => unwrap(db.quickReplies()) });
  const assignees = useQuery({ queryKey: ["wa_assignees"], queryFn: () => unwrap(db.assignees()) });
  const segments = useQuery({ queryKey: ["wa_segments"], queryFn: () => unwrap(db.segments()) });

  const refetchAll = () => Promise.all([
    phoneNumbers.refetch(), contacts.refetch(), conversations.refetch(), templates.refetch(), media.refetch(), campaigns.refetch(), events.refetch(), quickReplies.refetch(), assignees.refetch(), segments.refetch(),
  ]);

  const numbers = phoneNumbers.data || [];
  const fallbackDefault = numbers.find((n) => n.is_default) || numbers[0] || null;

  // Persisted "active account" override — used by Inbox/Send/Contacts/Templates/Settings via the top-nav switcher.
  const [activeAccountId, setActiveAccountIdState] = useState(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACTIVE_ACCOUNT_KEY) || null;
  });

  // If the saved id no longer matches a real account, drop it
  useEffect(() => {
    if (!numbers.length || !activeAccountId) return;
    if (!numbers.some((n) => n.id === activeAccountId)) {
      setActiveAccountIdState(null);
      try { window.localStorage.removeItem(ACTIVE_ACCOUNT_KEY); } catch (_) {}
    }
  }, [numbers, activeAccountId]);

  const setActiveAccountId = (id) => {
    setActiveAccountIdState(id || null);
    try {
      if (id) window.localStorage.setItem(ACTIVE_ACCOUNT_KEY, id);
      else window.localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
    } catch (_) {}
  };

  const activeAccount = useMemo(
    () => numbers.find((n) => n.id === activeAccountId) || fallbackDefault,
    [numbers, activeAccountId, fallbackDefault]
  );

  // `defaultNumber` keeps backwards compatibility but reflects the active selection so all pages follow the switcher.
  return {
    phoneNumbers, contacts, conversations, templates, media, campaigns, events, quickReplies, assignees, segments,
    defaultNumber: activeAccount,
    activeAccount,
    activeAccountId: activeAccount?.id || null,
    setActiveAccountId,
    refetchAll,
  };
}
