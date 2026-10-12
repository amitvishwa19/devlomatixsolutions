'use client';

import React from "react";
import { Truck, ShieldCheck, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/20 py-12 text-xs text-muted-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-black text-sm">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-foreground text-sm">FleetX Autonomous Fleet OS</span>
              <p className="text-[11px] text-muted-foreground">A Devlomatix Solutions Portfolio Venture</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <span className="flex items-center gap-1.5 text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              99.98% Telematics Uptime SLA
            </span>
            <span className="flex items-center gap-1.5 text-foreground">
              <Mail className="h-4 w-4 text-sky-500" />
              fleetx@devlomatix.com
            </span>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} FleetX by Devlomatix Solutions. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="/ventures" className="hover:text-foreground transition-colors">All Devlomatix Ventures</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
