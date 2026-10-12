"use client";

import React, { useState } from "react";
import { FileText, Users, Layers, Award, ArrowRight, CheckCircle2 } from "lucide-react";

const steps = [
    {
        step: "01",
        icon: FileText,
        title: "Create a Job Posting",
        desc: "Define your role, requirements, custom questions, and auto-distribute across LinkedIn, Naukri, and your branded careers page with one click.",
        details: ["One-click multi-board distribution", "Custom pre-screening questionnaires", "AI-optimized role descriptions"],
    },
    {
        step: "02",
        icon: Users,
        title: "Collect Applications",
        desc: "Candidates apply through your branded career page or external job boards. All applicant profiles, resumes, and answers sync automatically in real time.",
        details: ["Automated resume parsing", "Central candidate inbox", "Duplicate candidate detection"],
    },
    {
        step: "03",
        icon: Layers,
        title: "Screen & Evaluate",
        desc: "Harness AI candidate matching, standardized team scorecards, and collaborative internal notes to shortlist top-tier talent effortlessly.",
        details: ["Semantic AI skill matching (0-100%)", "Multi-reviewer scoring criteria", "Automated rejection & interview emails"],
    },
    {
        step: "04",
        icon: Award,
        title: "Hire the Best",
        desc: "Extend digital offer letters, monitor e-signatures, track acceptance rates, and seamlessly sync new hire data into your HRMS or payroll.",
        details: ["E-signature workflow integration", "Real-time offer acceptance alerts", "Instant onboarding data export"],
    },
];

export default function HowItWorks() {
    const [activeStep, setActiveStep] = useState(0);

    return (
        <section id="hf-how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-indigo-500/10 relative">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="mx-auto mb-16 max-w-2xl text-center">
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                        Workflow
                    </span>
                    <h2 className="mt-4 mb-4 text-3xl lg:text-4xl font-bold text-slate-100 font-heading">
                        From Job Post to Offer in <span className="text-gradient-hireflow">4 Fast Steps</span>
                    </h2>
                    <p className="text-slate-400 text-base lg:text-lg">
                        A modern, streamlined recruitment engine that reduces hiring friction, keeps teams aligned, and delights candidates.
                    </p>
                </div>

                {/* Steps Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {steps.map((item, i) => {
                        const Icon = item.icon;
                        const isCurrent = activeStep === i;
                        return (
                            <div
                                key={item.step}
                                onClick={() => setActiveStep(i)}
                                className={`relative rounded-2xl glass-card p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                                    isCurrent
                                        ? "border-indigo-400/50 shadow-xl shadow-indigo-500/10 -translate-y-1 bg-slate-900/80 ring-1 ring-indigo-400/30"
                                        : "hover:border-slate-700 hover:-translate-y-0.5"
                                }`}
                            >
                                {/* Giant Step Number Background */}
                                <span className="absolute -top-3 right-4 text-5xl font-heading font-black text-indigo-500/10 select-none">
                                    {item.step}
                                </span>

                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <div
                                            className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${
                                                isCurrent
                                                    ? "bg-indigo-500/25 text-indigo-300 border border-indigo-500/30"
                                                    : "bg-slate-800/80 text-slate-400 border border-slate-700/50"
                                            }`}
                                        >
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <span className="text-xs font-semibold text-indigo-400/80 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/50">
                                            Phase {item.step}
                                        </span>
                                    </div>

                                    <h3 className="mb-2 text-lg font-bold text-slate-100 font-heading">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                                        {item.desc}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-800/80">
                                    <ul className="space-y-1.5">
                                        {item.details.map((d, dIdx) => (
                                            <li key={dIdx} className="flex items-center gap-1.5 text-xs text-slate-300">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                                                <span>{d}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Callout banner */}
                <div className="mt-12 glass-card rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-indigo-500/20">
                    <div className="text-center sm:text-left">
                        <div className="text-base font-bold text-slate-100 font-heading">
                            Ready to accelerate your hiring pipeline?
                        </div>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1">
                            Set up your organization, customize your pipeline stages, and invite your hiring team in 15 minutes.
                        </p>
                    </div>
                    <a
                        href="#hf-pipeline"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/30 whitespace-nowrap shrink-0"
                    >
                        <span>View Live Pipeline</span>
                        <ArrowRight className="h-4 w-4" />
                    </a>
                </div>
            </div>
        </section>
    );
}
