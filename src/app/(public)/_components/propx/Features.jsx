'use client';

import React from "react";
import { 
  Building2, 
  Key, 
  FileSignature, 
  Wrench, 
  MessageSquare, 
  PieChart, 
  ShieldCheck, 
  Users,
  CheckCircle2,
  DollarSign
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: FileSignature,
    title: "Digital Lease & E-Signatures",
    desc: "Draft compliant residential and commercial leases in seconds. Automate security deposit escrows and digital tenant signatures.",
    tag: "Paperless Leasing"
  },
  {
    icon: MessageSquare,
    title: "KonnectX WhatsApp Rent Reminders",
    desc: "Send automated payment links directly over WhatsApp 3 days prior to due dates, boosting on-time rent recovery to 99.2%.",
    tag: "Powered by KonnectX"
  },
  {
    icon: Wrench,
    title: "Contractor Maintenance Dispatch",
    desc: "Tenants snap photos of plumbing/HVAC issues. PropX auto-routes work orders to approved vendors with budget caps.",
    tag: "2.4 Hr Avg SLA"
  },
  {
    icon: Building2,
    title: "Visual Stacking & Unit Vacancy",
    desc: "Interactive visual building floor plans. Track vacant, occupied, and expiring units at a glance across multi-city developments.",
    tag: "Zero Blind Spots"
  },
  {
    icon: Users,
    title: "AI Tenant Screening & Background",
    desc: "Instant credit score verification, income stability telemetry, and prior eviction checks completed in under 5 minutes.",
    tag: "Vetted Tenants"
  },
  {
    icon: PieChart,
    title: "Owner Portals & Dividend Distributions",
    desc: "Automated monthly cash flow ledgers, CAM expense reconciliations, and one-click owner profit payouts.",
    tag: "PayFlow Integrated"
  }
];

export function Features() {
  return (
    <section id="px-features" className="py-20 bg-secondary/10 border-y border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="module-badge mb-3">Enterprise Property Management Suite</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Built for Landlords, Property Managers & Real Estate Funds
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed">
            Replace chaotic spreadsheets and fragmented WhatsApp groups with an institutional-grade property operating system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="p-6 rounded-3xl bg-card border border-border/60 hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/10 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      {f.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-amber-500 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
