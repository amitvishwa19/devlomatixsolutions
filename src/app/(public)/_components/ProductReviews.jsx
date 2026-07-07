"use client"
import { useMemo, useRef, useState } from "react";
import { Star, ShieldCheck, Camera, X } from "lucide-react";
import { motion } from "framer-motion";
import { useReviews } from "../_contexts/ReviewsContext";

const StarRow = ({ value, size = "w-4 h-4", interactive = false, onChange }) => (
  <div className="flex">
    {[1, 2, 3, 4, 5].map((i) => (
      <button
        key={i}
        type={interactive ? "button" : undefined}
        onClick={interactive ? () => onChange?.(i) : undefined}
        className={interactive ? "cursor-pointer" : "cursor-default"}
        aria-label={interactive ? `Rate ${i} stars` : undefined}
        tabIndex={interactive ? 0 : -1}
      >
        <Star className={`${size} ${i <= value ? "text-gold fill-current" : "text-muted-foreground"}`} />
      </button>
    ))}
  </div>
);

const ProductReviews = ({ productId }) => {
  const { getReviews, addReview } = useReviews();
  const reviews = getReviews(productId);
  const fileRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState({ author: "", title: "", text: "", rating: 5, photos: [] });

  const stats = useMemo(() => {
    const total = reviews.length;
    const avg = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
    const breakdown = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
    }));
    return { total, avg, breakdown };
  }, [reviews]);

  const onPhotos = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 3);
    const readers = files.map(
      (f) =>
        new Promise((res) => {
          const fr = new FileReader();
          fr.onload = () => res(fr.result);
          fr.readAsDataURL(f);
        })
    );
    Promise.all(readers).then((photos) =>
      setForm((prev) => ({ ...prev, photos: [...prev.photos, ...photos].slice(0, 3) }))
    );
  };

  const removePhoto = (idx) =>
    setForm((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.author.trim() || !form.text.trim()) {
      return;
    }
    addReview(productId, {
      author: form.author.trim(),
      title: form.title.trim() || "Verified review",
      text: form.text.trim(),
      rating: form.rating,
      photos: form.photos,
    });
    setForm({ author: "", title: "", text: "", rating: 5, photos: [] });
    setShowForm(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <section className="mt-16 glass-card rounded-2xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="text-gold text-xs tracking-widest mb-1">✦ COMMUNITY VOICES</p>
          <h2 className="font-serif text-2xl">
            Customer <span className="text-gold italic">Reviews</span>
          </h2>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-sm border border-gold/40 hover:bg-gold/10 text-gold px-4 py-2 rounded-lg transition-colors"
        >
          {showForm ? "Cancel" : "Write a review"}
        </button>
      </div>
      {showSuccess && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
          Thank you ✦ Your review has been published.
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-border">
        <div className="md:col-span-1 text-center md:text-left">
          <div className="font-serif text-5xl text-gold">{stats.avg.toFixed(1)}</div>
          <StarRow value={Math.round(stats.avg)} />
          <p className="text-xs text-muted-foreground mt-2">Based on {stats.total} verified reviews</p>
        </div>
        <div className="md:col-span-2 space-y-1.5">
          {stats.breakdown.map(({ star, count }) => {
            const pct = stats.total ? (count / stats.total) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-8 text-muted-foreground">{star}★</span>
                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={submit}
          className="bg-secondary/40 border border-border rounded-xl p-5 mb-8 space-y-4"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-muted-foreground">Your rating:</span>
            <StarRow value={form.rating} size="w-6 h-6" interactive onChange={(r) => setForm({ ...form, rating: r })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Your name"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="Review title (optional)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <textarea
            required
            rows={4}
            placeholder="Share your experience with this crystal..."
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-sm inline-flex items-center gap-2 border border-border hover:bg-secondary px-3 py-2 rounded-lg transition-colors"
            >
              <Camera className="w-4 h-4 text-gold" /> Add photos
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onPhotos} />
            {form.photos.map((src, i) => (
              <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                <img src={src} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-background/80 flex items-center justify-center"
                  aria-label="Remove photo"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <p className="text-[11px] text-muted-foreground">Up to 3 photos</p>
          </div>
          <button type="submit" className="gold-gradient text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Submit Review
          </button>
        </motion.form>
      )}

      <div className="space-y-6">
        {reviews.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border-b border-border last:border-0 pb-6 last:pb-0"
          >
            <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm">{r.author}</p>
                  {r.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
                      <ShieldCheck className="w-3 h-3" /> Verified Buyer
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <StarRow value={r.rating} />
                  <span className="text-[11px] text-muted-foreground">{r.date}</span>
                </div>
              </div>
            </div>
            {r.title && <p className="font-serif text-base mb-1">{r.title}</p>}
            <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>
            {r.photos?.length > 0 && (
              <div className="flex gap-2 mt-3">
                {r.photos.map((src, i) => (
                  <a key={i} href={src} target="_blank" rel="noreferrer" className="w-20 h-20 rounded-lg overflow-hidden border border-border block">
                    <img src={src} alt={`Review ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ProductReviews;