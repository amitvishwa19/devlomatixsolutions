"use client"
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, X } from "lucide-react";
import { useRecentlyViewed } from "../_hooks/useRecentlyViewed";
import { products } from "../_data/products";

const RecentlyViewed = ({ excludeId }) => {
  const { ids, clear } = useRecentlyViewed();
  const items = ids
    .filter((id) => id !== excludeId)
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean)
    .slice(0, 6);

  if (items.length === 0) return null;

  return (
    <section className="py-12 border-t border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gold" />
            <h2 className="font-serif text-xl md:text-2xl">
              Recently <span className="text-gold italic">Viewed</span>
            </h2>
          </div>
          <button
            onClick={clear}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            aria-label="Clear recently viewed"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {items.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="snap-start shrink-0 w-44"
            >
              <Link
                href={`/product/${p.id}`}
                className="block glass-card rounded-xl overflow-hidden group hover:border-primary/30 transition-all"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-medium line-clamp-1">{p.name}</h3>
                  <p className="text-gold text-sm mt-1">₹{p.price.toLocaleString()}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;