'use client';

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    location: "Mumbai",
    text: "The amethyst bracelet has brought such calm to my life. You can truly feel the energy in these crystals.",
    rating: 5,
  },
  {
    name: "Rahul Verma",
    location: "Delhi",
    text: "Ordered a quartz pyramid for my home office. The quality is outstanding and delivery was swift.",
    rating: 5,
  },
  {
    name: "Ananya Patel",
    location: "Ahmedabad",
    text: "Their Vastu consultation helped me place my crystals perfectly. My home feels so much more peaceful now.",
    rating: 5,
  },
];

const TestimonialSection = () => {
  return (
    <section className="py-28 px-6 relative overflow-hidden bg-background">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary text-xs font-medium mb-4">
            Testimonials
          </p>
          <h2 className="font-serif text-4xl md:text-6xl text-foreground">
            Blessed <span className="text-gold-gradient font-semibold">Experiences</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="group"
            >
              <div className="glass-card rounded-2xl p-8 h-full relative transition-all duration-500 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                <Quote className="w-8 h-8 text-primary/15 absolute top-6 right-6" />
                
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                
                <p className="text-secondary-foreground font-light italic text-sm leading-relaxed mb-6">
                  "{t.text}"
                </p>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <span className="text-primary font-serif text-lg">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-foreground font-sans text-xs font-medium">{t.name}</p>
                    <p className="text-muted-foreground text-xs font-light">{t.location}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
