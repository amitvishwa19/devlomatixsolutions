'use client';

import React from "react";
import { Shield, Lock, FileCheck2, Award } from "lucide-react";

const complianceBadges = [
  {
    icon: Shield,
    title: "NABH Ready",
    desc: "Pre-configured workflows tailored to National Accreditation Board standards",
  },
  {
    icon: Lock,
    title: "HIPAA Certified",
    desc: "256-bit AES encryption ensuring stringent healthcare data privacy",
  },
  {
    icon: FileCheck2,
    title: "ISO 27001 Standard",
    desc: "Enterprise-grade information security management and access audits",
  },
  {
    icon: Award,
    title: "Disaster Recovery",
    desc: "Automated daily multi-region cloud snapshots with one-click restore",
  },
];

export function Compliance() {
  return (
    <section className="py-12 border-y border-border/40 bg-secondary/15">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {complianceBadges.map((b) => (
            <div key={b.title} className="flex items-center gap-3.5">
              <div className="w-11 h-11 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <b.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{b.title}</p>
                <p className="text-[11px] text-muted-foreground leading-tight line-clamp-2">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
