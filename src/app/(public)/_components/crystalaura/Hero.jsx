"use client";

import React from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";

export default function Hero() {
    return (
        <section id="ca-hero" className="relative min-h-[90vh] flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 celestial-bg overflow-hidden border-b border-purple-500/10">
            {/* Ambient radiant blurs */}
            <div className="absolute top-1/4 left-1/10 w-96 h-96 rounded-full bg-purple-600/15 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/10 w-96 h-96 rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />

            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
                {/* Left Column: Copy & Actions */}
                <div className="lg:col-span-7 flex flex-col items-start text-left">
                    {/* Location & shipping badge */}
                    <div className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-amber-300 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/30 shadow-lg shadow-amber-500/10">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>BASED IN INDIA — SACRED SHIPPING WORLDWIDE</span>
                    </div>

                    {/* Headline */}
                    <h1 className="font-serif-heading text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.05] tracking-tight mb-6 text-slate-100">
                        Earth&apos;s{" "}
                        <span className="italic font-light text-gold-shimmer block sm:inline">
                            Finest Sacred
                        </span>{" "}
                        Essence.
                    </h1>

                    {/* Description */}
                    <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-xl mb-8 leading-relaxed font-normal">
                        Hand-selected architectural minerals, Vedic-energized healing crystals, and sacred treasures curated to align your chakras, balance your home environment, and elevate your spiritual vibration.
                    </p>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full sm:w-auto mb-10">
                        <a
                            href="#ca-bestsellers"
                            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl btn-gold-gradient font-serif-heading font-bold text-sm sm:text-base text-slate-950 shadow-xl shadow-amber-500/20 hover:scale-105 transition-all"
                        >
                            <span>Explore Sacred Collection</span>
                            <ArrowUpRight className="h-4 w-4" />
                        </a>

                        <a
                            href="#ca-quiz"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl ca-glass-card hover:border-purple-400/50 text-purple-200 hover:text-white font-serif-heading font-bold text-sm sm:text-base transition-all"
                        >
                            <Sparkles className="h-4 w-4 text-amber-400" />
                            <span>Take Energy Match Quiz</span>
                        </a>
                    </div>

                    {/* Core Trust Indicators */}
                    <div className="grid grid-cols-3 gap-6 w-full border-t border-purple-500/20 pt-6">
                        <div>
                            <p className="text-xl sm:text-2xl font-bold font-serif-heading text-amber-300">10k+</p>
                            <p className="text-xs text-slate-400 mt-0.5">Spirits Aligned</p>
                        </div>
                        <div>
                            <p className="text-xl sm:text-2xl font-bold font-serif-heading text-purple-300">100%</p>
                            <p className="text-xs text-slate-400 mt-0.5">Natural Certified</p>
                        </div>
                        <div>
                            <p className="text-xl sm:text-2xl font-bold font-serif-heading text-emerald-400">Vedic</p>
                            <p className="text-xs text-slate-400 mt-0.5">Ganges Cleansed</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Visual Showcase */}
                <div className="lg:col-span-5 relative group w-full">
                    {/* Card container */}
                    <div className="aspect-[4/5] overflow-hidden rounded-3xl ca-glass-card p-3 shadow-2xl relative border-purple-500/30 group-hover:border-amber-400/40 transition-colors duration-700">
                        <div className="w-full h-full overflow-hidden rounded-2xl relative">
                            <img
                                src="https://images.unsplash.com/photo-1545389336-cf090694435e?w=1000&h=1250&fit=crop"
                                alt="Natural Raw Amethyst Geode Cluster"
                                className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105 filter brightness-95"
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#090614]/80 via-transparent to-transparent" />

                            {/* Floating details badge */}
                            <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl ca-glass-card border-purple-400/30 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                                        Sacred Specimen #01
                                    </span>
                                    <span className="text-sm font-bold text-slate-100 font-serif-heading">
                                        Natural Raw Amethyst Geode
                                    </span>
                                </div>
                                <span className="text-xs font-semibold text-purple-300 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-800/40">
                                    Crown Chakra
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Floating Authentic Stamp */}
                    <div className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-2 p-3.5 rounded-2xl ca-glass-card border-amber-400/40 shadow-xl shadow-purple-950/60">
                        <div className="h-10 w-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-lg">
                            ✧
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-100 font-serif-heading">100% Natural Earth Stones</div>
                            <div className="text-[11px] text-purple-300">Vedic Mantra Cleansed &amp; Blessed</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
