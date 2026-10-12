'use client';

import React from "react";
import Image from "next/image";
import curexaLogo from "@/assets/images/curexa/curexa-logo.png";
import { ShieldCheck, Heart } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Hospital Modules", id: "cx-modules" },
    { label: "Core Features", id: "cx-features" },
    { label: "ROI Value Calculator", id: "cx-roi" },
    { label: "Subscription Pricing", id: "cx-pricing" },
  ],
  Clinical: [
    { label: "OPD & Patient EMR", id: "cx-modules" },
    { label: "Indoor IPD Admission", id: "cx-modules" },
    { label: "Pathology (500+ Reports)", id: "cx-modules" },
    { label: "Pharmacy Dispense", id: "cx-modules" },
  ],
  Support: [
    { label: "HIPAA & NABH Guide", id: "cx-features" },
    { label: "Data Backup Security", id: "cx-modules" },
    { label: "Frequently Asked Questions", id: "cx-faq" },
    { label: "Book Product Demo", id: "cx-cta" },
  ]
};

export function Footer() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <footer className="border-t border-border/50 bg-secondary/20 pt-14 pb-8">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-4 gap-10 pb-12">
          <div>
            <div
              onClick={() => scrollTo("cx-hero")}
              className="flex items-center gap-3 cursor-pointer select-none group mb-4"
            >
              <div className="relative h-10 w-28 shrink-0 overflow-hidden">
                <Image
                  src={curexaLogo}
                  alt="Curexa HMS Logo"
                  width={112}
                  height={40}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              AI-powered hospital management & electronic medical record platform engineered for clinical precision and data sovereignty.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Part of Devlomatix Ecosystem
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3.5">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => scrollTo(link.id)}
                      className="text-xs text-muted-foreground hover:text-emerald-500 transition-colors text-left cursor-pointer"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-3">
          <p>© {new Date().getFullYear()} Curexa HMS by Devlomatix Solutions. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> for healthcare heroes
          </p>
        </div>
      </div>
    </footer>
  );
}
