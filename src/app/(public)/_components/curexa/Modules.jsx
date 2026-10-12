'use client';

import React from "react";
import { motion } from "framer-motion";
import {
  Users, Stethoscope, CreditCard, Pill,
  FlaskConical, Database, Sparkles, Check
} from "lucide-react";

const moduleCategories = [
  {
    title: "Patient Administration",
    badge: "Core Workflow",
    color: "emerald",
    icon: Users,
    desc: "Complete patient lifecycle management from queue registration to discharge summary.",
    features: [
      "Fast OPD Registration & Smart Queue",
      "Indoor IPD Admission & Bed Allocation",
      "Automated Follow-up & Allergy Alerts",
      "Digital Discharge Summary & Vitals Log"
    ]
  },
  {
    title: "Pathology & Diagnostics",
    badge: "500+ Reports",
    color: "teal",
    icon: FlaskConical,
    desc: "Comprehensive laboratory information management with barcode integration.",
    features: [
      "500+ Pre-formatted Report Templates",
      "LIS Machine & Analyzer Interfacing",
      "One-Click SMS/WhatsApp Report Delivery",
      "Normal Range Alerts & Doctor Signatures"
    ]
  },
  {
    title: "Doctor Diagnosis & EMR",
    badge: "Clinical Hub",
    color: "cyan",
    icon: Stethoscope,
    desc: "Intuitive doctor consultation dashboard designed for rapid prescription creation.",
    features: [
      "Comprehensive Digital Prescription Builder",
      "Past Medical History & Trend Graphs",
      "ICD-10 Disease Code Categorization",
      "Daily IPD Treatment & Round Notes"
    ]
  },
  {
    title: "Pharmacy & Stock Control",
    badge: "Supply Chain",
    color: "blue",
    icon: Pill,
    desc: "Complete retail & indoor pharmacy tracking with real-time stock deductions.",
    features: [
      "Expiry & Low-Stock Push Alerts",
      "Direct Prescription-to-Dispense Link",
      "Purchase Orders & Vendor Ledger",
      "Batch-Wise Pricing & Generic Substitutes"
    ]
  },
  {
    title: "Billing & TPA Management",
    badge: "Revenue Suite",
    color: "indigo",
    icon: CreditCard,
    desc: "Transparent hospital revenue collection with cashless insurance handling.",
    features: [
      "OPD & IPD Itemized Interim Billing",
      "Cashless TPA / Corporate Claims",
      "User-Wise Cash Counter Reconciliation",
      "Detailed GST Invoices & Payment Gateway"
    ]
  },
  {
    title: "Cloud Backup & Security",
    badge: "Auto Protection",
    color: "amber",
    icon: Database,
    desc: "Automated daily multi-region cloud snapshots with bank-grade encryption.",
    features: [
      "Automated Daily Midnight Snapshots",
      "Role-Based User Access & Permissions",
      "Comprehensive Audit Logs for Compliance",
      "100% Disaster Recovery & Offsite Copies"
    ]
  }
];

export function Modules() {
  return (
    <section id="cx-modules" className="py-20 lg:py-28 bg-secondary/10">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="container mx-auto px-4 md:px-8 pt-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="module-badge mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            15+ Hospital Modules
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Everything Your Hospital Needs,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 font-extrabold">
              In One Unified Platform
            </span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            Eliminate fragmented tools. Curexa connects doctors, nurses, receptionists, lab technicians, and pharmacists seamlessly.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
          {moduleCategories.map((mod, i) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="glass-card rounded-2xl p-7 border border-border/60 hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <mod.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {mod.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">{mod.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">{mod.desc}</p>
              </div>

              <ul className="space-y-2.5 pt-4 border-t border-border/40">
                {mod.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-xs text-foreground/90 font-medium">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
