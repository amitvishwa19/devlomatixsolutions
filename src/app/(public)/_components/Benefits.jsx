'use client';

import { Zap, ShieldCheck, Leaf, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  { icon: Zap, title: "Up to 30% More Units", description: "Clean panels generate significantly more kWh — critical in India's dusty climate.", metric: "30%", metricLabel: "boost" },
  { icon: IndianRupee, title: "Save ₹1000s on Bills", description: "Higher efficiency means lower DISCOM bills and faster payback on your investment.", metric: "₹2K+", metricLabel: "savings/mo" },
  { icon: ShieldCheck, title: "Extend Panel Life", description: "Regular cleaning prevents hotspots, micro-cracks & permanent soiling damage.", metric: "25yr", metricLabel: "lifespan" },
  { icon: Leaf, title: "100% Eco-Friendly", description: "DM (demineralized) water — zero chemicals, safe for panels and environment.", metric: "0%", metricLabel: "chemicals" },
];

const Benefits = () => {
  return (
    <section id="benefits" className="py-28 relative overflow-hidden bg-background">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-[0.2em] mb-4">
            <span className="w-8 h-px bg-primary" />
            Why Choose Us
            <span className="w-8 h-px bg-primary" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            The SolarBright Advantage
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative rounded-2xl border border-border bg-card p-7 hover:border-primary/30 hover:shadow-glow transition-all duration-500 overflow-hidden"
            >
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-all duration-500">
                  <b.icon className="h-5 w-5 text-primary" />
                </div>

                <div className="mb-4">
                  <span className="font-heading text-3xl font-bold text-primary">{b.metric}</span>
                  <span className="text-[10px] text-muted-foreground ml-2 uppercase tracking-[0.1em] font-bold">{b.metricLabel}</span>
                </div>

                <h3 className="font-heading text-base font-bold text-foreground mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-light">{b.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
