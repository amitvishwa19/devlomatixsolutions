"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
    {
        q: "How fast can our recruiting team get fully operational?",
        a: "Most teams are fully up and running in under 15 minutes. You can import your existing candidate databases via CSV or API, sync your Google/Outlook calendars with a single click, and immediately post your first vacancy to your branded career site.",
    },
    {
        q: "Can we customize our interview stages and scoring criteria?",
        a: "Yes, completely! You can create unlimited custom pipeline stages (e.g. Technical Round 1, Culture Fit, Executive Review), build tailored scorecard rubrics for each role, and define mandatory criteria before candidates advance.",
    },
    {
        q: "How does the AI Candidate Matching actually work?",
        a: "Our AI engine analyzes the candidate's resume, verified skill certifications, and work history against your job description and custom prerequisites. It generates an objective match score (0-100%) and highlights key strengths and missing requirements without human bias.",
    },
    {
        q: "Is candidate data secure and GDPR/EEOC compliant?",
        a: "HireFlow is engineered with bank-grade AES-256 encryption at rest and TLS 1.3 in transit. We are fully SOC 2 Type II certified and adhere to global GDPR data residency standards, complete with automated data retention rules and candidate consent tracking.",
    },
    {
        q: "Is the Starter plan truly free forever?",
        a: "Yes! Our Starter plan is 100% free forever for small teams. It includes up to 5 active job postings, 50 processed candidates per month, full Kanban pipeline visualization, and your company career portal. No credit card required.",
    },
    {
        q: "Can we migrate our historical candidate records from another ATS?",
        a: "Yes. We offer automated one-click importers for major legacy ATS platforms (Greenhouse, Lever, Workable, BambooHR), as well as dedicated white-glove assisted migration on Enterprise plans.",
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(0);

    const toggle = (idx) => {
        setOpenIndex(openIndex === idx ? null : idx);
    };

    return (
        <section id="hf-faq" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-indigo-500/10 relative">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mx-auto mb-16 max-w-2xl text-center">
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                        Frequently Asked Questions
                    </span>
                    <h2 className="mt-4 mb-4 text-3xl lg:text-4xl font-bold text-slate-100 font-heading">
                        Got Questions? We Have <span className="text-gradient-hireflow">Answers</span>
                    </h2>
                    <p className="text-slate-400 text-base lg:text-lg">
                        Everything you need to know about getting started, security, features, and pricing with HireFlow.
                    </p>
                </div>

                {/* FAQ List */}
                <div className="space-y-4 max-w-3xl mx-auto">
                    {faqs.map((faq, i) => {
                        const isOpen = openIndex === i;
                        return (
                            <div
                                key={i}
                                className={`rounded-xl glass-card transition-all duration-300 overflow-hidden ${
                                    isOpen
                                        ? "border-indigo-400/50 bg-slate-900/80 shadow-lg shadow-indigo-500/10"
                                        : "hover:border-slate-700"
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => toggle(i)}
                                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer transition-colors"
                                >
                                    <span className="text-sm sm:text-base font-bold text-slate-100 font-heading pr-4">
                                        {faq.q}
                                    </span>
                                    <span
                                        className={`shrink-0 h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${
                                            isOpen
                                                ? "bg-indigo-500/20 text-indigo-300"
                                                : "bg-slate-800 text-slate-400"
                                        }`}
                                    >
                                        {isOpen ? (
                                            <Minus className="h-4 w-4" />
                                        ) : (
                                            <Plus className="h-4 w-4" />
                                        )}
                                    </span>
                                </button>
                                {isOpen && (
                                    <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm leading-relaxed text-slate-300 border-t border-slate-800/80 pt-4">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Still have questions */}
                <div className="mt-12 text-center">
                    <p className="text-xs sm:text-sm text-slate-400">
                        Have more questions?{" "}
                        <a
                            href="#hf-cta"
                            className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4"
                        >
                            Talk to our hiring solutions team
                        </a>
                    </p>
                </div>
            </div>
        </section>
    );
}
