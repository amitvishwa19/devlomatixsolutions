'use client';

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const navLinks = [
  { label: "Services", id: "sb-services" },
  { label: "How It Works", id: "sb-how-it-works" },
  { label: "Tech", id: "sb-cleaning-tech" },
  { label: "Why Us", id: "sb-benefits" },
  { label: "Calculator", id: "sb-calculator" },
  { label: "Pricing", id: "sb-pricing" },
  { label: "Gallery", id: "sb-gallery" },
  { label: "Contact", id: "sb-contact" },
];

export function Navbar({ onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("sb-services");

  const handleNavClick = (id) => {
    setActiveLink(id);
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 px-4 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick("sb-hero")}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform shadow-md shadow-amber-500/10">
            <Sun className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-heading text-lg font-bold tracking-tight text-foreground">
              Solar<span className="text-amber-500">Bright</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Clean Energy
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-1 bg-muted/40 rounded-full px-2 py-1 border border-border/50">
          {navLinks.map((link) => {
            const isActive = activeLink === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-amber-500 text-white shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => handleNavClick("sb-calculator")}
            variant="outline"
            className="text-xs font-semibold border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer"
          >
            ROI Estimator
          </Button>

          <Button
            size="sm"
            onClick={() => handleNavClick("sb-contact")}
            className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 cursor-pointer"
          >
            Get a Quote
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

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            className="p-1.5 text-foreground hover:bg-muted rounded-lg"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border/50 px-4 py-4 lg:hidden bg-background"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className="text-left text-sm font-medium text-muted-foreground hover:text-amber-500 py-1.5"
                >
                  {link.label}
                </button>
              ))}
              <div className="mt-3 pt-3 border-t border-border/40 flex flex-col gap-2">
                <Button
                  size="sm"
                  onClick={() => handleNavClick("sb-contact")}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold"
                >
                  Get a Free Quote
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
