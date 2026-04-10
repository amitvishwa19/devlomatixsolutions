'use client';

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Droplets, Moon, Sun, Heart, Shield } from "lucide-react";

const crystalTypes = [
  {
    name: "Amethyst",
    icon: Moon,
    color: "Purple",
    chakra: "Crown & Third Eye",
    properties: "Calming, intuition, spiritual awareness, stress relief",
    description: "Known as the stone of peace, amethyst brings calm and clarity to the mind. Perfect for meditation and sleep enhancement.",
  },
  {
    name: "Rose Quartz",
    icon: Heart,
    color: "Pink",
    chakra: "Heart",
    properties: "Love, compassion, emotional healing, self-care",
    description: "The universal stone of love. Rose quartz opens the heart chakra and promotes unconditional love, deep inner healing and self-worth.",
  },
  {
    name: "Clear Quartz",
    icon: Sparkles,
    color: "Transparent",
    chakra: "Crown",
    properties: "Amplification, clarity, healing, energy cleansing",
    description: "The master healer. Clear quartz amplifies energy and intention, and is programmable for any purpose.",
  },
  {
    name: "Citrine",
    icon: Sun,
    color: "Golden Yellow",
    chakra: "Solar Plexus",
    properties: "Abundance, confidence, creativity, manifestation",
    description: "The merchant's stone. Citrine attracts prosperity, success and all things good. It also encourages generosity.",
  },
  {
    name: "Black Tourmaline",
    icon: Shield,
    color: "Black",
    chakra: "Root",
    properties: "Protection, grounding, EMF shielding, negativity removal",
    description: "The ultimate protection stone. Black tourmaline creates a powerful shield against negative energies and electromagnetic radiation.",
  },
  {
    name: "Aquamarine",
    icon: Droplets,
    color: "Blue-Green",
    chakra: "Throat",
    properties: "Communication, courage, calming, clarity",
    description: "The stone of the sea. Aquamarine inspires truth, trust, and letting go. It calms the mind and reduces stress.",
  },
];

export default function CrystalAuraGuidePage() {
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
            ✦ Crystal Encyclopedia ✦
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-foreground mb-6">
            <span className="text-gold-gradient font-semibold">Crystal</span> Guide
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Discover the healing properties, chakra associations, and spiritual benefits of our most treasured crystals. Expertly curated for your wellness.
          </p>
          <div className="section-divider w-48 mx-auto mt-8" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {crystalTypes.map((crystal, index) => (
            <motion.div
              key={crystal.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-card border-white/5 bg-white/[0.02] rounded-[2rem] p-10 hover:border-primary/20 transition-all group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -z-10 group-hover:bg-primary/10 transition-colors" />
              <div className="flex items-start gap-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                  <crystal.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-3xl text-foreground mb-2">{crystal.name}</h3>
                  <p className="text-primary text-[10px] uppercase tracking-widest font-black mb-6">
                    {crystal.color} · {crystal.chakra} Chakra
                  </p>
                  <p className="text-muted-foreground font-light leading-relaxed mb-8">
                    {crystal.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {crystal.properties.split(", ").map((prop) => (
                      <span key={prop} className="text-[10px] px-4 py-2 rounded-full border border-white/5 bg-white/[0.03] text-muted-foreground uppercase font-black tracking-widest hover:border-primary/20 hover:text-primary transition-all cursor-default">
                        {prop}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
