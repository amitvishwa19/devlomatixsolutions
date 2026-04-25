// Shared client-side utilities for automation rules.

export const RULE_TYPES = [
  { id: "keyword", label: "Keyword auto-reply", description: "Reply when an inbound message matches keywords." },
  { id: "welcome", label: "Welcome message", description: "Greet first-time senders automatically." },
  { id: "away", label: "Office hours / away", description: "Reply outside configured business hours." },
];

export const MATCH_MODES = [
  { id: "any", label: "Any keyword present" },
  { id: "all", label: "All keywords present" },
  { id: "exact", label: "Exact match" },
];

export const WEEKDAYS = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
];

export function defaultOfficeHours() {
  return {
    timezone: typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC",
    days: { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false },
    start: "09:00",
    end: "18:00",
  };
}

export function describeRule(rule) {
  if (rule.rule_type === "keyword") {
    const kws = (rule.match_keywords || []).slice(0, 3).join(", ");
    return kws ? `Triggers on: ${kws}${(rule.match_keywords || []).length > 3 ? "…" : ""}` : "No keywords set";
  }
  if (rule.rule_type === "welcome") return "First message from a contact";
  if (rule.rule_type === "away") {
    const oh = rule.office_hours || {};
    return `Outside ${oh.start || "—"}–${oh.end || "—"} (${oh.timezone || "UTC"})`;
  }
  return "";
}
