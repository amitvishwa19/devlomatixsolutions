'use client';

import React from "react";

const marqueeLogos = [
  "TechCorp",
  "ScaleUp",
  "GlobalFin",
  "StartupLab",
  "MegaHire",
  "CloudTech",
  "InnovateCo",
  "DataDriven",
  "HyperGrowth",
  "FutureWorks",
];

export function Marquee() {
  return (
    <section className="py-10 border-y border-border/40 overflow-hidden bg-secondary/15">
      <div className="container mx-auto px-4 text-center mb-6">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
          Trusted by talent acquisition teams at leading companies
        </p>
      </div>

      <div className="relative overflow-hidden w-full flex">
        <div className="flex animate-marquee gap-14 whitespace-nowrap">
          {[...marqueeLogos, ...marqueeLogos].map((name, i) => (
            <span
              key={i}
              className="text-lg sm:text-xl font-heading font-bold text-muted-foreground/50 hover:text-indigo-400 transition-colors select-none"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Marquee;
