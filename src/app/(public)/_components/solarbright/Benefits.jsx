'use client';

import React from "react";
import { Zap, ShieldCheck, Leaf, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  { icon: Zap, title: "Up to 30% More Units", description: "Clean panels capture maximum solar irradiance, reversing generation losses caused by urban pollution and dust.", metric: "30%", metricLabel: "generation boost" },
  { icon: IndianRupee, title: "Save ₹1000s on Bills", description: "Higher kilowatt-hour output directly reduces your grid electricity bill and speeds up solar ROI payback.", metric: "₹2,500+", metricLabel: "monthly savings" },
  { icon: ShieldCheck, title: "25-Year Panel Health", description: "Clearing baked-on bird droppings and scale prevents hotspot formation that can permanently destroy solar cells.", metric: "25 Years", metricLabel: "lifespan security" },
  { icon: Leaf, title: "100% Eco-Friendly", description: "Demineralized pure water with zero corrosive chemicals ensures no runoff damage to your roof or environment.", metric: "0%", metricLabel: "chemical runoff" },
];

export function Benefits() {
  return (
    <section id="sb-benefits" className="py-20 lg:py-28 relative overflow-hidden bg-secondary/10">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="container mx-auto px-4 md:px-8 pt-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-amber-500 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            <span className="w-6 h-px bg-amber-500" />
            Quantifiable Advantages
            <span className="w-6 h-px bg-amber-500" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
            The SolarBright Advantage
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            Measurable returns in electricity generated, equipment lifespan, and financial savings.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative rounded-2xl border border-border/70 bg-card p-7 hover:border-amber-500/40 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-105 transition-transform">
                <b.icon className="h-6 w-6" />
              </div>

              <div className="mb-4">
                <span className="font-heading text-3xl font-extrabold text-amber-500">{b.metric}</span>
                <span className="block text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">
                  {b.metricLabel}
                </span>
              </div>

              <h3 className="font-heading text-base font-bold text-foreground mb-2">{b.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{b.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Benefits;
