"use client";

import React from "react";
import { Linkedin, Twitter, Github } from "lucide-react";

const teamMembers = [
    {
        name: "Arjun Mehta",
        role: "CEO & Co-Founder",
        avatar: "AM",
        bio: "Former VP Engineering at Infosys. Over 14 years scaling engineering teams. Passionate about fixing broken, tedious hiring workflows.",
        socials: { linkedin: "#", twitter: "#" },
    },
    {
        name: "Shreya Iyer",
        role: "CTO & Co-Founder",
        avatar: "SI",
        bio: "Ex-Google Senior ML Engineer. Spearheaded candidate-matching algorithms and real-time semantic parsing infrastructure.",
        socials: { linkedin: "#", github: "#" },
    },
    {
        name: "Rohan Desai",
        role: "Head of Product",
        avatar: "RD",
        bio: "10+ years in talent tech. Led product teams across 500+ global hiring organizations to build frictionless workflow UX.",
        socials: { linkedin: "#", twitter: "#" },
    },
    {
        name: "Sofia Petrov",
        role: "Head of Design",
        avatar: "SP",
        bio: "Award-winning enterprise UX architect. Believes consumer-grade beauty and keyboard-driven ergonomics make recruiters 10x faster.",
        socials: { linkedin: "#", twitter: "#" },
    },
];

export default function Team() {
    return (
        <section id="hf-team" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-indigo-500/10 relative">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mx-auto mb-16 max-w-2xl text-center">
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                        Leadership
                    </span>
                    <h2 className="mt-4 mb-4 text-3xl lg:text-4xl font-bold text-slate-100 font-heading">
                        Built by Seasoned <span className="text-gradient-hireflow">Hiring Experts</span>
                    </h2>
                    <p className="text-slate-400 text-base lg:text-lg">
                        We lived through the pain of clunky, outdated recruiting tools — so we built the modern ATS we always wished existed.
                    </p>
                </div>

                {/* Team Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
                    {teamMembers.map((member) => (
                        <div
                            key={member.name}
                            className="glass-card rounded-2xl p-6 text-center transition-all duration-300 hover:border-indigo-400/40 hover:-translate-y-1 group flex flex-col justify-between"
                        >
                            <div>
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-600/30 text-indigo-300 text-lg font-bold font-heading border border-indigo-500/30 group-hover:scale-105 transition-transform shadow-md shadow-indigo-500/20">
                                    {member.avatar}
                                </div>
                                <h3 className="text-base font-bold text-slate-100 font-heading">
                                    {member.name}
                                </h3>
                                <p className="text-xs font-semibold text-indigo-400 mt-0.5">
                                    {member.role}
                                </p>
                                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                                    {member.bio}
                                </p>
                            </div>

                            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2">
                                <a
                                    href={member.socials.linkedin}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                                    aria-label="LinkedIn Profile"
                                >
                                    <Linkedin className="h-4 w-4" />
                                </a>
                                {member.socials.twitter && (
                                    <a
                                        href={member.socials.twitter}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                                        aria-label="Twitter Profile"
                                    >
                                        <Twitter className="h-4 w-4" />
                                    </a>
                                )}
                                {member.socials.github && (
                                    <a
                                        href={member.socials.github}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                                        aria-label="GitHub Profile"
                                    >
                                        <Github className="h-4 w-4" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
