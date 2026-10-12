'use client';

import React from "react";
import { Check, X, Sparkles } from "lucide-react";

const rows = [
  {
    feature: "Dynamic AI Route Re-optimization",
    legacy: "Static waypoint routing or basic Google Maps",
    fleetx: "Autonomous recalculation based on live road conditions & axle load",
    highlight: true,
  },
  {
    feature: "Fuel Siphon & Drain Detection",
    legacy: "Only manual fuel receipt reconciliation",
    fleetx: "Direct CAN-Bus float sensor telemetry with milliliter precision",
    highlight: true,
  },
  {
    feature: "Customer Delivery Tracking",
    legacy: "Requires downloading third-party tracking apps",
    fleetx: "Automated instant WhatsApp live tracking links via KonnectX",
    highlight: true,
  },
  {
    feature: "e-Way Bill & Tax Sync",
    legacy: "Manual upload to government portals",
    fleetx: "Automated API sync with QR barcode manifest generation",
    highlight: false,
  },
  {
    feature: "Driver Fatigue & Behavior AI",
    legacy: "Rudimentary over-speed alerts only",
    fleetx: "Continuous scoring of harsh brakes, acceleration & cornering g-force",
    highlight: false,
  },
  {
    feature: "Remote Engine Immobilization",
    legacy: "Rare or requires high-end hardware upgrade",
    fleetx: "Built-in geofence perimeter breach auto-lockout protocol",
    highlight: false,
  },
];

export function Comparison() {
  return (
    <section id="fx-comparison" className="py-20 bg-secondary/15 border-y border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="module-badge mb-3">Architectural Advantage</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            How FleetX Outperforms Legacy GPS Trackers
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3">
            Traditional black-box GPS hardware only shows dots on a map. FleetX is an intelligent decision engine.
          </p>
        </div>

        <div className="max-w-5xl mx-auto overflow-hidden rounded-3xl border border-border/60 bg-card shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="py-4 px-6 font-bold text-foreground w-1/3">Core Capability</th>
                  <th className="py-4 px-6 font-semibold text-muted-foreground w-1/3">Legacy GPS / OBD Devices</th>
                  <th className="py-4 px-6 font-extrabold text-sky-500 w-1/3 bg-sky-500/10 border-l border-sky-500/20">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" />
                      FleetX Cloud OS
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
                    <td className="py-4 px-6 font-medium text-foreground bg-sky-500/5 border-l border-sky-500/20">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 font-bold" />
                        <span>{r.fleetx}</span>
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
