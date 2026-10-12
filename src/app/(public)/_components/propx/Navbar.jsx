'use client';

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Menu, Building2, Key, PhoneCall } from "lucide-react";
import { toast } from "sonner";

const navLinks = [
  { label: "Features", id: "px-features" },
  { label: "Yield & ROI Calculator", id: "px-calculator" },
  { label: "Tenant Experience", id: "px-tenant" },
  { label: "Comparison", id: "px-comparison" },
  { label: "Pricing", id: "px-pricing" },
  { label: "FAQ", id: "px-faq" },
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
          onClick={() => handleNavClick("px-hero")}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-foreground">
                Prop<span className="text-amber-500">X</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Property Cloud
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
              className="text-xs lg:text-sm font-medium text-muted-foreground transition-colors hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer"
            >
              {l.label}
            </button>
          ))}
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            size="sm"
            onClick={() => toast.success("PropX Portfolio Sandbox unlocked! Added sample 40-unit building.")}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-md shadow-amber-500/20 text-xs px-3 sm:px-4 cursor-pointer"
          >
            Launch Portfolio
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
              className="text-left text-sm py-2 text-muted-foreground hover:text-amber-500 transition-colors"
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
