'use client';

import React from "react";
import { Lightbulb, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const tips = [
  {
    category: "Optimal Timing",
    title: "Clean Early Morning or Sunset",
    description: "Cleaning panels under intense midday sunshine creates thermal shock between cold wash water and hot tempered glass, triggering micro-fractures in silicon cells.",
    icon: Lightbulb,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    category: "Structural Safety",
    title: "Never Step on Module Frames",
    description: "Walking or placing body weight across panels stresses internal soldering ribbons and solar wafers, causing permanent cell dead-zones even if glass remains unbroken.",
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  {
    category: "Dust Evacuation",
    title: "Clear Lower Edge Frame Sediment",
    description: "At typical 10–25° Indian tilt angles, dirt pools along the bottom frame ridge. This edge shading knocks out full string bypass diodes and slashes inverter output.",
    icon: CheckCircle2,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
];

export function Tips() {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden bg-secondary/10">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="container mx-auto px-4 md:px-8 pt-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-amber-500 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            <span className="w-6 h-px bg-amber-500" />
            Solar IQ Best Practices
            <span className="w-6 h-px bg-amber-500" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Maintenance Tips & Guidance
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            Essential operational knowledge to protect your solar assets and sustain maximum generation.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-7 max-w-5xl mx-auto">
          {tips.map((tip, i) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-border/70 bg-card p-7 hover:border-amber-500/30 hover:shadow-lg transition-all"
            >
              <div className={`w-12 h-12 rounded-xl ${tip.bg} flex items-center justify-center mb-6`}>
                <tip.icon className={`w-6 h-6 ${tip.color}`} />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-2 block">
                {tip.category}
              </span>
              <h3 className="font-heading text-lg font-bold text-foreground mb-3">{tip.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {tip.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Tips;
