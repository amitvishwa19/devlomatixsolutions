import { supabase } from "@/lib/supabase";

const LEGACY_KEY = "wa_test_numbers";
const LEGACY_SINGLE = "wa_test_number";
const MIGRATED_FLAG = "wa_test_numbers_migrated_v2";

function normalize(rows) {
  return (rows || [])
    .filter((r) => r && r.phone_number)
    .map((r) => ({ label: r.name || r.phone_number, phone: r.phone_number }));
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
      const rows = legacyList.map((x) => ({ 
        name: x.label || x.phone, 
        phone_number: x.phone, 
        source: "test_number" 
      }));
      await supabase.from("wa_contacts").upsert(rows, { onConflict: "phone_number" });
    }
  } catch (_) {}
  try { localStorage.setItem(MIGRATED_FLAG, "1"); } catch (_) {}
}

export async function getTestNumbers() {
  await migrateLegacyIfNeeded();
  const { data, error } = await supabase
    .from("wa_contacts")
    .select("name, phone_number")
    .eq("source", "test_number")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return normalize(data);
}

export async function addTestNumber(label, phone) {
  const row = { 
    name: (label || phone).trim(), 
    phone_number: phone.trim(),
    source: "test_number"
  };
  const { error } = await supabase
    .from("wa_contacts")
    .upsert(row, { onConflict: "phone_number" });
  if (error) throw error;
  return getTestNumbers();
}

export async function removeTestNumber(phone) {
  // Instead of deleting (which might affect conversations), we just change the source
  // or if it truly is a test-only contact, delete it.
  // Given the context of "test numbers list", we'll delete if source is test_number
  const { error } = await supabase
    .from("wa_contacts")
    .delete()
    .eq("phone_number", phone)
    .eq("source", "test_number");
  if (error) throw error;
  return getTestNumbers();
}

export function isValidTestPhone(value) {
  return /^\+?[1-9][0-9]{7,15}$/.test(String(value || "").replace(/[\s().-]/g, ""));
}

export async function updateTestNumber(originalPhone, label, phone) {
  const row = { 
    name: (label || phone).trim(), 
    phone_number: phone.trim(),
    source: "test_number"
  };
  const { error } = await supabase
    .from("wa_contacts")
    .update(row)
    .eq("phone_number", originalPhone)
    .eq("source", "test_number");
  if (error) throw error;
  return getTestNumbers();
}

export async function bulkImportTestNumbers(rows) {
  const cleaned = (rows || [])
    .map((r) => ({ 
      name: (r.label || r.phone || "").trim(), 
      phone_number: normalizeTestPhone(r.phone),
      source: "test_number"
    }))
    .filter((r) => r.phone_number && isValidTestPhone(r.phone_number));
  
  if (!cleaned.length) return { inserted: 0, list: await getTestNumbers() };
  
  const seen = new Set();
  const dedup = cleaned.filter((r) => {
    if (seen.has(r.phone_number)) return false;
    seen.add(r.phone_number);
    return true;
  });

  const { error } = await supabase
    .from("wa_contacts")
    .upsert(dedup, { onConflict: "phone_number" });
  if (error) throw error;
  return { inserted: dedup.length, list: await getTestNumbers() };
}

export function normalizeTestPhone(value) {
  const cleaned = String(value || "").replace(/[\s().\-_/]/g, "");
  if (!cleaned) return "";
  return cleaned.startsWith("+") ? `+${cleaned.slice(1).replace(/\D/g, "")}` : cleaned.replace(/\D/g, "");
}

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
      const phoneIdx = parts.findIndex((p) => /^\+?[\d\s().\-]{6,}$/.test(p));
      if (phoneIdx === -1) { phone = parts[parts.length - 1]; label = parts.slice(0, -1).join(" "); }
      else { phone = parts[phoneIdx]; label = parts.filter((_, i) => i !== phoneIdx).join(" "); }
    }
    out.push({ label: label.trim(), phone: normalizeTestPhone(phone) });
  }
  return out;
}
