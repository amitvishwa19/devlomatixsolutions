'use client';

import React from "react";
import { Sparkles, CheckCircle, ChevronRight, User } from "lucide-react";
import { motion } from "framer-motion";

const pipelineStages = [
  {
    name: "Applied",
    count: 42,
    candidates: [
      { name: "Siddharth Rao", role: "Sr. Frontend Dev", match: "96%", score: "A+" },
      { name: "Pooja Verma", role: "Product Designer", match: "89%", score: "B+" },
    ],
  },
  {
    name: "Screening",
    count: 18,
    candidates: [
      { name: "Aarav Sharma", role: "Full Stack Eng", match: "94%", score: "A" },
      { name: "Meera Nair", role: "DevOps Engineer", match: "91%", score: "A" },
    ],
  },
  {
    name: "Interview",
    count: 12,
    candidates: [
      { name: "Kunal Ghosh", role: "Backend Architect", match: "98%", score: "A+" },
    ],
  },
  {
    name: "Offer Sent",
    count: 5,
    candidates: [
      { name: "Tanvi Saxena", role: "Lead Product Mgr", match: "97%", score: "A+" },
    ],
  },
  {
    name: "Hired",
    count: 3,
    candidates: [
      { name: "Aditya Jain", role: "Data Scientist", match: "99%", score: "Top" },
    ],
  },
];

export function PipelinePreview() {
  return (
    <section id="hf-pipeline" className="py-20 lg:py-28 relative overflow-hidden bg-secondary/15">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="container mx-auto px-4 md:px-8 pt-16">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            <span className="w-6 h-px bg-indigo-500" />
            Product Interface
            <span className="w-6 h-px bg-indigo-500" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            See HireFlow in Action
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            A fast, intuitive drag-and-drop workspace designed to keep interview panels aligned.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Mock Window */}
          <div className="rounded-3xl border border-indigo-500/20 overflow-hidden shadow-2xl bg-card">
            {/* Window header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/50 bg-muted/40">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="bg-background/80 px-4 py-1 rounded-md text-[11px] text-muted-foreground font-mono border border-border/40">
                app.hireflow.devlomatix.com/pipeline
              </div>
              <span className="text-[11px] text-indigo-400 font-semibold">Live Workspace</span>
            </div>

            {/* Dashboard metrics bar */}
            <div className="p-6 border-b border-border/40 bg-secondary/20 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Active Roles", value: "14 Openings", delta: "+3 this week" },
                { label: "In Pipeline", value: "284 Candidates", delta: "+47 screened" },
                { label: "Interviews Today", value: "8 Scheduled", delta: "3 remaining" },
                { label: "Offers Extended", value: "5 Offers", delta: "2 accepted" },
              ].map((m) => (
                <div key={m.label} className="p-3.5 rounded-xl bg-card border border-border/60">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{m.label}</p>
                  <p className="text-lg font-bold text-foreground font-heading mt-0.5">{m.value}</p>
                  <p className="text-[10px] text-indigo-400 font-medium mt-0.5">{m.delta}</p>
                </div>
              ))}
            </div>

            {/* Visual Pipeline Grid */}
            <div className="p-6 overflow-x-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 min-w-[700px]">
                {pipelineStages.map((stage) => (
                  <div key={stage.name} className="p-3 rounded-xl bg-secondary/40 border border-border/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/40">
                        <span className="text-xs font-bold text-foreground">{stage.name}</span>
                        <span className="text-[10px] font-extrabold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                          {stage.count}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {stage.candidates.map((cand) => (
                          <div key={cand.name} className="p-2.5 rounded-lg bg-card border border-border/70 hover:border-indigo-500/40 transition-colors shadow-xs">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                                <User className="w-3 h-3" />
                              </div>
                              <p className="text-xs font-semibold text-foreground truncate">{cand.name}</p>
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate">{cand.role}</p>
                            <div className="mt-2 pt-1.5 border-t border-border/30 flex items-center justify-between text-[10px]">
                              <span className="text-emerald-500 font-bold flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" /> {cand.match}
                              </span>
                              <span className="text-muted-foreground font-mono">{cand.score}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-border/20 text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
                      <span>View Stage</span>
                      <ChevronRight className="w-3 h-3 text-indigo-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating Badges */}
          <div className="hidden lg:flex absolute -left-5 top-1/3 glass-card rounded-xl p-3 border border-indigo-500/30 items-center gap-2.5 shadow-xl">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">AI Match Score: 98%</p>
              <p className="text-[10px] text-muted-foreground">Top 1% Candidate Verified</p>
            </div>
          </div>

          <div className="hidden lg:flex absolute -right-5 bottom-1/4 glass-card rounded-xl p-3 border border-indigo-500/30 items-center gap-2.5 shadow-xl">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <CheckCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Offer Letter Signed</p>
              <p className="text-[10px] text-muted-foreground">Onboarding Automated</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default PipelinePreview;
