'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Inline SVG Icon components to completely bypass Next.js Turbopack lucide-react caching bugs
const SparklesIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.938A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.938l6.135 1.581a.5.5 0 0 1 0 .962L15.5 14.063A2 2 0 0 0 14.063 15.5L12.481 21.64a.5.5 0 0 1-.962 0z"/><path d="M20 3h.01"/><path d="M4 20h.01"/><path d="M18.5 18h.01"/><path d="M5.5 6h.01"/></svg>
);

const chakraData = [
  {
    id: "crown",
    name: "Sahasrara",
    english: "Crown",
    symbol: "ॐ",
    color: "#9b59ff",
    element: "Cosmic Energy",
    cx: 100,
    cy: 60,
    r: 11,
    description: "Highest spiritual center — pure consciousness, divine connection, and universal oneness.",
    affirmation: "I am connected to the infinite source of light.",
    crystals: ["Amethyst", "Clear Quartz", "Selenite"]
  },
  {
    id: "thirdeye",
    name: "Ajna",
    english: "Third Eye",
    symbol: "ॐ",
    color: "#5865f2",
    element: "Light",
    cx: 100,
    cy: 105,
    r: 11,
    description: "Center of wisdom and foresight — intuition, imagination, clarity, and truth.",
    affirmation: "I trust my inner vision and intuition.",
    crystals: ["Lapis Lazuli", "Sodalite", "Fluorite"]
  },
  {
    id: "throat",
    name: "Vishuddha",
    english: "Throat",
    symbol: "हं",
    color: "#3aa6ff",
    element: "Ether",
    cx: 100,
    cy: 155,
    r: 11,
    description: "Center of expression — communication, creative output, and speaking one's truth.",
    affirmation: "I speak my truth with clarity and love.",
    crystals: ["Blue Lace Agate", "Turquoise", "Aquamarine"]
  },
  {
    id: "heart",
    name: "Anahata",
    english: "Heart",
    symbol: "यं",
    color: "#3ecf8e",
    element: "Air",
    cx: 100,
    cy: 215,
    r: 15,
    description: "Bridge between body and spirit — love, compassion, acceptance, and emotional healing.",
    affirmation: "I give and receive love freely.",
    crystals: ["Rose Quartz", "Green Aventurine", "Malachite"]
  },
  {
    id: "solar",
    name: "Manipura",
    english: "Solar Plexus",
    symbol: "रं",
    color: "#f5c542",
    element: "Fire",
    cx: 100,
    cy: 275,
    r: 11,
    description: "Center of personal power — willpower, self-esteem, confidence, and transformation.",
    affirmation: "I am strong, capable, and powerful.",
    crystals: ["Citrine", "Tiger's Eye", "Pyrite"]
  },
  {
    id: "sacral",
    name: "Svadhisthana",
    english: "Sacral",
    symbol: "वं",
    color: "#ff8c2b",
    element: "Water",
    cx: 100,
    cy: 330,
    r: 11,
    description: "Center of creativity and sensation — emotions, passion, sensuality, and adaptability.",
    affirmation: "I honor my feelings and flow with life.",
    crystals: ["Carnelian", "Orange Calcite", "Sunstone"]
  },
  {
    id: "root",
    name: "Muladhara",
    english: "Root",
    symbol: "लं",
    color: "#e23b3b",
    element: "Earth",
    cx: 100,
    cy: 385,
    r: 11,
    description: "Foundation of stability — grounding, survival, physical safety, and root connection.",
    affirmation: "I am safe, grounded, and secure.",
    crystals: ["Black Tourmaline", "Red Jasper", "Hematite"]
  }
];

