export interface SearchHistoryEntry {
  keyword: string;
  category: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  timestamp: number;
}

const STORAGE_KEY = 'leadfinder_search_history';
const MAX_ENTRIES = 10;

export function getSearchHistory(): SearchHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSearchEntry(entry: Omit<SearchHistoryEntry, 'timestamp'>): void {
  if (!entry.keyword && !entry.category && !entry.country) return;

  const history = getSearchHistory();

  // Deduplicate by matching all fields
  const isDuplicate = history.some(
    (h) =>
      h.keyword === entry.keyword &&
      h.category === entry.category &&
      h.country === entry.country &&
      h.state === entry.state &&
      h.city === entry.city &&
      h.pincode === entry.pincode
  );

  if (isDuplicate) {
    // Move to front
    const filtered = history.filter(
      (h) =>
        !(
          h.keyword === entry.keyword &&
          h.category === entry.category &&
          h.country === entry.country &&
          h.state === entry.state &&
          h.city === entry.city &&
          h.pincode === entry.pincode
        )
    );
    filtered.unshift({ ...entry, timestamp: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ENTRIES)));
  } else {
    history.unshift({ ...entry, timestamp: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_ENTRIES)));
  }
}

export function getDisplayLabel(entry: SearchHistoryEntry): string {
  const parts: string[] = [];
  if (entry.keyword) parts.push(entry.keyword);
  if (entry.category && entry.category !== 'All Categories') parts.push(entry.category);
  if (entry.city) parts.push(entry.city);
  else if (entry.state) parts.push(entry.state);
  else if (entry.country) parts.push(entry.country);
  return parts.join(' · ') || 'Search';
}
