"use client";

import React, { useState } from "react";
import { Sparkles, ShoppingBag, CheckCircle2 } from "lucide-react";

export default function CrystalOfTheDay({ onAddToCart }) {
    const [dateStr] = useState(() => {
        if (typeof window === "undefined") return "✦ Today's Sacred Energy";
        return "✦ " + new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        });
    });
    const [added, setAdded] = useState(false);

    const handleAdd = () => {
        setAdded(true);
        if (onAddToCart) {
            onAddToCart({
                id: "ca-cotd-01",
                name: "Raw Brazilian Amethyst Geode Cluster",
                price: 699,
                image: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&h=800&fit=crop",
            });
        }
        setTimeout(() => setAdded(false), 2500);
    };

    return (
        <section id="ca-crystal-of-day" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#090614] to-[#110a22] border-b border-purple-500/10 relative">
            <div className="max-w-6xl mx-auto relative z-10">
                <div className="ca-glass-card rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 shadow-2xl border-purple-500/30">
                    {/* Left Column: Image with Floating Badge */}
                    <div className="relative min-h-[380px] md:min-h-[460px] overflow-hidden group">
                        <img
                            src="https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&h=800&fit=crop"
                            alt="Raw Brazilian Amethyst Geode"
                            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#090614]/80 via-transparent to-transparent md:hidden" />

                        {/* Floating Badge */}
                        <div className="absolute top-6 left-6 inline-flex items-center gap-2 bg-[#090614]/85 backdrop-blur-md border border-amber-500/40 px-4 py-2 rounded-full shadow-xl">
                            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                            <span className="text-xs text-amber-300 font-bold uppercase tracking-wider font-serif-heading">
                                Crystal of the Day
                            </span>
                        </div>
                    </div>

                    {/* Right Column: Content & Attributes */}
                    <div className="p-8 sm:p-12 flex flex-col justify-between bg-[#130b26]/50 backdrop-blur-md">
                        <div>
                            <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest block mb-2 font-serif-heading">
                                {dateStr || "✦ Today's Sacred Energy"}
                            </span>

                            <h2 className="font-serif-heading text-3xl sm:text-4xl text-slate-100 font-normal mb-2">
                                Today&apos;s <span className="text-gold-shimmer italic">Sacred</span> Pick
                            </h2>

                            <h3 className="font-serif-heading text-xl sm:text-2xl text-purple-200 font-semibold mb-4">
                                Raw Brazilian Amethyst Geode Cluster
                            </h3>

                            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                                Hand-excavated natural amethyst cluster featuring deep violet druzy points. Known as the master stone of psychic protection, crown chakra attunement, and mental tranquility.
                            </p>

                            {/* Metaphysical Attributes Matrix */}
                            <div className="grid grid-cols-2 gap-3 mb-8 text-xs">
                                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Primary Chakra</span>
                                    <span className="font-semibold text-purple-200">Sahasrara (Crown)</span>
                                </div>
                                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Element &amp; Planet</span>
                                    <span className="font-semibold text-purple-200">Wind • Jupiter</span>
                                </div>
                                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Zodiac Affinity</span>
                                    <span className="font-semibold text-purple-200">Pisces, Aquarius</span>
                                </div>
                                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Origin Location</span>
                                    <span className="font-semibold text-purple-200">Rio Grande, Brazil</span>
                                </div>
                            </div>
                        </div>

                        {/* Price & Action */}
                        <div className="pt-6 border-t border-purple-500/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                            <div>
                                <span className="text-[11px] font-medium text-slate-400 block">Sacred Day Special Price</span>
                                <div className="flex items-baseline gap-2.5">
                                    <span className="text-3xl font-serif-heading font-bold text-slate-50">₹699</span>
                                    <span className="text-sm line-through text-slate-500">₹999</span>
                                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                                        Save 30%
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleAdd}
                                className={`px-6 py-3.5 rounded-xl font-serif-heading font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                                    added
                                        ? "bg-emerald-600 text-white shadow-emerald-600/30"
                                        : "btn-gold-gradient text-slate-950 shadow-amber-500/30 hover:scale-105"
                                }`}
                            >
                                {added ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Added to Sacred Cart!</span>
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag className="h-4 w-4" />
                                        <span>Claim Today&apos;s Specimen</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
