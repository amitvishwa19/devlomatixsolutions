"use client";

import React, { useState } from "react";
import { Check, X, Sparkles } from "lucide-react";

const comparisonRows = [
    { feature: "AI Semantic Resume Screening", hireflow: true, competitor1: false, competitor2: false, note: "Automatically scores relevance against exact job criteria" },
    { feature: "Visual Drag & Drop Kanban Pipeline", hireflow: true, competitor1: true, competitor2: false, note: "Instant multi-stage candidate progression" },
    { feature: "Structured Team Scorecards", hireflow: true, competitor1: true, competitor2: false, note: "Standardized rubric prevents hiring bias" },
    { feature: "Automated Candidate Email Campaigns", hireflow: true, competitor1: false, competitor2: false, note: "Personalized multi-touch follow-ups on auto-pilot" },
    { feature: "Collaborative Team Notes & @Mentions", hireflow: true, competitor1: true, competitor2: false, note: "Keep interviewer feedback in one unified thread" },
    { feature: "Self-Service Interview Self-Scheduling", hireflow: true, competitor1: false, competitor2: false, note: "Syncs 2-way with Google Calendar & Outlook" },
    { feature: "Built-in White-label Careers Site", hireflow: true, competitor1: false, competitor2: false, note: "Custom domain, themes, and instant mobile optimization" },
    { feature: "Deep Job Board Distribution (10+ channels)", hireflow: true, competitor1: true, competitor2: false, note: "Post once to LinkedIn, Naukri, Glassdoor, Indeed" },
    { feature: "Zero Setup Cost / Generous Free Tier", hireflow: true, competitor1: false, competitor2: true, note: "Start hiring immediately without upfront enterprise contracts" },
    { feature: "Automated GDPR & EEOC Compliance Trails", hireflow: true, competitor1: true, competitor2: false, note: "Cryptographic audit logging and candidate consent controls" },
    { feature: "REST & Webhook Developer APIs", hireflow: true, competitor1: false, competitor2: false, note: "Seamless bi-directional integration into custom HR stacks" },
];

export default function Comparison() {
    const [hoveredRow, setHoveredRow] = useState(null);

    return (
        <section id="hf-comparison" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-indigo-500/10 relative">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mx-auto mb-16 max-w-2xl text-center">
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                        Competitive Analysis
                    </span>
                    <h2 className="mt-4 mb-4 text-3xl lg:text-4xl font-bold text-slate-100 font-heading">
                        Why Modern Teams Choose <span className="text-gradient-hireflow">HireFlow</span>
                    </h2>
                    <p className="text-slate-400 text-base lg:text-lg">
                        See how HireFlow delivers modern agility and intelligence compared to bloated legacy suites and chaotic spreadsheets.
                    </p>
                </div>

                {/* Table Container */}
                <div className="max-w-5xl mx-auto glass-card rounded-2xl overflow-hidden border-indigo-500/20 shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/80">
                                    <th className="p-4 sm:p-5 text-sm font-semibold text-slate-300 w-2/5">
                                        Capabilities & Features
                                    </th>
                                    <th className="p-4 sm:p-5 text-center bg-indigo-950/40 border-x border-indigo-500/30 w-1/5">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold font-heading">
                                            <Sparkles className="h-3.5 w-3.5" />
                                            HireFlow
                                        </div>
                                    </th>
                                    <th className="p-4 sm:p-5 text-center text-xs sm:text-sm font-medium text-slate-400 w-1/5">
                                        Legacy ATS Suites
                                    </th>
                                    <th className="p-4 sm:p-5 text-center text-xs sm:text-sm font-medium text-slate-400 w-1/5">
                                        Spreadsheets & Email
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
                                {comparisonRows.map((row, i) => (
                                    <tr
                                        key={row.feature}
                                        onMouseEnter={() => setHoveredRow(i)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                        className={`transition-colors ${
                                            hoveredRow === i ? "bg-indigo-950/20" : i % 2 === 0 ? "bg-slate-900/30" : "bg-transparent"
                                        }`}
                                    >
                                        <td className="p-4 sm:p-5 text-slate-200 font-medium">
                                            <div className="flex flex-col">
                                                <span className="flex items-center gap-1.5">
                                                    {row.feature}
                                                </span>
                                                <span className="text-[11px] text-slate-500 mt-0.5">
                                                    {row.note}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 sm:p-5 text-center bg-indigo-950/30 border-x border-indigo-500/30">
                                            <div className="flex items-center justify-center">
                                                <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-indigo-500/20 text-indigo-400 shadow-sm shadow-indigo-500/20">
                                                    <Check className="h-4 w-4 stroke-[3]" />
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 sm:p-5 text-center">
                                            <div className="flex items-center justify-center">
                                                {row.competitor1 ? (
                                                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-800 text-slate-400">
                                                        <Check className="h-3.5 w-3.5" />
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-rose-950/30 text-rose-400/60">
                                                        <X className="h-3.5 w-3.5" />
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 sm:p-5 text-center">
                                            <div className="flex items-center justify-center">
                                                {row.competitor2 ? (
                                                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-800 text-slate-400">
                                                        <Check className="h-3.5 w-3.5" />
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-rose-950/30 text-rose-400/60">
                                                        <X className="h-3.5 w-3.5" />
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}
