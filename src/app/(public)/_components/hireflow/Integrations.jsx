"use client";

import React, { useState } from "react";
import { CheckCircle2, ArrowUpRight } from "lucide-react";

const integrationsList = [
    {
        name: "LinkedIn",
        category: "Sourcing & Job Boards",
        desc: "One-click job publishing and seamless 1-click apply sync.",
        icon: (
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#0A66C2]" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
    },
    {
        name: "Naukri",
        category: "Sourcing & Job Boards",
        desc: "Direct integration with India's leading job portal database.",
        icon: (
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#1A73E8]" fill="currentColor">
                <path d="M11.566 21.5629v-8.148c0-.6893.0776-.9564.2329-1.5505.3106-1.1458 1.0894-2.1022 2.0234-2.7187.4659-.3105.9788-.543 1.5282-.6893.4882-.1329 1.0447-.1776 1.8235-.1776V5c-1.4059.0447-2.6517.3776-3.7199 1.0447-1.0671.6446-1.9117 1.5729-2.5117 2.7187v-3.54H8v16.34h3.566zM15.174 4.7c1.2894 0 2.3353-1.0682 2.3353-2.3576C17.5093 1.0459 16.4634 0 15.174 0c-1.2894 0-2.3341 1.0459-2.3341 2.3424 0 1.2894 1.0447 2.3576 2.3341 2.3576z" />
            </svg>
        ),
    },
    {
        name: "Glassdoor & Indeed",
        category: "Sourcing & Job Boards",
        desc: "Syndicate job listings and capture verified company reviews.",
        icon: (
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#0CAA41]" fill="currentColor">
                <path d="M17.144 20.572H6.857A3.429 3.429 0 0 1 3.43 17.144V10.29h13.714a3.429 3.429 0 0 1 3.429 3.428v6.854zm0-20.572H6.857v6.857H20.57V3.43A3.429 3.429 0 0 0 17.144 0z" />
            </svg>
        ),
    },
    {
        name: "Slack",
        category: "Collaboration",
        desc: "Real-time candidate notifications, scorecard reminders, and approval votes.",
        icon: (
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#ECB22E]" fill="currentColor">
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
            </svg>
        ),
    },
    {
        name: "Microsoft Teams",
        category: "Collaboration",
        desc: "Interview scheduling bots and interview panel team channels.",
        icon: (
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#5059C9]" fill="currentColor">
                <path d="M20.625 8.25h-1.5a2.247 2.247 0 0 0 .375 1.245V14.1a3.6 3.6 0 0 1-3.6 3.6h-3.27a4.47 4.47 0 0 0 1.62 1.95 4.47 4.47 0 0 0 2.49.75 4.5 4.5 0 0 0 4.5-4.5V8.865a.615.615 0 0 0-.615-.615zM21.75 7.5a1.875 1.875 0 1 0 0-3.75 1.875 1.875 0 0 0 0 3.75zM13.5 6a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5zM16.125 7.5H10.5a.75.75 0 0 0-.75.75v6a3.75 3.75 0 0 0 7.125 1.613A3.75 3.75 0 0 0 16.875 14.25V8.25a.75.75 0 0 0-.75-.75zM8.25 9H3.375A1.125 1.125 0 0 0 2.25 10.125v3.75A1.125 1.125 0 0 0 3.375 15h1.5v2.625a1.875 1.875 0 0 0 3.75 0V10.125A1.125 1.125 0 0 0 7.5 9h.75z" />
            </svg>
        ),
    },
    {
        name: "Google Calendar & Meet",
        category: "Scheduling",
        desc: "Automated candidate self-booking with instant Meet links.",
        icon: (
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#EA4335]" fill="currentColor">
                <path d="M18.316 5.684H24v12.632h-5.684V5.684zM5.684 24h12.632v-5.684H5.684V24zM18.316 5.684V0H5.684v5.684h12.632zM0 18.316h5.684V5.684H0v12.632zM5.684 24H0v-5.684h5.684V24zm12.632 0H24v-5.684h-5.684V24zM0 0v5.684h5.684V0H0zm18.316 0v5.684H24V0h-5.684z" />
            </svg>
        ),
    },
    {
        name: "Zoom Video",
        category: "Scheduling",
        desc: "Generate secure interview rooms automatically per scheduled candidate.",
        icon: (
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#2D8CFF]" fill="currentColor">
                <path d="M24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12zm-6.263-1.2l-3.135 2.237V10.8a1.2 1.2 0 0 0-1.2-1.2H6.6a1.2 1.2 0 0 0-1.2 1.2v4.8a1.2 1.2 0 0 0 1.2 1.2h6.802a1.2 1.2 0 0 0 1.2-1.2v-2.237l3.135 2.237V10.8z" />
            </svg>
        ),
    },
    {
        name: "Gmail / Outlook",
        category: "Email & Comms",
        desc: "Full 2-way email sync with shared inbox threads and custom aliases.",
        icon: (
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#EA4335]" fill="currentColor">
                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
            </svg>
        ),
    },
    {
        name: "GitHub",
        category: "Technical Screening",
        desc: "Inspect candidate repositories, PR history, and open-source contributions.",
        icon: (
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-slate-200" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
        ),
    },
    {
        name: "Workday",
        category: "HRIS & Payroll",
        desc: "Push signed offer letters and candidate profiles straight to HRIS onboarding.",
        icon: (
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#E28743]" fill="currentColor">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" />
                <circle cx="6" cy="6" r="2" />
                <circle cx="18" cy="6" r="2" />
            </svg>
        ),
    },
    {
        name: "BambooHR",
        category: "HRIS & Payroll",
        desc: "Instant employee record provisioning with zero double-entry errors.",
        icon: (
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#73C045]" fill="currentColor">
                <path d="M12 0C8 0 6 4 6 8c0 2 .5 3.5 1.5 5C5 14 3 16 3 19c0 2.5 2 5 5 5h8c3 0 5-2.5 5-5 0-3-2-5-4.5-6 1-1.5 1.5-3 1.5-5 0-4-2-8-6-8zm0 2c2.5 0 4 3 4 6s-1.5 5-4 5-4-2-4-5 1.5-6 4-6z" />
            </svg>
        ),
    },
    {
        name: "WhatsApp Business",
        category: "Candidate Engagement",
        desc: "Instant interview reminders, address shares, and quick candidate check-ins.",
        icon: (
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#25D366]" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
            </svg>
        ),
    },
];

const categories = ["All", "Sourcing & Job Boards", "Collaboration", "Scheduling", "HRIS & Payroll"];

export default function Integrations() {
    const [selectedCategory, setSelectedCategory] = useState("All");

    const filtered = selectedCategory === "All"
        ? integrationsList
        : integrationsList.filter((item) => item.category === selectedCategory);

    return (
        <section id="hf-integrations" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-indigo-500/10 relative">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                        Ecosystem
                    </span>
                    <h2 className="mt-4 mb-4 text-3xl lg:text-4xl font-bold text-slate-100 font-heading">
                        Works With Your <span className="text-gradient-hireflow">Favorite Tools</span>
                    </h2>
                    <p className="text-slate-400 text-base lg:text-lg">
                        Plug HireFlow directly into your existing communication, calendar, sourcing, and HR tech stack with zero coding.
                    </p>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                                selectedCategory === cat
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                    : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {filtered.map((item) => (
                        <div
                            key={item.name}
                            className="glass-card rounded-xl p-5 transition-all duration-300 hover:border-indigo-400/50 hover:-translate-y-1 group flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="h-11 w-11 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                                        {item.icon}
                                    </div>
                                    <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                                        Active
                                    </span>
                                </div>
                                <h3 className="text-sm font-bold text-slate-100 font-heading group-hover:text-indigo-300 transition-colors">
                                    {item.name}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                                <span className="flex items-center gap-1 text-indigo-400 font-medium">
                                    <CheckCircle2 className="h-3 w-3" /> Ready to sync
                                </span>
                                <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-indigo-400 transition-opacity" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
