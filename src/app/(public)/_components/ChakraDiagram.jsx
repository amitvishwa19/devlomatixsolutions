"use client"
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

const chakras = [
  { id: "crown", name: "Sahasrara", english: "Crown", color: "#9b59ff", cy: 60, sanskrit: "ॐ", element: "Thought", crystals: ["Amethyst", "Clear Quartz", "Selenite"], affirmation: "I am connected to the divine.", desc: "Seat of pure consciousness, spiritual connection, and unity with all that is." },
  { id: "thirdeye", name: "Ajna", english: "Third Eye", color: "#5865f2", cy: 105, sanskrit: "ॐ", element: "Light", crystals: ["Lapis Lazuli", "Sodalite", "Amethyst"], affirmation: "I trust my inner wisdom.", desc: "Centre of intuition, insight, imagination, and inner knowing." },
  { id: "throat", name: "Vishuddha", english: "Throat", color: "#3aa6ff", cy: 155, sanskrit: "हं", element: "Ether", crystals: ["Aquamarine", "Lapis Lazuli", "Turquoise"], affirmation: "I speak my truth with clarity.", desc: "Voice of authentic expression, truth, and clear communication." },
  { id: "heart", name: "Anahata", english: "Heart", color: "#3ecf8e", cy: 215, sanskrit: "यं", element: "Air", crystals: ["Rose Quartz", "Green Aventurine", "Malachite"], affirmation: "I give and receive love freely.", desc: "Bridge between body and spirit — love, compassion, and emotional balance." },
  { id: "solar", name: "Manipura", english: "Solar Plexus", color: "#f5c542", cy: 275, sanskrit: "रं", element: "Fire", crystals: ["Citrine", "Tiger Eye", "Pyrite"], affirmation: "I am confident and powerful.", desc: "Furnace of personal power, willpower, confidence, and self-esteem." },
  { id: "sacral", name: "Svadhisthana", english: "Sacral", color: "#ff8c2b", cy: 330, sanskrit: "वं", element: "Water", crystals: ["Carnelian", "Sunstone", "Orange Calcite"], affirmation: "I embrace pleasure and creativity.", desc: "Wellspring of creativity, sensuality, emotion, and joy." },
  { id: "root", name: "Muladhara", english: "Root", color: "#e23b3b", cy: 385, sanskrit: "लं", element: "Earth", crystals: ["Black Tourmaline", "Red Jasper", "Hematite"], affirmation: "I am safe, grounded, and stable.", desc: "Foundation of stability, safety, grounding, and physical vitality." },
];

const ChakraDiagram = () => {
  const [active, setActive] = useState(chakras[3]); // start on heart

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Sparkles className="w-8 h-8 text-gold mx-auto mb-3" />
          <p className="text-gold text-sm tracking-widest mb-2">✦ ENERGY MAP ✦</p>
          <h2 className="font-serif text-3xl md:text-4xl mb-3">The <span className="text-gold italic">Seven Chakras</span></h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Tap each spinning wheel of energy to discover its meaning, element, and the crystals that restore its flow.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          {/* Diagram */}
          <div className="relative flex justify-center">
            <svg viewBox="0 0 200 460" className="w-full max-w-[280px] h-auto">
              {/* Subtle aura */}
              <defs>
                <radialGradient id="aura" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={active.color} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={active.color} stopOpacity="0" />
                </radialGradient>
              </defs>
              <motion.circle
                key={active.id + "-aura"}
                cx="100" cy={active.cy} r="80"
                fill="url(#aura)"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
              />
              {/* Body silhouette */}
              <path
                d="M100 30 C112 30 120 40 120 52 C120 64 112 72 100 72 C88 72 80 64 80 52 C80 40 88 30 100 30 Z
                   M85 78 L115 78 L120 95 L130 130 L132 200 L128 270 L122 340 L118 400 L110 450 L100 450 L90 450 L82 400 L78 340 L72 270 L68 200 L70 130 L80 95 Z"
                fill="hsl(var(--secondary))"
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
                opacity="0.5"
              />
              {/* Spine line */}
              <line x1="100" y1="78" x2="100" y2="420" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="2 3" />
              {/* Chakras */}
              {chakras.map((c) => {
                const isActive = active.id === c.id;
                return (
                  <g key={c.id} className="cursor-pointer" onClick={() => setActive(c)}>
                    <motion.circle
                      cx="100" cy={c.cy}
                      r={isActive ? 16 : 11}
                      fill={c.color}
                      opacity={isActive ? 1 : 0.7}
                      animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                      transition={isActive ? { duration: 2, repeat: Infinity } : {}}
                      style={{ transformOrigin: `100px ${c.cy}px`, filter: isActive ? `drop-shadow(0 0 12px ${c.color})` : "none" }}
                    />
                    <circle cx="100" cy={c.cy} r={isActive ? 6 : 4} fill="hsl(var(--background))" opacity="0.9" />
                    <text x="100" y={c.cy + (isActive ? 2 : 1.5)} textAnchor="middle" fill={c.color} fontSize={isActive ? 7 : 5} fontWeight="bold">
                      {c.sanskrit}
                    </text>
                    {/* Label */}
                    <text x="148" y={c.cy + 2} fill={isActive ? c.color : "hsl(var(--muted-foreground))"} fontSize="6" fontFamily="serif" className="transition-colors">
                      {c.english}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Info panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-2xl p-6 md:p-8"
              style={{ borderColor: `${active.color}40` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-background font-bold text-lg" style={{ backgroundColor: active.color, boxShadow: `0 0 20px ${active.color}80` }}>
                  {active.sanskrit}
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase" style={{ color: active.color }}>{active.element}</p>
                  <h3 className="font-serif text-2xl">{active.name} <span className="text-muted-foreground text-base">— {active.english}</span></h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{active.desc}</p>

              <p className="italic text-sm border-l-2 pl-3 mb-5" style={{ borderColor: active.color, color: active.color }}>
                "{active.affirmation}"
              </p>

              <p className="text-[11px] text-gold tracking-widest mb-2">✦ HEALING CRYSTALS</p>
              <div className="flex flex-wrap gap-2">
                {active.crystals.map((c) => (
                  <Link
                    key={c}
                    href={`/shop?search=${encodeURIComponent(c)}`}
                    className="text-xs border border-border bg-secondary/40 hover:border-gold/50 hover:bg-secondary px-3 py-1.5 rounded-full transition-colors"
                  >
                    {c}
                  </Link>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default ChakraDiagram;