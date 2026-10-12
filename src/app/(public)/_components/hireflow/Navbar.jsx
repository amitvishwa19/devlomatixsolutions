'use client';

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, Menu, X, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const navLinks = [
  { label: "Features", id: "hf-features" },
  { label: "Pipeline", id: "hf-pipeline" },
  { label: "How It Works", id: "hf-how-it-works" },
  { label: "Compare", id: "hf-comparison" },
  { label: "Integrations", id: "hf-integrations" },
  { label: "Pricing", id: "hf-pricing" },
  { label: "FAQ", id: "hf-faq" },
];

export function Navbar({ onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("hf-features");

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
        {/* Brand */}
        <div
          onClick={() => handleNavClick("hf-hero")}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 group-hover:scale-105 transition-transform shadow-md shadow-indigo-500/10">
            <Briefcase className="h-4.5 w-4.5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-heading text-lg font-bold tracking-tight text-foreground">
              Hire<span className="text-indigo-400">Flow</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              Modern ATS
            </span>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-1 bg-muted/40 rounded-full px-2 py-1 border border-border/50">
          {navLinks.map((link) => {
            const isActive = activeLink === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm font-semibold"
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
            onClick={() => handleNavClick("hf-pipeline")}
            variant="outline"
            className="text-xs font-semibold border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 cursor-pointer"
          >
            Live Pipeline
          </Button>

          <Button
            size="sm"
            onClick={() => handleNavClick("hf-pricing")}
            className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            Start Free Trial
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
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

        {/* Mobile menu button */}
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
                  className="text-left text-sm font-medium text-muted-foreground hover:text-indigo-400 py-1.5"
                >
                  {link.label}
                </button>
              ))}
              <div className="mt-3 pt-3 border-t border-border/40 flex flex-col gap-2">
                <Button
                  size="sm"
                  onClick={() => handleNavClick("hf-pricing")}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Start 14-Day Free Trial
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
