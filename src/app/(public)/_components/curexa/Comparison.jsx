'use client';

import React from "react";
import { Check, X } from "lucide-react";

const comparisonRows = [
  {
    feature: "Automated Daily Cloud Backup",
    curexa: true,
    legacy: false,
    generic: "partial"
  },
  {
    feature: "500+ Pathology Templates Pre-loaded",
    curexa: true,
    legacy: "partial",
    generic: false
  },
  {
    feature: "Doctor & Patient Mobile Apps Included",
    curexa: true,
    legacy: false,
    generic: false
  },
  {
    feature: "Zero Local Server Hardware Maintenance",
    curexa: true,
    legacy: false,
    generic: true
  },
  {
    feature: "NABH Audit Trail & Compliance Reports",
    curexa: true,
    legacy: false,
    generic: false
  },
  {
    feature: "Cashless TPA & Insurance Desk Portal",
    curexa: true,
    legacy: "partial",
    generic: false
  },
  {
    feature: "Deployment Time (Under 48 Hours)",
    curexa: true,
    legacy: false,
    generic: false
  }
];

export function Comparison() {
  return (
    <section className="py-20 lg:py-28 bg-secondary/15">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="container mx-auto px-4 md:px-8 pt-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
            The Technology Advantage
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Why Modern Hospitals Are Leaving{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 font-extrabold">
              Legacy Desktop Software
            </span>
          </h2>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            See how Curexa compares against traditional local-server hospital installations and generic non-medical ERPs.
          </p>
        </div>

        <div className="max-w-4xl mx-auto glass-card rounded-2xl border border-border/70 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/70 bg-secondary/40">
                  <th className="py-4 px-6 font-bold text-foreground">Capability / Feature</th>
                  <th className="py-4 px-6 font-extrabold text-emerald-600 dark:text-emerald-400 text-center bg-emerald-500/10">
                    Curexa HMS
                  </th>
                  <th className="py-4 px-6 font-semibold text-muted-foreground text-center">Legacy Desktop HMS</th>
                  <th className="py-4 px-6 font-semibold text-muted-foreground text-center">Generic Business ERP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-foreground">{row.feature}</td>
                    
                    {/* Curexa */}
                    <td className="py-4 px-6 text-center bg-emerald-500/5">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                        <Check className="w-4 h-4" />
                      </div>
                    </td>

                    {/* Legacy */}
                    <td className="py-4 px-6 text-center">
                      {row.legacy === true && (
                        <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                      )}
                      {row.legacy === false && (
                        <X className="w-4 h-4 text-muted-foreground/50 mx-auto" />
                      )}
                      {row.legacy === "partial" && (
                        <span className="text-[11px] font-semibold text-amber-500 uppercase tracking-wider">Partial</span>
                      )}
                    </td>

                    {/* Generic */}
                    <td className="py-4 px-6 text-center">
                      {row.generic === true && (
                        <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                      )}
                      {row.generic === false && (
                        <X className="w-4 h-4 text-muted-foreground/50 mx-auto" />
                      )}
                      {row.generic === "partial" && (
                        <span className="text-[11px] font-semibold text-amber-500 uppercase tracking-wider">Partial</span>
                      )}
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
