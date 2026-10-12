'use client';

import React from "react";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "5kW Rooftop Homeowner, Jaipur",
    content: "Our system generation had dropped noticeably during nearby road construction dust. Within 24 hours of SolarBright's demineralized clean, our daily units climbed from 14 kWh back to 22 kWh. The difference was immediate.",
    rating: 5,
  },
  {
    name: "Anita Sharma",
    role: "Villa Owner, Gurgaon",
    content: "Highly punctual and safe crew. They arrived equipped with purified water systems and specialized soft rollers. Zero glass scratches, and they WhatsApped a full PDF before-and-after photo report with our inverter metrics.",
    rating: 5,
  },
  {
    name: "Vikramaditya Singh",
    role: "Factory Operations Head, Ahmedabad",
    content: "Maintaining a 120kW commercial industrial rooftop was a chronic challenge. SolarBright's AMC has put the entire maintenance pipeline on auto-pilot. Our energy savings comfortably outweigh the service contract cost.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden bg-secondary/15">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="container mx-auto px-4 md:px-8 pt-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-amber-500 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            <span className="w-6 h-px bg-amber-500" />
            Verified Customer Reviews
            <span className="w-6 h-px bg-amber-500" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Trusted by Indian Homeowners & Plants
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            Real generation turnarounds from residential rooftops to industrial complexes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-7 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative bg-card border border-border/70 p-7 rounded-2xl flex flex-col justify-between hover:border-amber-500/30 hover:shadow-lg transition-all"
            >
              <Quote className="absolute top-5 right-5 w-8 h-8 text-amber-500/10 pointer-events-none" />

              <div>
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic mb-6">
                  &ldquo;{t.content}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-border/40">
                <p className="font-heading font-bold text-sm text-foreground">{t.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
