"use client";

import React from "react";
import { Compass, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";

const vastuDirections = [
    {
        direction: "North (Uttara)",
        ruler: "Lord Kubera (Deity of Wealth)",
        element: "Water Element",
        crystals: "Golden Pyrite, Green Aventurine, Citrine",
        benefit: "Attracts continuous career breakthroughs, high-net-worth opportunities, and financial prosperity into your household.",
        color: "#38bdf8",
    },
    {
        direction: "North-East (Ishanya)",
        ruler: "Lord Shiva (Divine Consciousness)",
        element: "Sacred Ether / Space",
        crystals: "Clear Quartz Point, Natural Amethyst Cluster, Selenite",
        benefit: "Purifies sacred meditation corners, dissolves severe mental confusion, and aligns children with academic concentration.",
        color: "#a855f7",
    },
    {
        direction: "South-East (Agneya)",
        ruler: "Lord Agni (Sacred Fire)",
        element: "Cosmic Fire",
        crystals: "Red Jasper, Orange Carnelian, Sunstone",
        benefit: "Activates stagnant liquidity, increases household drive and stamina, and guards against sudden unexpected expenditures.",
        color: "#f59e0b",
    },
    {
        direction: "South-West (Nairutya)",
        ruler: "Lord Nirrithi (Stability & Ancestors)",
        element: "Heavy Earth",
        crystals: "Raw Black Tourmaline, Smoky Quartz, Tiger&apos;s Eye",
        benefit: "Fortifies marriage bonding, stabilizes career leadership for the family head, and grounds foreign negative psychic projections.",
        color: "#ef4444",
    },
];

export default function VastuGuide() {
    return (
        <section id="ca-vastu" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#090614] border-b border-purple-500/10 relative">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                        ✦ Vedic Spatial Harmony ✦
                    </span>
                    <h2 className="mt-3 font-serif-heading text-3xl sm:text-4xl lg:text-5xl text-slate-100">
                        Sacred Vastu &amp; <span className="text-gold-shimmer italic">Directional Minerals</span>
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto mt-2">
                        Ancient Vedic texts teach that mineral placement in specific directional sectors clears environmental geopathic stress and invites divine cosmic flow.
                    </p>
                </div>

                {/* 4 Quadrants Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12">
                    {vastuDirections.map((v) => (
                        <div
                            key={v.direction}
                            className="ca-glass-card rounded-2xl p-6 sm:p-8 border-purple-500/20 hover:border-amber-400/40 transition-all flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-lg"
                                            style={{ backgroundColor: `${v.color}20`, color: v.color }}
                                        >
                                            <Compass className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-serif-heading text-lg font-bold text-slate-100">
                                                {v.direction}
                                            </h3>
                                            <span className="text-[11px] text-purple-300">
                                                {v.ruler} • {v.element}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/20 mb-4">
                                    <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                                        Mandated Healing Crystals:
                                    </span>
                                    <p
                                        className="text-xs font-bold text-slate-200"
                                        dangerouslySetInnerHTML={{ __html: v.crystals }}
                                    />
                                </div>

                                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                                    {v.benefit}
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-purple-500/10 flex items-center justify-between">
                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Vastu Certified
                                </span>
                                <a
                                    href="#ca-bestsellers"
                                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                                >
                                    <span>Find Minerals</span>
                                    <ArrowRight className="h-3 w-3" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Callout box for Vastu Placement Advice */}
                <div className="ca-glass-card rounded-2xl p-6 sm:p-8 border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-purple-950/40 via-[#0d091a] to-amber-950/20">
                    <div className="space-y-1 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2 text-sm font-bold text-slate-100 font-serif-heading">
                            <Sparkles className="h-4 w-4 text-amber-400" />
                            <span>Need Personalized Home or Office Vastu Consultation?</span>
                        </div>
                        <p className="text-xs text-slate-300 max-w-xl">
                            Our in-house Vedic gemologists analyze your floor plan and recommend exact crystal grid coordinates for peak prosperity.
                        </p>
                    </div>

                    <a
                        href="#ca-faq"
                        className="px-6 py-3 rounded-xl btn-gold-gradient font-serif-heading font-bold text-xs text-slate-950 shrink-0 shadow-lg whitespace-nowrap"
                    >
                        Learn About Vastu Cleansing
                    </a>
                </div>
            </div>
        </section>
    );
}
