'use client';

import React from "react";
import {
  Sparkles,
  Kanban,
  CheckCircle,
  BarChart3,
  MessageSquare,
  Globe,
  Shield,
  Users,
  MousePointerClick,
  Mail,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Sparkles, title: "AI Resume Screening", desc: "Instantly score, extract skills, and rank inbound CVs against your exact job description criteria." },
  { icon: Kanban, title: "Visual Kanban Pipeline", desc: "Track every candidate across customizable stages with smooth drag-and-drop workflow status updates." },
  { icon: CheckCircle, title: "Custom Scorecards", desc: "Structured interview feedback kits with standardized rubrics ensure fair, unbiased evaluations." },
  { icon: BarChart3, title: "Advanced Talent Analytics", desc: "Actionable dashboards measuring time-to-hire, funnel conversion drop-offs, and source ROI." },
  { icon: MessageSquare, title: "Automated Communication", desc: "Trigger candidate stage updates via automated email or SMS, keeping talent engaged and informed." },
  { icon: Globe, title: "Branded Career Site", desc: "Publish a responsive, SEO-optimized career portal in minutes without writing a single line of code." },
  { icon: Shield, title: "Compliance Ready", desc: "Built-in EEOC, GDPR, and data privacy safeguards with encrypted audit logs for every hiring decision." },
  { icon: Users, title: "Collaborative Review", desc: "Shared interview notes, team @mentions, and aggregated scorecards eliminate hiring bottlenecks." },
  { icon: MousePointerClick, title: "Bulk Stage Transitions", desc: "Progress or reject dozens of applicants simultaneously with customized, personalized rejection notes." },
  { icon: Mail, title: "Template Library", desc: "Pre-built templates for interview invitations, technical tests, reference checks, and offer letters." },
  { icon: Target, title: "AI Candidate Matching", desc: "Proactively rediscover past silver-medalist applicants already stored in your talent pool." },
];

export function Features() {
  return (
    <section id="hf-features" className="py-20 lg:py-28 relative overflow-hidden bg-background">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="container mx-auto px-4 md:px-8 pt-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            <span className="w-6 h-px bg-indigo-500" />
            Complete Recruitment Suite
            <span className="w-6 h-px bg-indigo-500" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Everything You Need to Hire
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            Enterprise-grade recruitment tools engineered for modern high-velocity hiring teams.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group rounded-2xl glass-card p-6 border border-border/70 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-base font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
