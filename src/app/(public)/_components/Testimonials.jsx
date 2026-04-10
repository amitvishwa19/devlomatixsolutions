'use client';

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Home Owner, Jaipur",
    content: "My 5kW setup's output had dropped significantly due to construction dust nearby. After SolarBright's cleaning, the units generated increased by almost 40% the very next day!",
    rating: 5,
  },
  {
    name: "Anita Sharma",
    role: "Villa Owner, Gurgaon",
    content: "Very professional service. They used specialized brushes and purified water. No scratches on the panels and they even shared before/after photos as proof.",
    rating: 5,
  },
  {
    name: "Vikram Singh",
    role: "Factory Manager, Ahmedabad",
    content: "Handling a 100kW plant was tough. Their AMC plan has simplified everything. Monthly reports and scheduled cleaning have boosted our factory's solar savings.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-28 relative overflow-hidden bg-muted/10">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[150px] pointer-events-none" />

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
            Testimonials
            <span className="w-8 h-px bg-primary" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Trusted by Homeowners & Businesses
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group relative bg-card border border-border p-8 rounded-2xl hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-glow shadow-primary/5"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/5 group-hover:text-primary/10 transition-colors" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>

              <p className="text-foreground/90 leading-relaxed mb-8 italic font-light">
                "{t.content}"
              </p>

              <div>
                <p className="font-heading font-bold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
