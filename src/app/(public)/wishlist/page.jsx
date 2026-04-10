'use client';

import React from "react";
import ProductCard from "../_components/ProductCard";
import { motion } from "framer-motion";
import { useWishlist } from "../_context/CrystalAuraProviders";
import { Heart, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CrystalAuraWishlistPage() {
  const { items } = useWishlist();

  return (
    <div className="min-h-screen bg-transparent pt-12 pb-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-primary text-[10px] tracking-[0.3em] uppercase mb-4 font-sans font-black">
            ✦ Your Favorites ✦
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-foreground mb-6">
            <span className="text-gold-gradient font-semibold">Wish</span>list
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            {items.length > 0
              ? "Your curated collection of sacred treasures awaits. Revisit your favorites and bring home the energy you need."
              : "Your spiritual journey is personal. Start adding crystals and sacred items to your wishlist as you explore our collection."}
          </p>
          <div className="section-divider w-48 mx-auto mt-8" />
        </motion.div>

        {items.length === 0 ? (
          <div className="text-center py-32 glass-card rounded-3xl bg-white/[0.02]">
            <div className="w-20 h-20 bg-white/[0.03] rounded-full mx-auto flex items-center justify-center mb-8 border border-white/5">
                <Heart className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-muted-foreground font-light text-lg mb-2">Your wishlist is currently empty</p>
            <p className="text-muted-foreground/40 text-[10px] uppercase font-bold tracking-widest mb-10">Discover your next sacred companion</p>
            <Link href="/crystalaura/shop">
              <Button className="bg-gold-gradient text-white px-10 py-7 rounded-2xl font-sans tracking-[0.2em] font-black uppercase text-[10px] hover:opacity-90 shadow-xl shadow-primary/20 transition-all">
                <Search className="w-4 h-4 mr-2" />
                Browse Shop
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {items.map((product, index) => (
              <ProductCard key={product.id} {...product} delay={index * 0.05} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
