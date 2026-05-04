"use client"
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const CurrencyContext = createContext(undefined);

export const CURRENCIES = {
  INR: { code: "INR", symbol: "₹", rate: 1, label: "India (₹)", flag: "🇮🇳" },
  USD: { code: "USD", symbol: "$", rate: 0.012, label: "USA ($)", flag: "🇺🇸" },
  EUR: { code: "EUR", symbol: "€", rate: 0.011, label: "Europe (€)", flag: "🇪🇺" },
  GBP: { code: "GBP", symbol: "£", rate: 0.0094, label: "UK (£)", flag: "🇬🇧" },
  AED: { code: "AED", symbol: "AED ", rate: 0.044, label: "UAE (AED)", flag: "🇦🇪" },
};

const KEY = "crystalaura_currency";

export const CurrencyProvider = ({ children }) => {
  const [code, setCode] = useState("INR");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored && CURRENCIES[stored]) {
        setCode(stored);
      }
    } catch {}
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      try { localStorage.setItem(KEY, code); } catch {}
    }
  }, [code, mounted]);

  const currency = CURRENCIES[code] || CURRENCIES.INR;

  const format = useCallback((inrAmount) => {
    const v = inrAmount * currency.rate;
    if (currency.code === "INR") return `${currency.symbol}${Math.round(v).toLocaleString("en-IN")}`;
    return `${currency.symbol}${v.toFixed(2)}`;
  }, [currency]);

  if (!mounted) {
    return (
      <CurrencyContext.Provider value={{ currency: CURRENCIES.INR, code: "INR", setCode: () => {}, format: (v) => `₹${v}`, currencies: CURRENCIES }}>
        {children}
      </CurrencyContext.Provider>
    );
  }

  return (
    <CurrencyContext.Provider value={{ currency, code, setCode, format, currencies: CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};