'use client';

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart, useWishlist } from "../_context/CrystalAuraProviders";

// Inline SVG Icons for Wishlist
const HeartIcon = ({ className = "w-5 h-5", fill = "none" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
);

const TrashIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);

const ShoppingBagIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);

const StarIcon = ({ className = "w-3 h-3" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

const XIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export default function WishlistPage() {
  const { items, toggleWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();
  const [quickView, setQuickView] = useState(null);

  return (
    <div className="min-h-screen bg-[#06040a] pt-32 pb-24 text-foreground font-sans">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Wishlist Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <span className="text-[10px] font-sans tracking-[0.35em] text-primary uppercase font-bold block mb-3">
              ✦ Saved For Later ✦
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
              My <span className="shimmer-text italic font-normal">Wishlist</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-xs">
              {items.length} {items.length === 1 ? "mineral curation" : "mineral curations"} saved
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="glass-card rounded-3xl py-20 flex flex-col items-center text-center border border-white/5 relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mb-6">
              <HeartIcon className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold mb-2">Your Wishlist is Empty</h2>
            <p className="text-muted-foreground text-xs mb-8 max-w-sm leading-relaxed">
              Tap the heart icon on any crystal curation across our shop to save it here for later.
            </p>
            <Link
              href="/shop"
              className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl px-8 py-3.5 text-xs font-bold tracking-widest uppercase transition-all duration-300 active:scale-95 shadow-lg shadow-primary/5"
            >
              Browse Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {items.map((p, i) => {
                const priceVal = p.priceNum || p.price;
                const originalPriceVal = p.originalPriceNum || p.originalPrice;
                const hasDiscount = originalPriceVal && originalPriceVal > priceVal;

                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="glass-card rounded-2xl overflow-hidden border border-white/5 flex flex-col justify-between hover-glow-card group"
                  >
                    <div className="relative overflow-hidden aspect-[4/5] bg-white/5">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => toggleWishlist(p)}
                        aria-label="Remove from wishlist"
                        className="absolute top-4 right-4 p-2.5 rounded-xl bg-[#06040a]/80 backdrop-blur-md border border-white/10 hover:border-red-500/40 text-muted-foreground hover:text-red-400 transition-all active:scale-90"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>

                      {/* Quick View Button */}
                      <button
                        onClick={() => setQuickView(p)}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 bg-[#06040a]/90 backdrop-blur-md border border-white/10 text-[10px] tracking-widest uppercase font-bold px-4 py-2 rounded-xl"
                      >
                        Quick View
                      </button>
                    </div>

                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] tracking-widest text-primary font-bold uppercase">{p.category}</span>
                        <h3 className="font-serif font-bold text-base mt-1 text-foreground leading-snug truncate group-hover:text-primary transition-colors duration-300">
                          {p.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <StarIcon className="w-3.5 h-3.5 text-primary" />
                          <span className="text-[10px] font-mono text-muted-foreground">{p.rating} · {p.reviews} reviews</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4">
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif font-bold text-foreground">₹{priceVal.toLocaleString()}</span>
                          {hasDiscount && (
                            <span className="text-[9px] line-through text-muted-foreground/60">
                              ₹{originalPriceVal.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => addToCart({ ...p, priceNum: priceVal })}
                          className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/25 hover:border-primary/45 transition-all duration-300 active:scale-95 flex items-center gap-1.5 text-[9px] tracking-widest font-bold uppercase"
                        >
                          <ShoppingBagIcon className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickView && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickView(null)}
              className="fixed inset-0 bg-[#06040a]/90 backdrop-blur-sm z-50 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
            >
              <div className="glass-card rounded-3xl max-w-2xl w-full pointer-events-auto overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-white/10 max-h-[85vh] overflow-y-auto">
                <div className="relative aspect-square md:aspect-auto bg-white/5">
                  <img
                    src={quickView.image}
                    alt={quickView.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 relative flex flex-col justify-between">
                  <button
                    onClick={() => setQuickView(null)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-xl hover:bg-white/5 transition-all"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                  <div>
                    <span className="text-[9px] tracking-widest text-primary font-bold uppercase">{quickView.category}</span>
                    <h3 className="font-serif text-xl font-bold mt-1 mb-2 text-foreground leading-snug">{quickView.name}</h3>
                    
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-xl font-serif font-bold text-foreground">
                        ₹{(quickView.priceNum || quickView.price).toLocaleString()}
                      </span>
                      {(quickView.originalPriceNum || quickView.originalPrice) && (
                        <span className="text-xs line-through text-muted-foreground/60">
                          ₹{(quickView.originalPriceNum || quickView.originalPrice).toLocaleString()}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                      {quickView.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      addToCart({ ...quickView, priceNum: quickView.priceNum || quickView.price });
                      setQuickView(null);
                    }}
                    className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl py-3 text-xs font-bold tracking-widest uppercase transition-all duration-300 active:scale-95 shadow-lg shadow-primary/5 flex items-center justify-center gap-2"
                  >
                    <ShoppingBagIcon className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}