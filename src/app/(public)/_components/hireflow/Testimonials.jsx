"use client";

import React from "react";
import { Star, Quote, CheckCircle2 } from "lucide-react";

const testimonials = [
    {
        name: "Ananya Gupta",
        role: "VP of People",
        company: "TechCorp India",
        avatar: "AG",
        quote: "HireFlow cut our time-to-hire by 45%. The visual drag-and-drop pipeline alone saved our senior recruiters over 10 hours every single week. It's the most responsive ATS we've ever touched.",
        metrics: "45% faster time-to-hire",
        rating: 5,
    },
    {
        name: "Vikram Malhotra",
        role: "Head of Talent",
        company: "ScaleUp Innovations",
        avatar: "VM",
        quote: "We went from messy spreadsheets and missed emails to a fully automated hiring engine in one single afternoon. The AI candidate matching surfaced our lead architect within 24 hours.",
        metrics: "120+ roles filled in Q1",
        rating: 5,
    },
    {
        name: "Kavita Patel",
        role: "HR Director",
        company: "GlobalFin Solutions",
        avatar: "KP",
        quote: "The built-in EEOC and data privacy compliance trails gave our legal team absolute confidence. No audits to dread anymore. Plus, candidate satisfaction scores climbed to 98%.",
        metrics: "100% compliance audit pass",
        rating: 5,
    },
    {
        name: "James Wright",
        role: "Co-Founder & CEO",
        company: "StartupLab Accelerator",
        avatar: "JW",
        quote: "As a fast-paced founder, I needed an ATS that doesn't feel like 2005 enterprise bloatware. HireFlow is lightning fast, intuitively built, and our candidate experience feels ultra-premium.",
        metrics: "3.2x candidate NPS increase",
        rating: 5,
    },
];

export default function Testimonials() {
    return (
        <section id="hf-testimonials" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-indigo-500/10 relative">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mx-auto mb-16 max-w-2xl text-center">
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                        Testimonials
                    </span>
                    <h2 className="mt-4 mb-4 text-3xl lg:text-4xl font-bold text-slate-100 font-heading">
                        Loved by High-Growth <span className="text-gradient-hireflow">Hiring Teams</span>
                    </h2>
                    <p className="text-slate-400 text-base lg:text-lg">
                        Discover how recruiters, HR directors, and startup founders hire top talent with HireFlow.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
                    {testimonials.map((t) => (
                        <div
                            key={t.name}
                            className="glass-card rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 hover:border-indigo-400/40 hover:-translate-y-1 relative group"
                        >
                            <Quote className="absolute top-6 right-6 h-8 w-8 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors" />

                            <div>
                                <div className="flex items-center gap-1 mb-4">
                                    {Array.from({ length: t.rating }).map((_, j) => (
                                        <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                    ))}
                                    <span className="text-xs text-slate-400 font-semibold ml-2">5.0 / 5.0</span>
                                </div>

                                <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-6 italic">
                                    &ldquo;{t.quote}&rdquo;
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-indigo-500/20 text-indigo-300 font-bold font-heading text-sm flex items-center justify-center border border-indigo-500/30">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-100 font-heading">
                                            {t.name}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {t.role} • <span className="text-indigo-400">{t.company}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/40">
                                    <CheckCircle2 className="h-3 w-3" />
                                    <span>{t.metrics}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
