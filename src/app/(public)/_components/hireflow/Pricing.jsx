"use client";

import React, { useState } from "react";
import { CheckCircle, Zap, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

const plans = [
    {
        name: "Starter",
        tagline: "For early startups & small teams making their first key hires.",
        priceMonthly: "₹0",
        priceAnnual: "₹0",
        period: "free forever",
        popular: false,
        badge: "Free Tier",
        features: [
            "Up to 5 active job postings",
            "50 candidate profiles / month",
            "Interactive Kanban pipeline view",
            "Branded company career page",
            "Resume parser (basic)",
            "Email notifications & alerts",
            "Community & email support",
        ],
        ctaText: "Start Free Now",
        ctaVariant: "outline",
    },
    {
        name: "Growth & Pro",
        tagline: "For high-growth teams and agencies that hire continuously.",
        priceMonthly: "₹4,999",
        priceAnnual: "₹3,999",
        period: "per month, billed annually",
        popular: true,
        badge: "Most Popular",
        features: [
            "Unlimited active job postings",
            "Unlimited candidate processing",
            "AI Semantic Candidate Matching (95%+ accuracy)",
            "Custom hiring stages & multi-rubric scorecards",
            "Automated multi-stage email drip campaigns",
            "2-Way Google & Outlook calendar sync",
            "Advanced time-to-hire & funnel analytics",
            "Team @mentions and private interview notes",
            "Priority 24/7 chat support",
        ],
        ctaText: "Start 14-Day Pro Trial",
        ctaVariant: "primary",
    },
    {
        name: "Enterprise",
        tagline: "For scaling enterprises with custom compliance, security & SLA needs.",
        priceMonthly: "Custom",
        priceAnnual: "Custom",
        period: "tailored for your organization",
        popular: false,
        badge: "Enterprise Grade",
        features: [
            "Everything in Pro included",
            "Okta, Azure AD, SAML 2.0 & Google SSO",
            "Custom HRIS & ERP integrations (Workday, SAP)",
            "Custom role-based permissions & audit log exports",
            "Dedicated Customer Success Manager",
            "99.99% Uptime SLA agreement",
            "White-glove data migration from legacy ATS",
            "Custom security & compliance signoffs (SOC2 / GDPR)",
        ],
        ctaText: "Contact Enterprise Sales",
        ctaVariant: "outline",
    },
];

export default function Pricing() {
    const [isAnnual, setIsAnnual] = useState(true);

    return (
        <section id="hf-pricing" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-indigo-500/10 relative">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="mx-auto mb-14 max-w-2xl text-center">
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                        Pricing Plans
                    </span>
                    <h2 className="mt-4 mb-4 text-3xl lg:text-4xl font-bold text-slate-100 font-heading">
                        Simple, Transparent <span className="text-gradient-hireflow">Recruiting Pricing</span>
                    </h2>
                    <p className="text-slate-400 text-base lg:text-lg">
                        Start completely free. Upgrade smoothly when you scale. No hidden fees or lock-ins.
                    </p>

                    {/* Billing Toggle */}
                    <div className="mt-8 inline-flex items-center gap-3 p-1 rounded-full glass-card border-indigo-500/30">
                        <button
                            onClick={() => setIsAnnual(false)}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                !isAnnual
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                    : "text-slate-400 hover:text-slate-200"
                            }`}
                        >
                            Monthly Billing
                        </button>
                        <button
                            onClick={() => setIsAnnual(true)}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                isAnnual
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                    : "text-slate-400 hover:text-slate-200"
                            }`}
                        >
                            <span>Annual Billing</span>
                            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                Save 20%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto items-stretch">
                    {plans.map((plan) => {
                        const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
                        return (
                            <div
                                key={plan.name}
                                className={`relative rounded-2xl glass-card p-8 flex flex-col justify-between transition-all duration-300 ${
                                    plan.popular
                                        ? "border-indigo-400/60 shadow-2xl shadow-indigo-500/20 lg:-translate-y-2 bg-slate-900/90 ring-1 ring-indigo-400/40"
                                        : "hover:border-slate-700 hover:-translate-y-1"
                                }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 px-4 py-1 text-xs font-bold text-white shadow-lg shadow-indigo-500/30 flex items-center gap-1.5">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        {plan.badge}
                                    </div>
                                )}

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-bold text-slate-100 font-heading">
                                            {plan.name}
                                        </h3>
                                        {!plan.popular && (
                                            <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full">
                                                {plan.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed mb-6">
                                        {plan.tagline}
                                    </p>

                                    {/* Price */}
                                    <div className="my-6 pb-6 border-b border-slate-800">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-4xl lg:text-5xl font-extrabold text-slate-50 font-heading tracking-tight">
                                                {price}
                                            </span>
                                            {plan.name !== "Enterprise" && (
                                                <span className="text-xs text-slate-400">
                                                    {plan.period}
                                                </span>
                                            )}
                                        </div>
                                        {plan.name === "Enterprise" && (
                                            <span className="text-xs text-indigo-400 mt-1 block">
                                                {plan.period}
                                            </span>
                                        )}
                                    </div>

                                    {/* Features List */}
                                    <div className="space-y-3 mb-8">
                                        <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                                            What&apos;s included:
                                        </div>
                                        <ul className="space-y-2.5">
                                            {plan.features.map((f) => (
                                                <li key={f} className="flex items-start gap-2.5 text-xs text-slate-300 leading-snug">
                                                    <CheckCircle className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                                                    <span>{f}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="button"
                                        className={`w-full py-3 px-5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                                            plan.popular
                                                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/40"
                                                : "bg-slate-800/80 hover:bg-slate-700 text-slate-100 border border-slate-700/60"
                                        }`}
                                    >
                                        <span>{plan.ctaText}</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Trust guarantee banner */}
                <div className="mt-14 max-w-3xl mx-auto text-center flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <Zap className="h-4 w-4 text-indigo-400" /> Instant setup in under 15 minutes
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" /> Cancel or switch plans anytime
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <Sparkles className="h-4 w-4 text-amber-400" /> 14-day risk-free Pro trial
                    </span>
                </div>
            </div>
        </section>
    );
}
