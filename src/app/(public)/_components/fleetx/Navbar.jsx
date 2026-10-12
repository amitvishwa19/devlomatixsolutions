'use client';

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Menu, Truck, ShieldCheck, PhoneCall } from "lucide-react";
import { toast } from "sonner";

const navLinks = [
  { label: "Features", id: "fx-features" },
  { label: "Telemetry & Fuel Simulator", id: "fx-simulator" },
  { label: "Platform Specs", id: "fx-specs" },
  { label: "Comparison", id: "fx-comparison" },
  { label: "Pricing", id: "fx-pricing" },
  { label: "FAQ", id: "fx-faq" },
];

export function Navbar({ onClose }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (id) => {
    setMobileOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="sticky top-0 z-40 w-full border-b border-border/40 px-4 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div
          onClick={() => handleNavClick("fx-hero")}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-foreground">
                Fleet<span className="text-sky-500">X</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                Logistics OS
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground hidden sm:block">By Devlomatix Solutions</p>
          </div>
        </div>

        {/* Desktop Links */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <button
              key={l.id}
              onClick={() => handleNavClick(l.id)}
              className="text-xs lg:text-sm font-medium text-muted-foreground transition-colors hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer"
            >
              {l.label}
            </button>
          ))}
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            size="sm"
            onClick={() => toast.success("FleetX Dispatch Demo account activated! Contacting logistics engineer.")}
            className="bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white font-semibold shadow-md shadow-sky-500/20 text-xs px-3 sm:px-4 cursor-pointer"
          >
            Launch Dispatch
          </Button>

          {onClose && (
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 rounded-lg border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              title="Close modal"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex md:hidden p-2 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 py-4 px-4 bg-background/95 backdrop-blur-xl flex flex-col gap-3">
          {navLinks.map((l) => (
            <button
              key={l.id}
              onClick={() => handleNavClick(l.id)}
              className="text-left text-sm py-2 text-muted-foreground hover:text-sky-500 transition-colors"
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
