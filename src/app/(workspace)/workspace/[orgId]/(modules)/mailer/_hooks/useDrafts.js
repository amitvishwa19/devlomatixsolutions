import { useState, useEffect, useCallback } from 'react';

const DRAFTS_STORAGE_KEY = 'mailbox-drafts';

export function useDrafts() {
  const [drafts, setDrafts] = useState([]);

  // Load drafts from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(DRAFTS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setDrafts(parsed.map((d) => ({
          ...d,
          savedAt: new Date(d.savedAt),
        })));
      } catch (e) {
        console.error('Failed to parse drafts:', e);
      }
    }
  }, []);

  // Save drafts to localStorage when they change
  useEffect(() => {
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
  }, [drafts]);

  const saveDraft = useCallback((draft) => {
    const newDraft = {
      ...draft,
      id: Date.now().toString(),
      savedAt: new Date(),
    };
    setDrafts(prev => [newDraft, ...prev]);
    return newDraft;
  }, []);

  const updateDraft = useCallback((id, updates) => {
    setDrafts(prev => prev.map(d => 
      d.id === id 
        ? { ...d, ...updates, savedAt: new Date() } 
        : d
    ));
  }, []);

  const deleteDraft = useCallback((id) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
  }, []);

  const getDraft = useCallback((id) => {
    return drafts.find(d => d.id === id);
  }, [drafts]);

  return {
    drafts,
    saveDraft,
    updateDraft,
    deleteDraft,
    getDraft,
  };
}