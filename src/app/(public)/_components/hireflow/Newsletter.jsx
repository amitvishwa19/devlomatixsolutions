"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";

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
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-indigo-500/10 relative">
            <div className="max-w-4xl mx-auto">
                <div className="glass-card rounded-3xl p-8 sm:p-12 text-center border-indigo-500/20 shadow-2xl relative overflow-hidden">
                    {/* Background glow circle */}
                    <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

                    <div className="relative">
                        <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                            <Mail className="h-7 w-7" />
                        </div>
                        <h2 className="mb-3 text-2xl sm:text-3xl font-extrabold text-slate-100 font-heading">
                            Stay Ahead in <span className="text-gradient-hireflow">Modern Hiring</span>
                        </h2>
                        <p className="mb-8 text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
                            Subscribe to our bi-weekly dispatch featuring talent acquisition benchmarks, AI recruiting playbooks, and HireFlow product drops.
                        </p>

                        {subscribed ? (
                            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-semibold">
                                <CheckCircle2 className="h-5 w-5" />
                                <span>You&apos;re on the list! Check your inbox for the recruiter starter pack.</span>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit}
                                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                            >
                                <input
                                    type="email"
                                    placeholder="Enter your work email..."
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="flex-1 px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 whitespace-nowrap"
                                >
                                    <span>Subscribe</span>
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </form>
                        )}

                        <p className="mt-5 text-xs text-slate-500">
                            Strict zero spam policy. One-click unsubscribe at any time.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
