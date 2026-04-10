import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useLanguage, languageNames, type Language } from "@/hooks/use-language";
import { motion, AnimatePresence } from "framer-motion";

const languages: Language[] = ["en", "hi", "gu"];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
        aria-label="Change language"
      >
        <Globe className="h-4 w-4" />
        <span className="text-xs font-medium uppercase">{language}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 min-w-[120px] overflow-hidden rounded-lg border border-border bg-popover shadow-lg"
          >
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => { setLanguage(lang); setOpen(false); }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted ${
                  language === lang ? "text-primary font-semibold" : "text-foreground"
                }`}
              >
                {languageNames[lang]}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
