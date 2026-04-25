// Shared segment/audience filtering used by Contacts, Segments and Campaigns.
// A filter is a simple JSON object: { tag, lifecycle_stage, status, search, exclude_opted_out }

export const EMPTY_FILTER = {
  tag: "",
  lifecycle_stage: "",
  status: "",
  search: "",
  exclude_opted_out: true,
};

export function applyFilter(contacts, filter = {}) {
  const f = { ...EMPTY_FILTER, ...filter };
  const q = String(f.search || "").toLowerCase().trim();
  return (contacts || []).filter((c) => {
    if (f.exclude_opted_out && (c.opted_out_at || c.status === "opted_out")) return false;
    if (f.status && c.status !== f.status) return false;
    if (f.lifecycle_stage && c.lifecycle_stage !== f.lifecycle_stage) return false;
    if (f.tag && !(c.tags || []).includes(f.tag)) return false;
    if (q) {
      const hay = `${c.name || ""} ${c.phone_number || ""} ${(c.tags || []).join(" ")} ${c.custom_fields?.company || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function describeFilter(filter = {}) {
  const f = { ...EMPTY_FILTER, ...filter };
  const parts = [];
  if (f.tag) parts.push(`tag:${f.tag}`);
  if (f.lifecycle_stage) parts.push(`stage:${f.lifecycle_stage}`);
  if (f.status) parts.push(`status:${f.status}`);
  if (f.search) parts.push(`q:"${f.search}"`);
  if (f.exclude_opted_out) parts.push("excl. opt-out");
  return parts.length ? parts.join(" · ") : "All contacts";
}

export const LIFECYCLE_STAGES = ["lead", "prospect", "customer", "vip", "churned"];

// Parse a CSV header row into normalized field keys we recognize.
const FIELD_ALIASES = {
  name: ["name", "full name", "contact"],
  phone_number: ["phone", "phone number", "mobile", "whatsapp", "number"],
  tags: ["tags", "labels"],
  notes: ["notes", "note"],
  company: ["company", "organization", "org"],
  lifecycle_stage: ["lifecycle", "lifecycle stage", "stage"],
  last_purchase: ["last purchase", "last_purchase", "lastpurchase"],
  email: ["email", "e-mail"],
};

export function mapHeader(header) {
  const normalized = String(header || "").toLowerCase().trim();
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    if (aliases.includes(normalized)) return field;
  }
  return normalized ? `custom:${normalized}` : null;
}

// Tiny CSV parser that handles quoted fields and commas inside quotes.
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (ch === '"') inQuotes = false;
      else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (cell !== "" || row.length) { row.push(cell); rows.push(row); row = []; cell = ""; }
      if (ch === "\r" && text[i + 1] === "\n") i += 1;
    } else cell += ch;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => String(c).trim() !== ""));
}