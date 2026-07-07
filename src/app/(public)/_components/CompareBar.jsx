"use client"
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, X, ArrowRight } from "lucide-react";
import { useCompare } from "../_contexts/CompareContext";
import { products } from "../_data/products";

const CompareBar = () => {
  const { ids, remove, clear, max } = useCompare();
  const items = products.filter((p) => ids.includes(p.id));

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1rem)] max-w-3xl"
        >
          <div className="glass-card rounded-2xl p-3 md:p-4 border-gold/30 shadow-xl bg-card/95 backdrop-blur-md">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-gold tracking-widest uppercase">
                <Scale className="w-4 h-4" /> Compare
                <span className="text-muted-foreground normal-case tracking-normal">({items.length}/{max})</span>
              </div>
              <div className="flex items-center gap-2 flex-1 overflow-x-auto">
                {items.map((p) => (
                  <div key={p.id} className="relative shrink-0">
                    <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-border" />
                    <button
                      onClick={() => remove(p.id)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                      aria-label={`Remove ${p.name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={clear} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
              <Link
                href="/compare"
                className="gold-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity"
              >
                Compare <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CompareBar;
