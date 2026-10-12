"use client";

import React from "react";
import { Briefcase, Twitter, Linkedin, Github, Heart, Sparkles } from "lucide-react";

export default function Footer() {
    return (
        <footer className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 border-t border-indigo-500/10 bg-slate-950/90 relative">
            <div className="max-w-7xl mx-auto">
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5 mb-14">
                    {/* Brand column */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30">
                                <Briefcase className="h-4 w-4" />
                            </div>
                            <span className="text-xl font-black text-slate-100 font-heading">
                                HireFlow
                            </span>
                            <span className="text-[10px] font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-800/50 px-2 py-0.5 rounded-full ml-1">
                                ATS 2.0
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mb-6">
                            The intelligent, candidate-first applicant tracking system built for fast-moving teams that prioritize recruiting excellence.
                        </p>
                        <div className="flex items-center gap-2.5">
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noreferrer"
                                className="h-9 w-9 rounded-xl glass-card flex items-center justify-center text-slate-400 hover:text-indigo-300 hover:border-indigo-400/40 transition-all"
                                aria-label="Twitter"
                            >
                                <Twitter className="h-4 w-4" />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noreferrer"
                                className="h-9 w-9 rounded-xl glass-card flex items-center justify-center text-slate-400 hover:text-indigo-300 hover:border-indigo-400/40 transition-all"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="h-4 w-4" />
                            </a>
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noreferrer"
                                className="h-9 w-9 rounded-xl glass-card flex items-center justify-center text-slate-400 hover:text-indigo-300 hover:border-indigo-400/40 transition-all"
                                aria-label="GitHub"
                            >
                                <Github className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 font-heading">
                            Platform
                        </h4>
                        <ul className="space-y-2.5 text-xs sm:text-sm">
                            {[
                                { label: "AI Screening", href: "#hf-features" },
                                { label: "Kanban Pipeline", href: "#hf-pipeline" },
                                { label: "How It Works", href: "#hf-how-it-works" },
                                { label: "Integrations", href: "#hf-integrations" },
                                { label: "Pricing & Plans", href: "#hf-pricing" },
                            ].map((item) => (
                                <li key={item.label}>
                                    <a
                                        href={item.href}
                                        className="text-slate-400 hover:text-indigo-300 transition-colors"
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 font-heading">
                            Resources
                        </h4>
                        <ul className="space-y-2.5 text-xs sm:text-sm">
                            {[
                                { label: "Recruiter Playbooks", href: "#hf-testimonials" },
                                { label: "Comparison Matrix", href: "#hf-comparison" },
                                { label: "FAQ & Help", href: "#hf-faq" },
                                { label: "API Documentation", href: "#hf-integrations" },
                                { label: "Security & GDPR", href: "#hf-faq" },
                            ].map((item) => (
                                <li key={item.label}>
                                    <a
                                        href={item.href}
                                        className="text-slate-400 hover:text-indigo-300 transition-colors"
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Ecosystem / Devlomatix */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 font-heading">
                            Devlomatix Ecosystem
                        </h4>
                        <ul className="space-y-2.5 text-xs sm:text-sm">
                            <li>
                                <span className="text-slate-300 font-medium">KonnectX</span>
                                <span className="block text-[11px] text-slate-500">Telecom &amp; IoT</span>
                            </li>
                            <li>
                                <span className="text-slate-300 font-medium">Curexa Health</span>
                                <span className="block text-[11px] text-slate-500">Clinical EHR &amp; Telehealth</span>
                            </li>
                            <li>
                                <span className="text-slate-300 font-medium">SolarBright</span>
                                <span className="block text-[11px] text-slate-500">Clean Energy &amp; Storage</span>
                            </li>
                            <li>
                                <span className="text-indigo-400 font-medium flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" /> HireFlow ATS
                                </span>
                                <span className="block text-[11px] text-slate-500">Recruitment &amp; Talent</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <p>© 2026 HireFlow ATS. Built as part of the Devlomatix venture ecosystem.</p>
                    <p className="flex items-center gap-1.5">
                        Crafted with <Heart className="h-3.5 w-3.5 text-rose-500 inline fill-rose-500" /> for modern recruiting teams
                    </p>
                </div>
            </div>
        </footer>
    );
}