const SiteChakraMap = () => {
  const [selectedChakra, setSelectedChakra] = useState(chakraData[3]); // Default to Heart

  return (
    <section className="py-24 px-6 relative bg-background overflow-hidden border-t border-white/5">
      {/* Glow background */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center mb-16">
          <div className="w-12 h-12 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <SparklesIcon className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <p className="text-primary text-[10px] tracking-[0.25em] font-sans font-black uppercase mb-2">
            ✦ Energy Map ✦
          </p>
          <h2 className="font-serif text-3xl md:text-5xl text-foreground mb-4">
            The <span className="text-gold-gradient font-semibold italic">Seven Chakras</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm font-light leading-relaxed">
            Tap each spinning wheel of energy to discover its metaphysical properties, elements, and the crystals that restore its flow.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
          
          {/* Interactive Silhouette */}
          <div className="relative flex justify-center bg-white/2 p-6 rounded-3xl border border-white/5 shadow-2xl">
            <svg viewBox="0 0 200 460" className="w-full max-w-[280px] h-auto">
              <defs>
                <radialGradient id="aura" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={selectedChakra.color} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={selectedChakra.color} stopOpacity="0" />
                </radialGradient>
              </defs>
              
              {/* Dynamic Aura Glow around selected chakra */}
              <circle 
                cx="100" 
                cy={selectedChakra.cy} 
                r="70" 
                fill="url(#aura)" 
                className="transition-all duration-500"
              />

              {/* Silhouette drawing */}
              <path 
                d="M100 30 C112 30 120 40 120 52 C120 64 112 72 100 72 C88 72 80 64 80 52 C80 40 88 30 100 30 Z M85 78 L115 78 L120 95 L130 130 L132 200 L128 270 L122 340 L118 400 L110 450 L100 450 L90 450 L82 400 L78 340 L72 270 L68 200 L70 130 L80 95 Z" 
                fill="hsl(var(--secondary))" 
                stroke="hsl(var(--border))" 
                strokeWidth="0.5" 
                opacity="0.4"
              />
              <line x1="100" y1="78" x2="100" y2="420" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.5" />

              {/* Chakra Points Map */}
              {chakraData.map((chakra) => {
                const isSelected = selectedChakra.id === chakra.id;
                return (
                  <g 
                    key={chakra.id} 
                    className="cursor-pointer group"
                    onClick={() => setSelectedChakra(chakra)}
                  >
                    {/* Ring Outer Glow */}
                    <circle 
                      cx={chakra.cx} 
                      cy={chakra.cy} 
                      r={chakra.r} 
                      fill={chakra.color} 
                      opacity={isSelected ? 0.9 : 0.4} 
                      style={{ 
                        transformOrigin: `${chakra.cx}px ${chakra.cy}px`,
                        filter: isSelected ? `drop-shadow(0 0 10px ${chakra.color})` : 'none'
                      }}
                      className="transition-all duration-300 group-hover:opacity-90"
                    />
                    
                    {/* Dot Center */}
                    <circle 
                      cx={chakra.cx} 
                      cy={chakra.cy} 
                      r="4" 
                      fill="hsl(var(--background))" 
                      opacity="0.95" 
                    />
                    
                    {/* Sanskrit symbol */}
                    <text 
                      x={chakra.cx} 
                      y={chakra.cy + 1.5} 
                      textAnchor="middle" 
                      fill={chakra.color} 
                      fontSize="5" 
                      fontWeight="bold"
                    >
                      {chakra.symbol}
                    </text>
                    
                    {/* Sidebar Label text */}
                    <text 
                      x="142" 
                      y={chakra.cy + 2} 
                      fill={isSelected ? chakra.color : "hsl(var(--muted-foreground))"} 
                      fontSize="6" 
                      fontFamily="serif" 
                      fontWeight={isSelected ? "bold" : "normal"}
                      className="transition-colors duration-300 group-hover:fill-foreground"
                    >
                      {chakra.english}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Details Panel */}
          <div className="h-full flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedChakra.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="glass-card rounded-3xl p-6 md:p-10 border-white/5 bg-background/40 backdrop-blur-sm hover:border-primary/10 transition-all duration-500"
                style={{ borderColor: `${selectedChakra.color}33`, boxShadow: '0 15px 35px -10px rgba(0,0,0,0.3)' }}
              >
                {/* Panel Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-background font-bold text-xl select-none"
                    style={{ 
                      backgroundColor: selectedChakra.color,
                      boxShadow: `0 0 20px ${selectedChakra.color}80` 
                    }}
                  >
                    {selectedChakra.symbol}
                  </div>
                  <div>
                    <p className="text-[9px] tracking-[0.25em] font-sans font-black uppercase" style={{ color: selectedChakra.color }}>
                      {selectedChakra.element} Element
                    </p>
                    <h3 className="font-serif text-2xl md:text-3xl text-foreground">
                      {selectedChakra.name} <span className="text-muted-foreground text-sm font-light">({selectedChakra.english})</span>
                    </h3>
                  </div>
                </div>

                {/* Body & Affirmation */}
                <p className="text-muted-foreground/80 text-sm leading-relaxed mb-6 font-light">
                  {selectedChakra.description}
                </p>
                <div 
                  className="italic text-sm border-l-2 pl-4 py-1 mb-8 bg-white/2"
                  style={{ borderColor: selectedChakra.color, color: selectedChakra.color }}
                >
                  "{selectedChakra.affirmation}"
                </div>

                {/* Healing Crystals Products links */}
                <p className="text-[9px] text-primary font-sans font-black tracking-widest uppercase mb-3">
                  ✦ HEALING STONES
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedChakra.crystals.map((c) => (
                    <Link
                      key={c}
                      href={`/shop`}
                      className="text-[10px] font-sans font-bold tracking-widest uppercase border border-white/5 bg-white/2 hover:border-primary/50 hover:bg-primary/5 px-4.5 py-2.5 rounded-full text-foreground transition-all duration-300 shadow-sm"
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SiteChakraMap;
