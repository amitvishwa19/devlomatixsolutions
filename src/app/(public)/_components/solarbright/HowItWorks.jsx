'use client';

import React from "react";
import { CalendarCheck, ClipboardCheck, Sparkles, ThumbsUp } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { icon: CalendarCheck, step: "01", title: "Book via Call or WhatsApp", description: "Request an appointment online or on WhatsApp. We confirm a visit within your preferred time window." },
  { icon: ClipboardCheck, step: "02", title: "Free Site Inspection", description: "Our certified technician visits, tests panel output, assesses dust layers & checks for hotspot risks." },
  { icon: Sparkles, step: "03", title: "Professional Cleaning", description: "Purified demineralized water & anti-static soft brushes safely clean without scratching delicate glass." },
  { icon: ThumbsUp, step: "04", title: "More Units, More Savings", description: "Experience an immediate 20% to 35% boost in electricity generation and lower DISCOM utility bills." },
];

export function HowItWorks() {
  return (
    <section id="sb-how-it-works" className="py-20 lg:py-28 relative overflow-hidden bg-secondary/15">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="container mx-auto px-4 md:px-8 pt-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-amber-500 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            <span className="w-6 h-px bg-amber-500" />
            Seamless Process
            <span className="w-6 h-px bg-amber-500" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            4 Simple Steps to Peak Efficiency
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            From booking to sparkling clean panels — completed in just a few hassle-free hours.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative rounded-2xl border border-border/70 bg-card p-6 h-full flex flex-col justify-between hover:border-amber-500/40 hover:shadow-lg transition-all"
            >
              <div>
                <span className="font-heading text-4xl font-extrabold text-muted/50 absolute top-4 right-4 pointer-events-none select-none">
                  {item.step}
                </span>

                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-5">
                  <item.icon className="h-6 w-6" />
                </div>

                <h3 className="font-heading text-base font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
