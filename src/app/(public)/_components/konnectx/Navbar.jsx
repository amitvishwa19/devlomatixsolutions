'use client';

import React, { useState } from "react";
import Image from "next/image";
import konnectXLogo from "@/assets/images/konnectx/konnectX.png";
import { Button } from "@/components/ui/button";
import { X, Menu } from "lucide-react";
import { useLanguage } from "./use-language";
import { LanguageSwitcher } from "./LanguageSwitcher";

const navLinks = [
  { labelKey: "nav.features", id: "kx-features" },
  { labelKey: "nav.industries", id: "kx-industries" },
  { labelKey: "nav.pricing", id: "kx-pricing" },
  { labelKey: "nav.testimonials", id: "kx-testimonials" },
  { labelKey: "nav.faq", id: "kx-faq" },
];

export function Navbar({ onClose }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();

  const handleNavClick = (id) => {
    setMobileOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 px-4 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div
          onClick={() => handleNavClick("kx-hero")}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="relative h-10 w-11 shrink-0 overflow-hidden transition-transform group-hover:scale-105">
            <Image
              src={konnectXLogo}
              alt="KonnectX Logo"
              width={44}
              height={36}
              className="h-full w-full object-contain drop-shadow-sm"
              priority
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-heading text-lg font-bold tracking-tight text-foreground">
              Konnect<span className="text-gradient-sun font-extrabold">X</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              Cloud API
            </span>
          </div>
        </div>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-muted/40 rounded-full px-2 py-1 border border-border/50">
          {navLinks.map((l) => (
            <button
              key={l.id}
              onClick={() => handleNavClick(l.id)}
              className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground rounded-full transition-colors cursor-pointer"
            >
              {t(l.labelKey)}
            </button>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />

          <Button
            size="sm"
            variant="outline"
            className="text-xs font-semibold border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 cursor-pointer"
            onClick={() => handleNavClick("kx-pricing")}
          >
            {t("nav.pricing")}
          </Button>

          <Button
            size="sm"
            className="text-xs font-bold text-white shadow-md shadow-cyan-500/20 cursor-pointer"
            style={{ background: "var(--gradient-sun)" }}
            onClick={() => handleNavClick("kx-cta")}
          >
            {t("nav.trial")}
          </Button>

          {/* Close Modal Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-secondary/40 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all cursor-pointer"
              title="Close KonnectX View"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />

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
        <div className="bg-background/95 backdrop-blur-xl border-t border-border/50 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((l) => (
              <button
                key={l.id}
                onClick={() => handleNavClick(l.id)}
                className="text-left text-sm font-medium text-muted-foreground hover:text-primary py-1"
              >
                {t(l.labelKey)}
              </button>
            ))}
            <div className="mt-3 pt-3 border-t border-border/40 flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs font-semibold"
                onClick={() => handleNavClick("kx-pricing")}
              >
                {t("nav.pricing")}
              </Button>
              <Button
                size="sm"
                className="w-full text-white font-bold"
                style={{ background: "var(--gradient-sun)" }}
                onClick={() => handleNavClick("kx-cta")}
              >
                {t("nav.trial")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
