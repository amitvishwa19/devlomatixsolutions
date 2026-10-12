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
    <div className="sticky top-0 z-40 w-full border-b px-4">
      <div className="mx-auto flex h-16 glass items-center justify-between px-4 sm:px-6 lg:px-8 rounded-xl">
        {/* Brand */}
        <div
          onClick={() => handleNavClick("kx-hero")}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl transition-transform group-hover:scale-105">
            <Image
              src={konnectXLogo}
              alt="KonnectX Logo"
              width={100}
              height={100}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-foreground leading-none">
              Konnect<span className="text-gradient-sun">X</span>
            </span>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mt-1">
              WhatsApp Platform
            </span>
          </div>
        </div>

        {/* Desktop Links */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((l) => (
            <button
              key={l.id}
              onClick={() => handleNavClick(l.id)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary cursor-pointer"
            >
              {t(l.labelKey)}
            </button>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />

          {/* <Button
            size="sm"
            variant="outline"
            className="border-border/60 hover:bg-muted text-xs font-semibold cursor-pointer"
            onClick={() => handleNavClick("kx-pricing")}
          >
            {t("nav.pricing")}
          </Button> */}

          {/* <Button
            size="sm"
            className="text-xs font-bold text-white shadow-md cursor-pointer"
            style={{ background: "var(--gradient-sun)" }}
            onClick={() => handleNavClick("kx-cta")}
          >
            {t("nav.trial")}
          </Button> */}

          {/* Close Modal Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-secondary/40 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all cursor-pointer"
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
        <div className="glass border-t border-border/50 px-5 py-4 md:hidden">
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
                className="w-full text-white font-bold"
                style={{ background: "var(--gradient-sun)" }}
                onClick={() => handleNavClick("kx-pricing")}
              >
                {t("nav.trial")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
