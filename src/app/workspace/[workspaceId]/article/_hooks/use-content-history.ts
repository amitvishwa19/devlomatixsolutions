import { useState, useEffect } from "react";

export interface HistoryEntry {
  id: string;
  topic: string;
  platform: string;
  tone: string;
  contentType: string;
  language: string;
  content: string;
  createdAt: string;
}

const STORAGE_KEY = "content-generator-history";
const MAX_ENTRIES = 50;

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useContentHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const addEntry = (entry: Omit<HistoryEntry, "id" | "createdAt">) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setHistory((prev) => [newEntry, ...prev].slice(0, MAX_ENTRIES));
  };

  const removeEntry = (id: string) => {
    setHistory((prev) => prev.filter((e) => e.id !== id));
  };

  const clearHistory = () => setHistory([]);

  return { history, addEntry, removeEntry, clearHistory };
}