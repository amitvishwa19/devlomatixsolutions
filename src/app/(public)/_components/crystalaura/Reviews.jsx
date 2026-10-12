"use client";

import React from "react";
import { Star, Quote } from "lucide-react";

const reviews = [
    {
        name: "Sunita Nair",
        location: "Bengaluru, Karnataka",
        stone: "Raw Brazilian Amethyst Geode",
        avatar: "SN",
        rating: 5,
        quote: "The vibration off this amethyst cluster was palpable the moment I unwrapped the sacred packaging. My evening meditation space feels like an ancient Himalayan temple.",
        verified: "Verified Buyer",
    },
    {
        name: "Rahul Deshmukh",
        location: "Mumbai, Maharashtra",
        stone: "Golden Pyrite Wealth Cluster",
        avatar: "RD",
        rating: 5,
        quote: "Placed this stunning brassy Pyrite in our office North wealth corner following the Vastu guide. We closed two enterprise deals within three weeks. Remarkable natural quality.",
        verified: "Verified Buyer",
    },
    {
        name: "Priya Krishnamurthy",
        location: "Chennai, Tamil Nadu",
        stone: "7 Chakra Kundalini Bracelet",
        avatar: "PK",
        rating: 5,
        quote: "The mineral beads are genuine earth stones — heavy, naturally cool to the touch, and vibrant. You can immediately distinguish them from the synthetic dyed glass sold elsewhere.",
        verified: "Verified Buyer",
    },
    {
        name: "Meera Sengupta",
        location: "Kolkata, West Bengal",
        stone: "Madagascar Rose Quartz Sphere",
        avatar: "MS",
        rating: 5,
        quote: "The sacred unboxing was so touching. It came wrapped in natural jute, consecrated with Ganga water, and accompanied by a detailed chakra energizing guide.",
        verified: "Verified Buyer",
    },
];

export default function Reviews() {
    return (
        <section id="ca-reviews" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#120a24] to-[#090614] border-b border-purple-500/10 relative">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                        ✦ Sacred Experiences ✦
                    </span>
                    <h2 className="mt-3 font-serif-heading text-3xl sm:text-4xl lg:text-5xl text-slate-100">
                        Loved by Seekers <span className="text-gold-shimmer italic">Across the Globe</span>
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto mt-2">
                        Hear from mindful practitioners, interior healers, and crystal collectors who transformed their spaces with CrystalAura.
                    </p>

                    {/* Aggregate Rating Pill */}
                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full ca-glass-card border-amber-400/40 text-xs font-semibold text-slate-200">
                        <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            ))}
                        </div>
                        <span>4.9 / 5.0 Star Average • 1,200+ Verified Sacred Reviews</span>
                    </div>
                </div>

                {/* Reviews Grid */}
                <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
                    {reviews.map((r) => (
                        <div
                            key={r.name}
                            className="ca-glass-card rounded-2xl p-7 flex flex-col justify-between border-purple-500/20 hover:border-amber-400/40 transition-all duration-300 relative group"
                        >
                            <Quote className="absolute top-6 right-6 h-8 w-8 text-purple-500/15 group-hover:text-amber-500/20 transition-colors" />

                            <div>
                                <div className="flex items-center gap-1 mb-3">
                                    {Array.from({ length: r.rating }).map((_, i) => (
                                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                    ))}
                                    <span className="text-[11px] font-bold text-amber-300 ml-2">
                                        Verified Purchase
                                    </span>
                                </div>

                                <p className="text-slate-200 text-xs sm:text-sm leading-relaxed mb-6 italic">
                                    &ldquo;{r.quote}&rdquo;
                                </p>
                            </div>

                            <div className="pt-4 border-t border-purple-500/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400/20 to-purple-600/30 text-amber-300 font-bold font-serif-heading text-sm flex items-center justify-center border border-amber-400/30">
                                        {r.avatar}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold font-serif-heading text-slate-100">
                                            {r.name}
                                        </div>
                                        <div className="text-[11px] text-slate-400">
                                            {r.location}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40 block">
                                        {r.stone}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
