"use client";

import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";

const collections = [
    {
        title: "Crystal Bracelets",
        subtitle: "Sacred Wristwear",
        desc: "Elasticized beads designed to align personal energetic frequencies and pulse healing vibrations throughout your day.",
        img: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=700&fit=crop",
        startingPrice: "₹499",
        tag: "Most Popular",
        targetId: "#ca-calculator",
    },
    {
        title: "Healing Spheres",
        subtitle: "Harmonious Geometry",
        desc: "Precision polished crystal spheres radiating soothing, restorative energy equally in all 360 directions of your sacred space.",
        img: "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=600&h=700&fit=crop",
        startingPrice: "₹1,299",
        tag: "Meditation Altar",
        targetId: "#ca-bestsellers",
    },
    {
        title: "Orgone Pyramids",
        subtitle: "Energetic Amplifiers",
        desc: "Metaphysical sacred matrices infused with copper coils and quartz points to neutralize modern EMF smog and geopathic stress.",
        img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=700&fit=crop",
        startingPrice: "₹899",
        tag: "Home Vastu",
        targetId: "#ca-vastu",
    },
];

export default function VibrantBanner() {
    return (
        <section id="ca-collections" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#090614] border-b border-purple-500/10 relative">
            <div className="max-w-7xl mx-auto">
                {/* 1. Vibrant Crimson & Violet Banner */}
                <div className="mb-24">
                    <div
                        className="relative rounded-3xl overflow-hidden py-12 px-6 sm:px-12 md:px-16 flex flex-col md:flex-row items-center justify-between gap-8 border border-purple-500/30"
                        style={{
                            background: "linear-gradient(135deg, #1d0c2e 0%, #3a0d24 50%, #120924 100%)",
                            boxShadow: "0 20px 50px -10px rgba(74, 14, 49, 0.4)",
                        }}
                    >
                        <div className="relative z-10 space-y-3 max-w-xl text-center md:text-left">
                            <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-amber-300 text-xs font-semibold">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <span>Special Vedic Ganga Blessing</span>
                            </div>

                            <h2 className="font-serif-heading text-2xl sm:text-3xl lg:text-4xl text-slate-100 font-normal leading-tight">
                                Every crystal is purified with sacred Ganges water &amp; ancient chanting.
                            </h2>

                            <p className="text-slate-300 text-xs sm:text-sm font-normal leading-relaxed max-w-md">
                                We ensure your sacred minerals arrive fully cleansed, energetic, and spiritually primed to merge with your personal biofield.
                            </p>
                        </div>

                        <a
                            href="#ca-faq"
                            className="relative z-10 shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-full btn-gold-gradient font-serif-heading font-bold text-xs sm:text-sm text-slate-950 shadow-xl shadow-amber-500/25 hover:scale-105 transition-all"
                        >
                            <span>Read Purification Ritual</span>
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                {/* 2. Collections Showcase */}
                <div>
                    <div className="text-center mb-14">
                        <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                            ✦ Sacred Mineral Forms ✦
                        </span>
                        <h3 className="mt-3 font-serif-heading text-3xl sm:text-4xl lg:text-5xl text-slate-100">
                            Explore <span className="text-gold-shimmer italic font-light">Our Curated</span> Collections
                        </h3>
                        <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto mt-2">
                            Select by physical form, sacred function, or energy alignment to suit your home and body.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {collections.map((col) => (
                            <div
                                key={col.title}
                                className="ca-glass-card rounded-2xl overflow-hidden group flex flex-col justify-between border-purple-500/20"
                            >
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={col.img}
                                        alt={col.title}
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#090614] via-transparent to-transparent opacity-80" />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#090614]/80 backdrop-blur-md text-amber-300 border border-amber-500/30">
                                            {col.tag}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 flex items-baseline justify-between">
                                        <span className="text-xs text-purple-200">Starting from</span>
                                        <span className="text-lg font-bold font-serif-heading text-amber-300">
                                            {col.startingPrice}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider block mb-1">
                                            {col.subtitle}
                                        </span>
                                        <h4 className="text-xl font-bold font-serif-heading text-slate-100 mb-2 group-hover:text-amber-300 transition-colors">
                                            {col.title}
                                        </h4>
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            {col.desc}
                                        </p>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-purple-500/10 flex items-center justify-between">
                                        <a
                                            href={col.targetId}
                                            className="text-xs font-bold text-amber-400 group-hover:text-amber-300 flex items-center gap-1.5"
                                        >
                                            <span>Explore Sacred Items</span>
                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
