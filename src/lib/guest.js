'use client';

const GUEST_EMAIL_KEY = 'crystal-aura-guest-email';
const ABANDONED_SEARCHES_KEY = 'crystal-aura-abandoned-searches';

export const guestUtils = {
  saveGuestEmail: (email) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(GUEST_EMAIL_KEY, email);
    return email;
  },

  getGuestEmail: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(GUEST_EMAIL_KEY);
  },

  clearGuestEmail: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(GUEST_EMAIL_KEY);
  },

  saveSearchQuery: (query, resultsCount) => {
    if (typeof window === 'undefined') return;
    const searches = JSON.parse(localStorage.getItem(ABANDONED_SEARCHES_KEY) || '[]');
    const newSearch = {
      query,
      resultsCount,
      timestamp: new Date().toISOString(),
    };
    searches.unshift(newSearch);
    localStorage.setItem(ABANDONED_SEARCHES_KEY, JSON.stringify(searches.slice(0, 20)));
  },

  getSearchHistory: () => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem(ABANDONED_SEARCHES_KEY) || '[]');
  },

  clearSearchHistory: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ABANDONED_SEARCHES_KEY);
  },

  suggestRelatedSearches: (currentQuery) => {
    const history = guestUtils.getSearchHistory();
    const queries = history.map((s) => s.query.toLowerCase());
    const related = queries.filter(
      (q) => q.includes(currentQuery.toLowerCase()) && q !== currentQuery.toLowerCase()
    );
    return [...new Set(related)].slice(0, 5);
  },
};

export default guestUtils;