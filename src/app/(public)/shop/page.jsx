'use client';

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart, useWishlist } from "../_context/CrystalAuraProviders";
import { products } from "../_data/products";

// Inline SVG Icons for Lucide bypass
const SearchIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);

const HeartIcon = ({ className = "w-4 h-4", fill = "none" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
);

const ShoppingBagIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);

const FilterIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
);

const StarIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

const categories = ["All Products", "Crystals", "Jewelry", "Meditation", "Vastu"];

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Products");
  const [maxPrice, setMaxPrice] = useState(6000);
  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(true);

  const { addItem: addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeTab === "All Products" || p.category.toLowerCase() === activeTab.toLowerCase();
      
      // Check if priceNum exists, else use price
      const priceVal = p.priceNum || p.price;
      const matchesPrice = priceVal <= maxPrice;

      return matchesSearch && matchesCategory && matchesPrice;
    });

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => (a.priceNum || a.price) - (b.priceNum || b.price));
        break;
      case "price-desc":
        list.sort((a, b) => (b.priceNum || b.price) - (a.priceNum || a.price));
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    return list;
  }, [search, activeTab, maxPrice, sort]);

  return (
    <div className="min-h-screen bg-[#06040a] pt-32 pb-24 text-foreground font-sans">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Editorial Page Header */}
        <div className="text-center mb-16">
          <span className="text-[10px] font-sans tracking-[0.35em] text-primary uppercase font-bold block mb-3">
            ✦ Premium Natural Curations ✦
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-4">
            Sacred <span className="shimmer-text italic font-normal">Shop</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            Ethically sourced, high-vibration minerals and gemstones meticulously cataloged to guide your spiritual practices and harmonize contemporary spaces.
          </p>
          <div className="w-16 h-[1px] bg-primary/30 mx-auto mt-6" />
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Left Column: Search & Filters Panel */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Search Input */}
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search collection..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs tracking-wider placeholder-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all duration-300"
              />
            </div>

            {/* Categories */}
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <h3 className="text-xs font-bold tracking-widest text-primary uppercase mb-4">Categories</h3>
              <div className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`text-left text-xs py-2 px-3 rounded-lg transition-all duration-300 ${
                      activeTab === cat
                        ? "bg-primary/10 text-primary font-bold border-l-2 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <div className="flex justify-between items-baseline mb-4">
                <h3 className="text-xs font-bold tracking-widest text-primary uppercase">Max Price</h3>
                <span className="text-xs font-mono font-bold text-foreground">₹{maxPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="200"
                max="6000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary bg-white/10 h-1 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground mt-2 font-mono">
                <span>₹200</span>
                <span>₹6,000</span>
              </div>
            </div>

            {/* Sorting */}
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <h3 className="text-xs font-bold tracking-widest text-primary uppercase mb-4">Sort By</h3>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs tracking-wider text-muted-foreground focus:outline-none focus:border-primary/50 transition-all cursor-pointer"
              >
                <option value="featured" className="bg-[#0e0b17]">Featured</option>
                <option value="price-asc" className="bg-[#0e0b17]">Price: Low to High</option>
                <option value="price-desc" className="bg-[#0e0b17]">Price: High to Low</option>
                <option value="rating" className="bg-[#0e0b17]">Top Rated</option>
              </select>
            </div>

          </div>

          {/* Right Column: Products Grid */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] tracking-widest text-muted-foreground uppercase font-mono">
                Showing {filteredProducts.length} curations
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="glass-card rounded-2xl p-16 text-center border border-white/5">
                <p className="text-muted-foreground text-sm">No crystals matched your filter criteria.</p>
                <button
                  onClick={() => { setSearch(""); setActiveTab("All Products"); setMaxPrice(6000); setSort("featured"); }}
                  className="mt-4 px-6 py-2.5 rounded-xl border border-primary/20 bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all active:scale-95"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((p, index) => {
                    const priceVal = p.priceNum || p.price;
                    const originalPriceVal = p.originalPriceNum || p.originalPrice;
                    const hasDiscount = originalPriceVal && originalPriceVal > priceVal;

                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="group relative flex flex-col justify-between glass-card rounded-2xl border border-white/5 overflow-hidden hover-glow-card"
                      >
                        {/* Image Showcase */}
                        <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                          />
                          
                          {/* Wishlist Button */}
                          <button
                            onClick={() => toggleWishlist(p)}
                            className="absolute top-4 right-4 p-2 rounded-xl bg-[#06040a]/80 backdrop-blur-md border border-white/10 hover:border-primary/40 text-foreground transition-all duration-300 active:scale-90"
                            aria-label="Wishlist product"
                          >
                            <HeartIcon
                              className={`w-4 h-4 transition-colors ${
                                isWishlisted(p.id) ? "text-primary" : "text-foreground"
                              }`}
                              fill={isWishlisted(p.id) ? "currentColor" : "none"}
                            />
                          </button>
                        </div>

                        {/* Details */}
                        <div className="p-5 flex-grow flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-[9px] tracking-widest text-primary font-bold uppercase">
                                {p.category}
                              </span>
                              <div className="flex items-center gap-1">
                                <StarIcon className="w-3 h-3 text-primary" />
                                <span className="text-[10px] font-mono font-bold text-foreground">{p.rating}</span>
                              </div>
                            </div>
                            <h3 className="font-serif text-lg font-bold leading-snug mb-2 group-hover:text-primary transition-colors duration-300">
                              {p.name}
                            </h3>
                            <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed mb-4">
                              {p.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                            <div className="flex items-baseline gap-2">
                              <span className="font-serif font-bold text-foreground">₹{priceVal.toLocaleString()}</span>
                              {hasDiscount && (
                                <span className="text-[10px] line-through text-muted-foreground/60">
                                  ₹{originalPriceVal.toLocaleString()}
                                </span>
                              )}
                            </div>

                            {/* Add to Cart Button */}
                            <button
                              onClick={() => addToCart({ ...p, priceNum: priceVal })}
                              className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/25 hover:border-primary/45 transition-all duration-300 active:scale-95 flex items-center gap-1.5 text-[10px] tracking-widest font-bold uppercase"
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

        </div>

      </div>
    </div>
  );
}