"use client";

import React from "react";
import { Sparkles, Heart } from "lucide-react";

export default function Footer() {
    return (
        <footer className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 bg-[#070410] border-t border-purple-500/15 relative overflow-hidden">
            {/* Background radiant ambient blur */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto">
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5 mb-14">
                    {/* Brand column */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 via-purple-600 to-pink-500 p-0.5 flex items-center justify-center shadow-lg shadow-purple-900/40">
                                <div className="h-full w-full bg-[#0d091a] rounded-[10px] flex items-center justify-center">
                                    <span className="text-amber-400 font-bold text-base">✧</span>
                                </div>
                            </div>
                            <span className="font-serif-heading text-xl font-bold tracking-wider text-slate-100">
                                CRYSTAL<span className="text-gold-shimmer">AURA</span>
                            </span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm font-normal">
                            Hand-selected architectural minerals, crystal bracelets, healing spheres, and spiritual pyramids — ethically sourced to align your environment and elevate your personal vibrations.
                        </p>

                        <div className="pt-2 text-xs text-purple-300 font-semibold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>100% Certified Earth Crystals • Consecrated in Rishikesh</span>
                        </div>
                    </div>

                    {/* Sacred Vault */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-4 font-serif-heading">
                            Sacred Vault
                        </h4>
                        <ul className="space-y-2.5 text-xs">
                            {[
                                { label: "Signature Collections", href: "#ca-collections" },
                                { label: "Crystal of the Day", href: "#ca-crystal-of-day" },
                                { label: "7 Chakras Guide", href: "#ca-chakra-map" },
                                { label: "Energy Alignment Quiz", href: "#ca-quiz" },
                                { label: "Bracelet Matcher", href: "#ca-calculator" },
                                { label: "Bestselling Stones", href: "#ca-bestsellers" },
                            ].map((item) => (
                                <li key={item.label}>
                                    <a
                                        href={item.href}
                                        className="text-slate-400 hover:text-amber-300 transition-colors"
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Vedic Knowledge */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-4 font-serif-heading">
                            Vedic Knowledge
                        </h4>
                        <ul className="space-y-2.5 text-xs">
                            {[
                                { label: "Vastu Directional Guide", href: "#ca-vastu" },
                                { label: "Customer Reviews", href: "#ca-reviews" },
                                { label: "Purification Rituals", href: "#ca-faq" },
                                { label: "Authenticity Testing", href: "#ca-faq" },
                                { label: "Packaging & Safety", href: "#ca-faq" },
                            ].map((item) => (
                                <li key={item.label}>
                                    <a
                                        href={item.href}
                                        className="text-slate-400 hover:text-amber-300 transition-colors"
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Devlomatix Ecosystem */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-4 font-serif-heading">
                            Devlomatix Ecosystem
                        </h4>
                        <ul className="space-y-2 text-xs">
                            <li>
                                <span className="text-slate-300 font-semibold">KonnectX</span>
                                <span className="block text-[11px] text-slate-500">Telecom &amp; IoT</span>
                            </li>
                            <li>
                                <span className="text-slate-300 font-semibold">Curexa Health</span>
                                <span className="block text-[11px] text-slate-500">Clinical EHR &amp; Telehealth</span>
                            </li>
                            <li>
                                <span className="text-slate-300 font-semibold">SolarBright</span>
                                <span className="block text-[11px] text-slate-500">Clean Energy &amp; Storage</span>
                            </li>
                            <li>
                                <span className="text-slate-300 font-semibold">HireFlow ATS</span>
                                <span className="block text-[11px] text-slate-500">Talent Acquisition</span>
                            </li>
                            <li>
                                <span className="text-amber-400 font-semibold flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" /> CrystalAura
                                </span>
                                <span className="block text-[11px] text-slate-500">Holistic Wellness &amp; Gems</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Giant Brand Monogram */}
                <div className="mt-10 text-center select-none pointer-events-none overflow-hidden">
                    <p className="text-[10vw] font-serif-heading font-black opacity-[0.03] text-gold-shimmer leading-none">
                        CRYSTAL AURA
                    </p>
                </div>

                {/* Bottom Bar */}
                <div className="pt-6 border-t border-purple-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <p>© 2026 CrystalAura. All rights reserved. A Devlomatix Venture.</p>
                    <p className="flex items-center gap-1">
                        Crafted with <Heart className="h-3.5 w-3.5 text-rose-500 inline fill-rose-500" /> and sacred intention
                    </p>
                </div>
            </div>
        </footer>
    );
}
