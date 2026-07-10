'use client';

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { products } from "../_data/products";
import { useImagePack } from "../_context/CrystalAuraProviders";

// Inline SVG Icon components to completely bypass Next.js Turbopack lucide-react caching bugs
const SparklesIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.938A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.938l6.135 1.581a.5.5 0 0 1 0 .962L15.5 14.063A2 2 0 0 0 14.063 15.5L12.481 21.64a.5.5 0 0 1-.962 0z"/><path d="M20 3h.01"/><path d="M4 20h.01"/><path d="M18.5 18h.01"/><path d="M5.5 6h.01"/></svg>
);

const ArrowRightIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

// Deterministic pick per day so it's stable for everyone for the day
const dayIndex = () => {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const SiteCrystalOfTheDay = () => {
  const [dateStr, setDateStr] = useState("");
  const { getProductImage } = useImagePack();

  useEffect(() => {
    const formatted = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    setDateStr("✦ " + formatted);
  }, []);

  const product = useMemo(() => {
    // Cycle through first 9 products (p1 - p9) which have local image packs
    const idx = dayIndex() % 9;
    return products.find(p => p.id === `p${idx + 1}`);
  }, []);

  if (!product) return null;

  const resolvedImage = getProductImage(product.id, product.image);
  const priceVal = product.priceNum || product.price;

  return (
    <section className="py-24 px-6 relative bg-gradient-to-b from-[#06040a] to-[#0d091a]">
      {/* Back glow spot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-card rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 shadow-2xl border-white/5 hover:border-primary/20 transition-colors duration-700"
          style={{ boxShadow: '0 20px 50px -15px rgba(220,160,40,0.1)' }}
        >
          {/* Left Column: Image with Badge */}
          <div className="relative h-96 md:h-auto min-h-[400px] overflow-hidden group">
            <img 
              src={resolvedImage} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105 filter brightness-[0.9]"
            />
            {/* Glassmorphic crystal of the day floating badge */}
            <div className="absolute top-8 left-8 inline-flex items-center gap-2.5 bg-background/80 backdrop-blur-md border border-primary/20 px-5 py-2.5 rounded-full shadow-lg shadow-black/20">
              <SparklesIcon className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-[9px] tracking-[0.25em] text-primary font-sans font-black uppercase">
                Crystal of the Day
              </span>
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="p-8 md:p-16 flex flex-col justify-center bg-[#0d0917]/20 backdrop-blur-md border-l border-white/5 md:border-l">
            <p className="text-primary text-[10px] tracking-[0.25em] font-sans font-black uppercase mb-4">
              {dateStr || "✦ Today's Pick"}
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4 leading-tight">
              Today's <span className="text-gold-gradient italic font-normal">Sacred</span> Item
            </h2>
            <h3 className="font-serif text-2xl text-foreground/90 mb-5 tracking-wide">
              {product.name}
            </h3>
            <p className="text-muted-foreground/80 text-sm leading-relaxed mb-8 font-light">
              {product.description}
            </p>
            
            <div className="flex items-center gap-4 mb-8">
              <div>
                <p className="text-xs text-muted-foreground/60 uppercase tracking-widest font-sans font-bold">Special Price</p>
                <div className="flex items-baseline gap-2.5 mt-1">
                  <span className="text-3xl font-serif font-bold text-foreground">₹{priceVal}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through font-light">₹{product.originalPrice}</span>
                  )}
                </div>
              </div>
              {product.originalPrice && (
                <div className="bg-primary/5 border border-primary/20 rounded-full px-3.5 py-1 text-[9px] font-sans font-black uppercase tracking-widest text-primary animate-pulse">
                  Save {Math.round((1 - priceVal / product.originalPrice) * 100)}%
                </div>
              )}
            </div>
            
            <Link href={`/shop/${product.id}`} className="self-start">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gold-gradient text-white font-sans tracking-widest uppercase font-black text-xs px-10 py-5 rounded-full flex items-center gap-2 hover:opacity-95 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 border border-primary/15"
              >
                Discover Crystal
                <ArrowRightIcon className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SiteCrystalOfTheDay;
