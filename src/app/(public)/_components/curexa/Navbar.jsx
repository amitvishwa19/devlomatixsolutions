'use client';

import React, { useState } from "react";
import Image from "next/image";
import curexaLogo from "@/assets/images/curexa/curexa-logo.png";
import { Button } from "@/components/ui/button";
import { X, Menu, Calendar } from "lucide-react";

const navLinks = [
  { label: "Modules", id: "cx-modules" },
  { label: "Features", id: "cx-features" },
  { label: "Tour", id: "cx-tour" },
  { label: "ROI Calculator", id: "cx-roi" },
  { label: "Pricing", id: "cx-pricing" },
  { label: "FAQ", id: "cx-faq" },
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
          onClick={() => handleNavClick("cx-hero")}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="relative h-10 w-28 shrink-0 overflow-hidden transition-transform group-hover:scale-105">
            <Image
              src={curexaLogo}
              alt="Curexa HMS Logo"
              width={112}
              height={40}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <span className="hidden sm:inline-block text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Hospital ERP
          </span>
        </div>

        {/* Desktop Links */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <button
              key={l.id}
              onClick={() => handleNavClick(l.id)}
              className="text-xs lg:text-sm font-medium text-muted-foreground transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
            >
              {l.label}
            </button>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Button
            size="sm"
            onClick={() => handleNavClick("cx-roi")}
            variant="outline"
            className="text-xs font-semibold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
          >
            Calculate ROI
          </Button>

          <Button
            size="sm"
            onClick={() => handleNavClick("cx-cta")}
            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            Book Demo
          </Button>

          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all cursor-pointer"
              title="Close modal"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            className="p-1.5 text-foreground hover:bg-muted rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg border border-border/40"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-border/50 px-4 py-4 md:hidden bg-background">
          <div className="flex flex-col gap-2.5">
            {navLinks.map((l) => (
              <button
                key={l.id}
                onClick={() => handleNavClick(l.id)}
                className="text-left text-sm font-medium text-muted-foreground hover:text-emerald-500 py-1.5"
              >
                {l.label}
              </button>
            ))}
            <div className="mt-3 pt-3 border-t border-border/40 flex flex-col gap-2">
              <Button
                size="sm"
                onClick={() => handleNavClick("cx-cta")}
                className="w-full bg-emerald-600 text-white font-bold"
              >
                Book Live Demo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
