'use client';

import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const plans = [
  {
    name: "Residential Starter",
    price: "$1.50",
    period: "per unit / month (min $49)",
    desc: "Ideal for boutique landlords and residential complexes up to 50 units.",
    features: [
      "Digital lease builder & e-Signatures",
      "Online tenant rent collection (Stripe / UPI)",
      "Maintenance request dispatch portal",
      "Automated PDF rent receipts",
      "Tenant communications log",
    ],
    popular: false,
    cta: "Start Starter Plan"
  },
  {
    name: "Commercial & Multifamily",
    price: "$2.75",
    period: "per unit / month",
    desc: "For commercial towers, mixed-use buildings, and scaling property management firms.",
    features: [
      "Everything in Starter",
      "KonnectX WhatsApp automated rent notices",
      "Visual floor plan & stacking plan vacancy maps",
      "Vendor bidding & contractor maintenance SLA",
      "AI Tenant background credit screening",
      "PayFlow automated accounting reconciliation",
      "Multi-user owner & property manager roles",
    ],
    popular: true,
    cta: "Launch Multifamily Trial"
  },
  {
    name: "Institutional Portfolio",
    price: "$3.95",
    period: "per unit / month",
    desc: "Institutional REITs and multi-city property developers managing 500+ units.",
    features: [
      "Everything in Multifamily",
      "Dedicated multi-tenant database & KMS encryption",
      "Custom CAM expense reconciliation rules",
      "Automated owner dividend wire distribution",
      "Direct ERP integration (SAP, Yardi, RealPage)",
      "Dedicated Real Estate Technology Consultant",
      "99.99% Financial Uptime SLA",
    ],
    popular: false,
    cta: "Contact Enterprise Sales"
  }
];

export function Pricing() {
  return (
    <section id="px-pricing" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="module-badge mb-3">Transparent Unit Pricing</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Plans that Align with Your Real Estate Growth
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3">
            Simple per-unit monthly pricing. No long-term lock-ins, no onboarding hidden charges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`p-8 rounded-3xl flex flex-col justify-between transition-all ${
                p.popular
                  ? "bg-gradient-to-b from-amber-500/10 via-card to-card border-2 border-amber-500 shadow-2xl shadow-amber-500/15 relative scale-105 z-10"
                  : "bg-card border border-border/60 hover:border-amber-500/30"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-500 text-white text-[11px] font-bold uppercase tracking-wider shadow-md">
                  Most Popular for Portfolios
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">{p.name}</h3>
                <p className="text-xs text-muted-foreground mb-6 min-h-[32px]">{p.desc}</p>

                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-border/40">
                  <span className="text-4xl font-black text-foreground">{p.price}</span>
                  <span className="text-xs text-muted-foreground">{p.period}</span>
                </div>

                <div className="space-y-3 mb-8">
                  {p.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 text-xs text-foreground">
                      <Check className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => toast.success(`Selected PropX ${p.name}! Portfolio setup wizard initiated.`)}
                className={`w-full font-bold h-11 rounded-xl cursor-pointer ${
                  p.popular
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/25"
                    : "bg-secondary text-foreground hover:bg-secondary/80 border border-border/60"
                }`}
              >
                {p.cta}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
