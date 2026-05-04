"use client"
import { createContext, useContext, useEffect, useState, useCallback } from "react";

const KEY = "crystalaura_reviews_v1";

const seedReviews = {
  __seed: [
    {
      id: "s1",
      author: "Ananya R.",
      rating: 5,
      title: "Genuinely magical",
      text: "The energy is real — I wear it daily and feel calmer. Beautifully packaged with a small care card.",
      verified: true,
      date: "2026-03-12",
      photos: [],
    },
    {
      id: "s2",
      author: "Karthik M.",
      rating: 4,
      title: "Lovely craftsmanship",
      text: "Stones are well-polished and threading feels strong. Took one star off only because delivery took 5 days.",
      verified: true,
      date: "2026-02-28",
      photos: [],
    },
    {
      id: "s3",
      author: "Priya S.",
      rating: 5,
      title: "Worth every rupee",
      text: "Crystal arrived cleansed and gift-wrapped. The vibration is noticeable during meditation. Highly recommend!",
      verified: true,
      date: "2026-01-19",
      photos: [],
    },
  ],
};

const ReviewsContext = createContext(null);

export const ReviewsProvider = ({ children }) => {
  const [reviewsByProduct, setReviewsByProduct] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        setReviewsByProduct(JSON.parse(raw));
      }
    } catch {}
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      try { localStorage.setItem(KEY, JSON.stringify(reviewsByProduct)); } catch {}
    }
  }, [reviewsByProduct, mounted]);

  const getReviews = useCallback(
    (productId) => {
      const user = reviewsByProduct[productId] || [];
      return [...user, ...seedReviews.__seed];
    },
    [reviewsByProduct]
  );

  const addReview = useCallback((productId, review) => {
    setReviewsByProduct((prev) => {
      const next = { ...prev };
      const list = next[productId] ? [...next[productId]] : [];
      list.unshift({
        id: `u_${Date.now()}`,
        verified: true,
        date: new Date().toISOString().slice(0, 10),
        photos: [],
        ...review,
      });
      next[productId] = list;
      return next;
    });
  }, []);

  return (
    <ReviewsContext.Provider value={{ getReviews, addReview }}>
      {children}
    </ReviewsContext.Provider>
  );
};

export const useReviews = () => {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error("useReviews must be used within ReviewsProvider");
  return ctx;
};