'use client';

import React from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag, GraduationCap, Heart, Building2,
  Plane, UtensilsCrossed,
} from "lucide-react";

const industries = [
  {
    icon: ShoppingBag,
    title: "E-Commerce & Retail",
    desc: "Recover abandoned carts, send automated order dispatches, and drive repeat purchases with personalized catalogs.",
  },
  {
    icon: GraduationCap,
    title: "Education & EdTech",
    desc: "Automate student admissions, share curriculum updates, and engage learners with responsive interactive bots.",
  },
  {
    icon: Heart,
    title: "Healthcare & Clinics",
    desc: "Automate appointment reminders, deliver lab reports securely, and offer 24/7 patient triage on WhatsApp.",
  },
  {
    icon: Building2,
    title: "Real Estate & Housing",
    desc: "Share high-res property brochures, schedule site visits, and nurture prospective buyers through automated drip campaigns.",
  },
  {
    icon: Plane,
    title: "Travel & Hospitality",
    desc: "Deliver instant booking vouchers, check-in updates, and gather guest feedback conveniently on their favorite messaging app.",
  },
  {
    icon: UtensilsCrossed,
    title: "Food & Restaurants",
    desc: "Facilitate direct table reservations, broadcast weekly specials, and send live order tracking links without app downloads.",
  },
];

export function Industries() {
  return (
    <section id="kx-industries" className="relative py-20 sm:py-28 mesh-bg">
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
            Tailored Solutions
          </p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl text-foreground">
            Built for <span className="text-gradient-sun">Every Industry</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Whether running retail storefronts, healthcare clinics, or high-volume service platforms, KonnectX fits your workflow.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((ind, i) => (
            <motion.div
              key={ind.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group flex gap-4 glass-card rounded-2xl p-6 transition-all duration-300 hover:border-primary/40 hover:-translate-y-1"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                <ind.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {ind.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {ind.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
