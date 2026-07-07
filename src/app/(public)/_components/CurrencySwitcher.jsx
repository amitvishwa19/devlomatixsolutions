"use client"
import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useCurrency } from "../_contexts/CurrencyContext";

const CurrencySwitcher = () => {
  const { currency, setCode, currencies } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-border hover:border-gold/40"
        aria-label="Change currency"
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="font-medium">{currency.code}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-card border border-border rounded-lg shadow-xl py-1 z-50">
          {Object.values(currencies).map((c) => (
            <button
              key={c.code}
              onClick={() => { setCode(c.code); setOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-secondary transition-colors"
            >
              <span className="flex items-center gap-2">
                <span>{c.flag}</span>
                <span>{c.label}</span>
              </span>
              {currency.code === c.code && <Check className="w-3.5 h-3.5 text-gold" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencySwitcher;
