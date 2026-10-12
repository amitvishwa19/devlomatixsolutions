'use client';

import React from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const pricingPlans = [
  {
    name: "Essential",
    description: "Best for standalone clinics and outpatient practices",
    price: "₹999",
    period: "/Month",
    popular: false,
    features: [
      "Digital Patient Appointments",
      "OPD Case Registration & Queue",
      "Doctor Digital Prescription Builder",
      "Itemized Billing & Instant Receipts",
      "SMS & Email Appointment Reminders",
      "Daily Cash Counter Summary",
      "Secure Cloud Patient Directory"
    ],
    cta: "Start Free Trial"
  },
  {
    name: "Professional",
    description: "Ideal for growing hospitals and nursing homes (10-100 beds)",
    price: "₹1,499",
    period: "/Month",
    popular: true,
    badge: "Most Popular For Hospitals",
    features: [
      "Everything in Essential tier",
      "Indoor IPD Admission & Bed Allocation",
      "500+ Pre-built Pathology Templates",
      "Laboratory Information System (LIS)",
      "Pharmacy Dispense & Expiry Alerts",
      "Doctor & Nurse Mobile Access App",
      "Daily Automated Midnight Cloud Backup",
      "Discharge Summary & Vitals Log"
    ],
    cta: "Start 14-Day Free Trial"
  },
  {
    name: "Enterprise",
    description: "Designed for multi-specialty facilities & hospital networks",
    price: "₹2,499",
    period: "/Month",
    popular: false,
    badge: "Full Healthcare ERP",
    features: [
      "Everything in Professional tier",
      "Cashless TPA & Insurance Desk Portal",
      "Multi-Branch Centralized Dashboard",
      "Bio-medical Waste & Equipment Logs",
      "Role-Based User Rights & Audit Logs",
      "Direct Medical Analyzer Interfacing",
      "Dedicated Onboarding & Data Migration",
      "Guaranteed 2-Hour Response SLA"
    ],
    cta: "Contact Enterprise Sales"
  }
];

export function Pricing() {
  const handleSelectPlan = (name) => {
    toast.success(`You selected Curexa ${name} tier! Our healthcare specialist will activate your demo.`);
    const cta = document.getElementById("cx-cta");
    if (cta) cta.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="cx-pricing" className="py-20 lg:py-28 bg-background">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="container mx-auto px-4 md:px-8 pt-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="module-badge mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Clear, Transparent Investment
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Simple, Affordable Pricing for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 font-extrabold">
              Healthcare Facilities
            </span>
          </h2>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            No massive upfront software license fees. Predictable monthly pricing that scales with your hospital capacity.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {pricingPlans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                plan.popular
                  ? "glass-card ring-2 ring-emerald-500 shadow-2xl scale-[1.02] bg-card"
                  : "glass-card border border-border/70 hover:border-emerald-500/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold text-white bg-emerald-600 shadow-md flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  {plan.badge}
                </div>
              )}

              <div>
                <h3 className="text-2xl font-bold text-foreground mb-1">{plan.name}</h3>
                <p className="text-xs text-muted-foreground min-h-[32px]">{plan.description}</p>

                <div className="mt-6 flex items-baseline gap-1.5 pb-6 border-b border-border/40">
                  <span className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {plan.price}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">{plan.period}</span>
                </div>

                <ul className="space-y-3 pt-6 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-xs text-foreground/90 font-medium">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => handleSelectPlan(plan.name)}
                className={`w-full font-bold h-11 text-sm rounded-xl cursor-pointer ${
                  plan.popular
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                    : "border-border hover:bg-muted"
                }`}
                variant={plan.popular ? "default" : "outline"}
              >
                <span>{plan.cta}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
