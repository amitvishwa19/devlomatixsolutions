'use client';

import React, { useState, useMemo } from "react";
import ProductCard from "../_components/ProductCard";
import { motion } from "framer-motion";
import { products, categories } from "../_data/products";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function CrystalAuraShopPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = activeCategory === "all" || p.category === activeCategory;
      const matchesSearch =
        search.trim() === "" ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  return (
    <div className="min-h-screen bg-background pt-12 pb-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-primary text-[10px] tracking-[0.3em] uppercase mb-4 font-sans font-black">
            ✦ Browse Our Collection ✦
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-foreground mb-6">
            <span className="text-gold-gradient font-semibold">Sacred</span> Shop
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Explore our curated collection of authentic healing crystals, gemstones, and spiritual tools. Expertly sourced for your journey.
          </p>
          <div className="section-divider w-48 mx-auto mt-8" />
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16 space-y-8"
        >
          <div className="relative max-w-xl mx-auto group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search crystals, bracelets, pyramids..."
              className="pl-12 py-7 bg-white/[0.03] border-white/5 rounded-2xl placeholder:text-muted-foreground/40 text-foreground focus:ring-primary/20 transition-all shadow-xl"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-6 py-2.5 rounded-full text-xs font-sans tracking-widest uppercase font-black transition-all duration-300 border ${
                  activeCategory === cat.value
                    ? "bg-gold-gradient text-white border-transparent shadow-lg shadow-primary/20"
                    : "border-white/5 text-muted-foreground hover:border-white/20 hover:text-foreground bg-white/[0.02]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>

        {filtered.length === 0 ? (
          <div className="text-center py-32 glass-card rounded-3xl">
            <Search className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-light text-lg">No sacred treasures found</p>
            <p className="text-muted-foreground/40 text-xs mt-1 uppercase tracking-widest font-bold">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {filtered.map((product, index) => (
              <ProductCard key={product.id} {...product} delay={index * 0.05} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
