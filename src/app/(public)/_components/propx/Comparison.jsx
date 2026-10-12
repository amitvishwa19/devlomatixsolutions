'use client';

import React from "react";
import { Check, X, Sparkles } from "lucide-react";

const rows = [
  {
    feature: "Rent Reminders & Notice Delivery",
    legacy: "Manual phone calls or paper envelopes slid under doors",
    propx: "Automated WhatsApp payment links sent via KonnectX Cloud API",
    highlight: true,
  },
  {
    feature: "Digital Lease & E-Sign",
    legacy: "Printing physical copies, scanning, and filing cabinets",
    propx: "Legally compliant e-Signature links executed in 2 minutes",
    highlight: true,
  },
  {
    feature: "Maintenance & Contractor Routing",
    legacy: "Lost in WhatsApp groups, uncertain contractor pricing",
    propx: "Photo-verified tickets with automated vendor quotes & budget caps",
    highlight: true,
  },
  {
    feature: "Bank Reconciliation",
    legacy: "Manual spreadsheet reconciliation against bank statements",
    propx: "Automated PayFlow sync with instant ledger posting",
    highlight: false,
  },
  {
    feature: "Tenant KYC & Background Screening",
    legacy: "Days of manual employer calls and physical bank statements",
    propx: "5-minute automated credit and eviction verification AI",
    highlight: false,
  },
  {
    feature: "Multi-City Portfolio Visibility",
    legacy: "Siloed local databases or disparate spreadsheets",
    propx: "Unified cloud dashboard with real-time occupancy stacking plans",
    highlight: false,
  },
];

export function Comparison() {
  return (
    <section id="px-comparison" className="py-20 bg-secondary/15 border-y border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="module-badge mb-3">Architectural Comparison</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            How PropX Surpasses Legacy Property Software
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3">
            Legacy desktop property programs isolate data and frustrate tenants. PropX unites the entire asset lifecycle.
          </p>
        </div>

        <div className="max-w-5xl mx-auto overflow-hidden rounded-3xl border border-border/60 bg-card shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="py-4 px-6 font-bold text-foreground w-1/3">Key Capability</th>
                  <th className="py-4 px-6 font-semibold text-muted-foreground w-1/3">Legacy ERPs & Spreadsheets</th>
                  <th className="py-4 px-6 font-extrabold text-amber-500 w-1/3 bg-amber-500/10 border-l border-amber-500/20">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" />
                      PropX Asset Cloud
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {rows.map((r, i) => (
                  <tr key={r.feature} className={i % 2 === 0 ? "bg-card" : "bg-muted/10"}>
                    <td className="py-4 px-6 font-semibold text-foreground">
                      {r.feature}
                    </td>
                    <td className="py-4 px-6 text-muted-foreground flex items-center gap-2">
                      <X className="h-4 w-4 text-rose-500 shrink-0" />
                      <span>{r.legacy}</span>
                    </td>
                    <td className="py-4 px-6 font-medium text-foreground bg-amber-500/5 border-l border-amber-500/20">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 font-bold" />
                        <span>{r.propx}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
