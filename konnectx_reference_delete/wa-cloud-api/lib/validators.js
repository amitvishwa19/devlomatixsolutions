export const phoneRegex = /^\+?[1-9][0-9]{7,15}$/;

export function normalizePhone(value) {
  return String(value || "").replace(/[\s().-]/g, "");
}

export function isValidPhone(value) {
  return phoneRegex.test(normalizePhone(value));
}

export function maskToken(token) {
  const value = String(token || "");
  if (value.length < 12) return "••••";
  return `${value.slice(0, 6)}••••${value.slice(-4)}`;
}

export function parseTags(value) {
  return String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function formatNumber(value) {
  return new Intl.NumberFormat().format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
