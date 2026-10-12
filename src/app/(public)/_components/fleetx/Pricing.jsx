'use client';

import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const plans = [
  {
    name: "Fleet Starter",
    price: "$29",
    period: "per vehicle / month",
    desc: "For local intra-city delivery operations needing reliable live telemetry.",
    features: [
      "Real-time GPS tracking (10s refresh)",
      "Polygonal geofencing & speed alerts",
      "Driver hours of service log",
      "Trip history & replay (30 days)",
      "Basic email dispatch summaries",
    ],
    popular: false,
    cta: "Start Starter Plan"
  },
  {
    name: "Fleet Pro",
    price: "$49",
    period: "per vehicle / month",
    desc: "Full autonomy for regional and interstate freight & logistics fleets.",
    features: [
      "Everything in Starter",
      "AI Dynamic Route Optimizer",
      "CAN-Bus fuel float & siphon detector",
      "KonnectX WhatsApp live customer tracking",
      "Automated e-Way bill & manifest sync",
      "Driver safety leaderboard & scorecards",
      "Trip replay (1 year cloud history)",
    ],
    popular: true,
    cta: "Launch Pro Trial"
  },
  {
    name: "Enterprise Freight",
    price: "$89",
    period: "per vehicle / month",
    desc: "Dedicated infrastructure, hardware firmware customization, and SAP integration.",
    features: [
      "Everything in Fleet Pro",
      "Dedicated multi-tenant database & KMS",
      "Direct SAP / Oracle ERP webhook bridge",
      "Automated remote engine immobilizer",
      "Custom CAN-bus sensors (temperature & cold chain)",
      "Dedicated Logistics Solution Architect",
      "99.99% Hardware & Cloud SLA",
    ],
    popular: false,
    cta: "Contact Enterprise Sales"
  }
];

export function Pricing() {
  return (
    <section id="fx-pricing" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="module-badge mb-3">Transparent Commercial Pricing</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Predictable Plans that Scale with Your Fleet
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3">
            Hardware-agnostic software. Deploy on our certified plug-and-play OBD-II telematics or your existing sensors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`p-8 rounded-3xl flex flex-col justify-between transition-all ${
                p.popular
                  ? "bg-gradient-to-b from-sky-500/10 via-card to-card border-2 border-sky-500 shadow-2xl shadow-sky-500/15 relative scale-105 z-10"
                  : "bg-card border border-border/60 hover:border-sky-500/30"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-sky-500 text-white text-[11px] font-bold uppercase tracking-wider shadow-md">
                  Most Popular for Fleets
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
                      <Check className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => toast.success(`Selected FleetX ${p.name}! Dispatching onboarding sequence.`)}
                className={`w-full font-bold h-11 rounded-xl cursor-pointer ${
                  p.popular
                    ? "bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white shadow-lg shadow-sky-500/25"
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
