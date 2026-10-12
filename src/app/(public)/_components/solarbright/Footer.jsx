'use client';

import React from "react";
import { Sun, ShieldCheck } from "lucide-react";

export function Footer() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <footer className="border-t border-border/50 py-16 bg-muted/10 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid sm:grid-cols-3 gap-10 max-w-5xl mx-auto">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
                <Sun className="h-4.5 w-4.5" />
              </div>
              <span className="font-heading text-lg font-bold text-foreground">
                Solar<span className="text-amber-500">Bright</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              India&apos;s trusted solar panel cleaning and generation optimization platform. Serving residential, commercial, and utility arrays across 50+ cities.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Devlomatix Clean Energy Venture
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-foreground text-xs uppercase tracking-wider mb-4">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { label: "Services", id: "sb-services" },
                { label: "How It Works", id: "sb-how-it-works" },
                { label: "Automated Tech", id: "sb-cleaning-tech" },
                { label: "Advantages", id: "sb-benefits" },
                { label: "Savings Calculator", id: "sb-calculator" },
                { label: "Pricing Plans", id: "sb-pricing" },
                { label: "Field Gallery", id: "sb-gallery" },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollTo(link.id)}
                    className="text-muted-foreground hover:text-amber-500 transition-colors cursor-pointer text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-bold text-foreground text-xs uppercase tracking-wider mb-4">
              Helpline & Support
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>📞 Direct: +91 98765 43210</li>
              <li>💬 WhatsApp: +91 98765 43210</li>
              <li>✉️ Email: solarbright@devlomatix.com</li>
              <li>📍 Service Centers: Jaipur, Ahmedabad, NCR, Chennai</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground max-w-5xl mx-auto">
          <p>© {new Date().getFullYear()} SolarBright Technologies. All rights reserved.</p>
          <p>Powered by Devlomatix Unified Digital Architecture</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
