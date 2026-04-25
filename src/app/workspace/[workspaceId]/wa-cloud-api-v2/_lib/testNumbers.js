import { supabase } from "@/lib/supabase";

const LEGACY_KEY = "wa_test_numbers";
const LEGACY_SINGLE = "wa_test_number";
const MIGRATED_FLAG = "wa_test_numbers_migrated";

function normalize(rows) {
  return (rows || [])
    .filter((r) => r && r.phone)
    .map((r) => ({ label: r.label || r.phone, phone: r.phone }));
}

async function migrateLegacyIfNeeded() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(MIGRATED_FLAG)) return;
  try {
    const legacyList = [];
    const raw = localStorage.getItem(LEGACY_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) legacyList.push(...arr.filter((x) => x && x.phone));
    }
    const single = localStorage.getItem(LEGACY_SINGLE);
    if (single && !legacyList.length) legacyList.push({ label: "Default", phone: single });
    if (legacyList.length) {
      const rows = legacyList.map((x) => ({ label: x.label || x.phone, phone: x.phone }));
      await supabase.from("wa_test_numbers").upsert(rows, { onConflict: "phone" });
    }
  } catch (_) {}
  try { localStorage.setItem(MIGRATED_FLAG, "1"); } catch (_) {}
}

export async function getTestNumbers() {
  await migrateLegacyIfNeeded();
  const { data, error } = await supabase
    .from("wa_test_numbers")
    .select("label, phone")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return normalize(data);
}

export async function addTestNumber(label, phone) {
  const row = { label: (label || phone).trim(), phone: phone.trim() };
  const { error } = await supabase
    .from("wa_test_numbers")
    .upsert(row, { onConflict: "phone" });
  if (error) throw error;
  return getTestNumbers();
}

export async function removeTestNumber(phone) {
  const { error } = await supabase.from("wa_test_numbers").delete().eq("phone", phone);
  if (error) throw error;
  return getTestNumbers();
}

export function isValidTestPhone(value) {
  return /^\+?[1-9][0-9]{7,15}$/.test(String(value || "").replace(/[\s().-]/g, ""));
}

export async function updateTestNumber(originalPhone, label, phone) {
  const row = { label: (label || phone).trim(), phone: phone.trim() };
  const { error } = await supabase
    .from("wa_test_numbers")
    .update(row)
    .eq("phone", originalPhone);
  if (error) throw error;
  return getTestNumbers();
}

export async function bulkImportTestNumbers(rows) {
  const cleaned = (rows || [])
    .map((r) => ({ label: (r.label || r.phone || "").trim(), phone: normalizeTestPhone(r.phone) }))
    .filter((r) => r.phone && isValidTestPhone(r.phone));
  if (!cleaned.length) return { inserted: 0, list: await getTestNumbers() };
  // de-dupe within the import payload itself
  const seen = new Set();
  const dedup = cleaned.filter((r) => {
    if (seen.has(r.phone)) return false;
    seen.add(r.phone);
    return true;
  });
  const { error } = await supabase
    .from("wa_test_numbers")
    .upsert(dedup, { onConflict: "phone" });
  if (error) throw error;
  return { inserted: dedup.length, list: await getTestNumbers() };
}

export function normalizeTestPhone(value) {
  const cleaned = String(value || "").replace(/[\s().\-_/]/g, "");
  if (!cleaned) return "";
  return cleaned.startsWith("+") ? `+${cleaned.slice(1).replace(/\D/g, "")}` : cleaned.replace(/\D/g, "");
}

/**
 * Parses a free-form text blob (CSV or paste) into { label, phone } rows.
 * Accepted per line:
 *   "+15551234567"
 *   "Alice, +15551234567"
 *   "+15551234567, Alice"
 *   "Alice;+15551234567"
 *   "Alice\t+15551234567"
 * The first line is treated as a header if it contains "phone" or "number".
 */
export function parseTestNumbersInput(text) {
  const out = [];
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return out;
  const first = lines[0].toLowerCase();
  const hasHeader = /\b(phone|number|msisdn)\b/.test(first);
  const startIdx = hasHeader ? 1 : 0;
  for (let i = startIdx; i < lines.length; i++) {
    const parts = lines[i].split(/[,;\t]/).map((p) => p.trim()).filter(Boolean);
    if (!parts.length) continue;
    let label = "";
    let phone = "";
    if (parts.length === 1) {
      phone = parts[0];
    } else {
      // Phone is the part that looks most like a phone number
      const phoneIdx = parts.findIndex((p) => /^\+?[\d\s().\-]{6,}$/.test(p));
      if (phoneIdx === -1) { phone = parts[parts.length - 1]; label = parts.slice(0, -1).join(" "); }
      else { phone = parts[phoneIdx]; label = parts.filter((_, i) => i !== phoneIdx).join(" "); }
    }
    out.push({ label: label.trim(), phone: normalizeTestPhone(phone) });
  }
  return out;
}
