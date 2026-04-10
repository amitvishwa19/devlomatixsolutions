'use client';

import { motion } from "framer-motion";
import { Lightbulb, CheckCircle2, AlertTriangle } from "lucide-react";

const tips = [
  {
    category: "Optimal Timing",
    title: "Clean Early or Late",
    description: "The best time to clean panels is early morning or late evening. Cleaning them when they're hot (mid-day sun) can cause thermal stress and micro-cracks in the glass.",
    icon: Lightbulb,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    category: "Safety First",
    title: "Don't Walk on Panels",
    description: "Never walk or stand on your solar panels. Even if the glass doesn't break, the pressure causes micro-cracks in the silicon cells, permanently reducing energy output.",
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  {
    category: "Efficiency",
    title: "The Angle Matters",
    description: "In India, most panels are tilted at 10-25 degrees. Dust tends to settle at the bottom edge. Ensure the lower frame is properly cleared to prevent 'shading' of entire strings.",
    icon: CheckCircle2,
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

const Tips = () => {
  return (
    <section id="tips" className="py-28 relative overflow-hidden bg-background/50">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-[0.2em] mb-4">
            <span className="w-8 h-px bg-primary" />
            Solar IQ
            <span className="w-8 h-px bg-primary" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Maintenance Tips & Tricks
          </h2>
          <p className="text-muted-foreground mt-4 text-lg font-light leading-relaxed">
            Quick insights to help you get the most out of your solar investment.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tips.map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group bg-card border border-border p-8 rounded-2xl hover:border-primary/30 hover:shadow-glow shadow-primary/5 transition-all duration-500"
            >
              <div className={`w-12 h-12 rounded-xl ${tip.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <tip.icon className={`w-6 h-6 ${tip.color}`} />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2 block">
                {tip.category}
              </span>
              <h3 className="font-heading text-xl font-bold text-foreground mb-4">{tip.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-light font-body">
                {tip.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Tips;
