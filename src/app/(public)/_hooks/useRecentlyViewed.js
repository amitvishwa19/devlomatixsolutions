import { useEffect, useState, useCallback } from "react";

const KEY = "crystalaura_recently_viewed";
const MAX = 8;

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
};

export const useRecentlyViewed = () => {
  const [ids, setIds] = useState(read);

  const track = useCallback((id) => {
    if (!id) return;
    setIds((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(KEY);
    setIds([]);
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === KEY) setIds(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return { ids, track, clear };
};