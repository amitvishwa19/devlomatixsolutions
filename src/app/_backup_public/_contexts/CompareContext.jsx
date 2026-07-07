"use client"
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const CompareContext = createContext(undefined);
const KEY = "crystalaura_compare";
const MAX = 3;

export const CompareProvider = ({ children }) => {
  const [ids, setIds] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) {
        setIds(JSON.parse(stored));
      }
    } catch {}
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch {}
    }
  }, [ids, mounted]);

  const toggle = useCallback((id) => {
    setIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX) return prev;
      return [...prev, id];
    });
  }, []);

  const remove = useCallback((id) => setIds((prev) => prev.filter((x) => x !== id)), []);
  const clear = useCallback(() => setIds([]), []);
  const has = useCallback((id) => ids.includes(id), [ids]);
  const isFull = ids.length >= MAX;

  return (
    <CompareContext.Provider value={{ ids, toggle, remove, clear, has, isFull, max: MAX }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
};