"use client";

import React, { useState } from "react";
import { ArrowRight, Headphones, CheckCircle2, Sparkles } from "lucide-react";

export default function CTA() {
    const [demoRequested, setDemoRequested] = useState(false);

    return (
        <section id="hf-cta" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-indigo-500/10 relative">
            <div className="max-w-6xl mx-auto">
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900/90 via-slate-900 to-slate-950 p-10 sm:p-16 text-center border border-indigo-500/40 shadow-2xl">
                    {/* Background accents */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(243_75%_59%/0.25)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,hsl(262_83%_58%/0.2)_0%,transparent_50%)] pointer-events-none" />

                    <div className="relative max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-6">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Transform Your Hiring Pipeline Today</span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 font-heading leading-tight mb-5">
                            Start Hiring Better, Smarter &amp;{" "}
                            <span className="text-gradient-hireflow">Faster Right Now</span>
                        </h2>

                        <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-10">
                            Join 10,000+ leading companies and hyper-growth startups that rely on HireFlow to identify, evaluate, and hire outstanding talent.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href="#hf-pipeline"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm sm:text-base transition-all shadow-xl shadow-indigo-600/40"
                            >
                                <span>Try Interactive Pipeline Demo</span>
                                <ArrowRight className="h-4 w-4" />
                            </a>

                            <button
                                type="button"
                                onClick={() => setDemoRequested(true)}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl glass-card text-slate-200 hover:text-white hover:border-indigo-400/50 font-semibold text-sm sm:text-base transition-all border border-slate-700"
                            >
                                <Headphones className="h-4 w-4 text-indigo-400" />
                                <span>{demoRequested ? "Sales Team Notified!" : "Schedule 1-on-1 Demo"}</span>
                            </button>
                        </div>

                        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> Free 14-day full Pro trial
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> No credit card required
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> Cancel or downgrade anytime
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
