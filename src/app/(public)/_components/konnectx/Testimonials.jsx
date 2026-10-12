'use client';

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Head of Growth, ShopEase",
    avatar: "PS",
    rating: 5,
    quote:
      "KonnectX transformed our direct customer engagement. We saw a 3.4x spike in conversions within 30 days of launching personalized WhatsApp broadcast campaigns.",
  },
  {
    name: "Rahul Mehta",
    role: "Founder, EduPrime Academy",
    avatar: "RM",
    rating: 5,
    quote:
      "The visual chatbot builder is exceptionally straightforward. We automated 85% of our student course inquiries without hiring additional support personnel.",
  },
  {
    name: "Ananya Iyer",
    role: "Operations Director, FreshBite Food",
    avatar: "AI",
    rating: 5,
    quote:
      "Instant order confirmations, dispatched driver tracking, and automated feedback surveys — all handled automatically on WhatsApp with zero headaches.",
  },
  {
    name: "David Chen",
    role: "Product Lead, TravelNest",
    avatar: "DC",
    rating: 5,
    quote:
      "Integrating KonnectX with our CRM took less than an afternoon. The API documentation is rock-solid and throughput rates are flawless.",
  },
  {
    name: "Sara Al-Rashid",
    role: "Chief Medical Officer, HealthFirst Clinics",
    avatar: "SA",
    rating: 5,
    quote:
      "Patient appointment no-shows dropped by 45% immediately once two-way interactive WhatsApp confirmations were set live.",
  },
  {
    name: "Michael Torres",
    role: "Managing Broker, PropHub Realty",
    avatar: "MT",
    rating: 5,
    quote:
      "Our agents close deals twice as fast now. Automated brochure deliveries and instant qualifying queries give us hot buyer leads immediately.",
  },
];

export function Testimonials() {
  return (
    <section id="kx-testimonials" className="relative py-20 sm:py-28">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary">
            Customer Success Stories
          </p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl text-foreground">
            Loved by <span className="text-gradient-sun">Businesses Worldwide</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Discover how forward-thinking brands leverage KonnectX to elevate customer satisfaction and revenue.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 25, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="glass-card rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:border-primary/40 hover:-translate-y-1"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              {/* Star Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${
                      s < t.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm leading-relaxed text-muted-foreground italic">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-border/30">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold text-white shadow-md"
                  style={{ background: "var(--gradient-sun)" }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
