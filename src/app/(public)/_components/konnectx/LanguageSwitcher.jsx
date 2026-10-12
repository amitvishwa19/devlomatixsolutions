'use client';

import React, { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useLanguage, languageNames } from "./use-language";
import { motion, AnimatePresence } from "framer-motion";

const languages = ["en", "hi", "gu"];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 items-center gap-1.5 rounded-lg border border-border/50 bg-secondary/30 px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary/60 cursor-pointer"
        aria-label="Change language"
      >
        <Globe className="h-3.5 w-3.5 text-primary" />
        <span className="uppercase tracking-wider font-semibold">{language}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1.5 min-w-[130px] overflow-hidden rounded-xl border border-border/80 bg-popover/95 p-1 shadow-xl backdrop-blur-md z-50"
          >
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors hover:bg-primary/10 cursor-pointer ${
                  language === lang ? "text-primary font-bold bg-primary/10" : "text-foreground"
                }`}
              >
                <span>{languageNames[lang]}</span>
                {language === lang && <Check className="h-3 w-3 text-primary" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
