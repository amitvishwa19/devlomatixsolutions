"use client";

import React, { useState } from "react";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export default function Newsletter() {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
        }
    };

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#090614] to-[#120a24] border-b border-purple-500/10 relative">
            <div className="max-w-4xl mx-auto">
                <div className="ca-glass-card rounded-3xl p-8 sm:p-14 text-center border-purple-500/30 shadow-2xl relative overflow-hidden">
                    {/* Background glow orbs */}
                    <div className="absolute -top-20 -left-20 h-48 w-48 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-lg">
                            <Sparkles className="h-6 w-6" />
                        </div>

                        <h2 className="font-serif-heading text-2xl sm:text-3xl lg:text-4xl font-normal text-slate-100 mb-3">
                            Awaken Your <span className="text-gold-shimmer italic">Spiritual Vibration</span>
                        </h2>

                        <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto mb-8 leading-relaxed font-normal">
                            Subscribe for monthly astrological crystal guides, Vedic full moon cleansing rituals, and an instant 10% blessing on your first sacred acquisition.
                        </p>

                        {subscribed ? (
                            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold">
                                <CheckCircle2 className="h-5 w-5" />
                                <span>✦ Welcome to the CrystalAura circle. Check your inbox for your 10% code.</span>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit}
                                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                            >
                                <input
                                    type="email"
                                    placeholder="Enter your sacred email..."
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="flex-1 px-4 py-3.5 rounded-xl bg-[#090614]/90 border border-purple-500/30 text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-3.5 rounded-xl btn-gold-gradient font-serif-heading font-bold text-xs text-slate-950 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                                >
                                    <span>Join Circle</span>
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </form>
                        )}

                        <p className="mt-4 text-[11px] text-slate-500">
                            Strict zero spam policy. One-click unsubscribe at any moon cycle.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
