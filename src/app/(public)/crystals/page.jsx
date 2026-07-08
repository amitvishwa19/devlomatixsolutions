'use client';

import React from "react";
import { motion } from "framer-motion";
import { crystalTypes, sunshineCrystals } from "../_data/products";

// Inline SVG Icon for Sun
const SunIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
);

export default function CrystalsPage() {
  return (
    <div className="min-h-screen bg-[#06040a] pt-32 pb-24 text-foreground font-sans">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Encyclopedia Header */}
        <div className="text-center mb-16">
          <span className="text-[10px] font-sans tracking-[0.35em] text-primary uppercase font-bold block mb-3">
            ✦ Crystal Encyclopedia ✦
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-4">
            Healing <span className="shimmer-text italic font-normal">Crystals</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            Deep dive into the metaphysical properties, astrological alignments, and energy nodes associated with Earth's structural mineral treasures.
          </p>
          <div className="w-16 h-[1px] bg-primary/30 mx-auto mt-6" />
        </div>

        {/* Highlight Section: Solar Energy */}
        <section className="mb-20">
          <div className="glass-card rounded-3xl p-8 md:p-12 border border-white/5 relative overflow-hidden">
            
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20 blur-3xl bg-primary/30" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/15 text-primary border border-primary/20">
                  <SunIcon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[9px] tracking-widest text-primary font-bold uppercase block">Energy Collection</span>
                  <h3 className="font-serif text-lg font-bold text-foreground">Solar Radiance</h3>
                </div>
              </div>

              <h2 className="text-2xl md:text-4xl font-serif font-bold mb-4">
                Crystals for <span className="text-primary italic">Sunshine</span> & Vitality
              </h2>
              <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed mb-8">
                These warm, radiant stones channel solar energy — perfect for boosting confidence, manifestation, joy, and illuminating your inner light on low-energy days.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sunshineCrystals.map((c, i) => (
                  <motion.div
                    key={c.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="glass-card rounded-2xl overflow-hidden border border-white/5 group hover:border-primary/20"
                  >
                    <div className="overflow-hidden aspect-[16/9] bg-white/5">
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-serif text-base font-bold text-foreground">{c.name}</h4>
                        <span className="text-[8px] uppercase tracking-wider text-primary border border-primary/30 rounded-full px-2.5 py-0.5 bg-primary/5 font-black">
                          {c.benefit}
                        </span>
                      </div>
                      <p className="text-[10px] tracking-widest text-primary font-bold uppercase mb-2">{c.chakra} Chakra</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{c.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Full Collection Section */}
        <section>
          <h2 className="font-serif text-3xl font-bold mb-8 text-center">
            Comprehensive <span className="shimmer-text italic font-normal">Catalog</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {crystalTypes.map((crystal, i) => (
              <motion.div
                key={crystal.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="glass-card rounded-2xl overflow-hidden border border-white/5 group hover-glow-card"
              >
                <div className="overflow-hidden aspect-[4/3] bg-white/5">
                  <img
                    src={crystal.image}
                    alt={crystal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-base font-bold text-foreground mb-1">{crystal.name}</h3>
                  <p className="text-[10px] tracking-widest text-primary font-bold uppercase mb-2">{crystal.chakra} Chakra</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{crystal.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}