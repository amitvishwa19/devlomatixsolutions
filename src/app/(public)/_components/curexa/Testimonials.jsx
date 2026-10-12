'use client';

import React from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Dr. Rajesh Kulkarni",
    role: "Medical Director, CarePlus Hospital (120 Beds)",
    avatar: "RK",
    rating: 5,
    quote:
      "Curexa simplified our entire indoor admission and billing workflow. The automated daily cloud backup gave our board total peace of mind regarding data safety."
  },
  {
    name: "Dr. Sneha Patel",
    role: "Head of Pathology, Sterling Diagnostics",
    avatar: "SP",
    rating: 5,
    quote:
      "Having 500+ pre-formatted pathology templates saved our technicians hundreds of hours every month. Report delivery via SMS and WhatsApp delighted our patients."
  },
  {
    name: "Vikram Singhania",
    role: "Chief Operating Officer, MetroCare Network",
    avatar: "VS",
    rating: 5,
    quote:
      "We transitioned three multi-specialty hospital branches to Curexa in under a week. User-wise cash reconciliation eliminated 100% of our daily billing leakages."
  }
];

export function Testimonials() {
  return (
    <section className="py-20 lg:py-28 bg-secondary/10">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="container mx-auto px-4 md:px-8 pt-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
            Physician Endorsements
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Trusted by Doctors & Hospital Administrators{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 font-extrabold">
              Across the Country
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-7 max-w-6xl mx-auto">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="glass-card rounded-2xl p-7 border border-border/70 hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
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
                <p className="text-sm leading-relaxed text-muted-foreground italic mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
