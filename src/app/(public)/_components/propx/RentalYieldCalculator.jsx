'use client';

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  DollarSign, 
  Clock, 
  Sparkles, 
  Sliders, 
  ArrowRight,
  TrendingUp,
  Percent,
  CheckCircle2,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";

export function RentalYieldCalculator() {
  const [totalUnits, setTotalUnits] = useState(24);
  const [avgRent, setAvgRent] = useState(2400); // USD / mo
  const [assetValuation, setAssetValuation] = useState(5500000); // 5.5M asset
  const [enableWhatsAppReminders, setEnableWhatsAppReminders] = useState(true);
  const [enablePreventiveMaintenance, setEnablePreventiveMaintenance] = useState(true);

  const stats = useMemo(() => {
    const grossMonthly = totalUnits * avgRent;
    const grossAnnual = grossMonthly * 12;

    // Normal vacancy leakage ~ 6%
    let vacancyLossRate = 0.06;
    if (enableWhatsAppReminders) vacancyLossRate -= 0.025; // 2.5% faster turnover & timely collection

    // Maintenance & ops leakage ~ 12%
    let opexRate = 0.12;
    if (enablePreventiveMaintenance) opexRate -= 0.035; // 3.5% saved through contractor pre-negotiations

    const effectiveAnnualIncome = grossAnnual * (1 - vacancyLossRate);
    const netOperatingIncome = effectiveAnnualIncome * (1 - opexRate);
    const capRate = ((netOperatingIncome / assetValuation) * 100).toFixed(2);

    const annualDollarsRecovered = Math.round(grossAnnual * (0.025 + 0.035));
    const hoursSavedMonthly = Math.round(totalUnits * 2.8);

    return {
      grossMonthly: grossMonthly.toLocaleString(),
      grossAnnual: grossAnnual.toLocaleString(),
      netOperatingIncome: Math.round(netOperatingIncome).toLocaleString(),
      capRate,
      annualDollarsRecovered: annualDollarsRecovered.toLocaleString(),
      hoursSavedMonthly
    };
  }, [totalUnits, avgRent, assetValuation, enableWhatsAppReminders, enablePreventiveMaintenance]);

  return (
    <section id="px-calculator" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="module-badge mb-3">Institutional Financial Engine</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Calculate Net Yield & Unlocked Portfolio Cash Flow
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3">
            Simulate your portfolio's Cap Rate, occupancy recovery, and administrative time savings with PropX automation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-card border border-border/60 shadow-lg">
            <h3 className="text-base font-bold text-foreground mb-6 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-amber-500" />
              Adjust Portfolio Real Estate Metrics
            </h3>

            {/* Slider 1: Total Units */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-semibold text-foreground mb-2">
                <span>Managed Residential & Commercial Units</span>
                <span className="text-amber-500 font-bold">{totalUnits} Units</span>
              </div>
              <input
                type="range"
                min="4"
                max="150"
                step="2"
                value={totalUnits}
                onChange={(e) => setTotalUnits(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>4</span>
                <span>75</span>
                <span>150</span>
              </div>
            </div>

            {/* Slider 2: Average Rent per Unit */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-semibold text-foreground mb-2">
                <span>Avg. Monthly Rent per Unit ($ USD)</span>
                <span className="text-amber-500 font-bold">${avgRent.toLocaleString()} /mo</span>
              </div>
              <input
                type="range"
                min="800"
                max="6000"
                step="100"
                value={avgRent}
                onChange={(e) => setAvgRent(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>$800</span>
                <span>$3,400</span>
                <span>$6,000</span>
              </div>
            </div>

            {/* Slider 3: Portfolio Asset Value */}
            <div className="mb-8">
              <div className="flex justify-between text-xs font-semibold text-foreground mb-2">
                <span>Total Portfolio Asset Valuation ($ USD)</span>
                <span className="text-amber-500 font-bold">${(assetValuation / 1000000).toFixed(1)} Million</span>
              </div>
              <input
                type="range"
                min="500000"
                max="20000000"
                step="500000"
                value={assetValuation}
                onChange={(e) => setAssetValuation(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-4 border-t border-border/40">
              <label className="flex items-center justify-between text-xs font-medium text-foreground cursor-pointer p-2.5 rounded-xl hover:bg-secondary/40 transition-colors">
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-amber-500" />
                  KonnectX Automated WhatsApp Reminders (+2.5% On-Time Cash)
                </span>
                <input
                  type="checkbox"
                  checked={enableWhatsAppReminders}
                  onChange={(e) => setEnableWhatsAppReminders(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4 accent-amber-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs font-medium text-foreground cursor-pointer p-2.5 rounded-xl hover:bg-secondary/40 transition-colors">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  Preventive Maintenance & Contractor Cap (+3.5% OpEx Savings)
                </span>
                <input
                  type="checkbox"
                  checked={enablePreventiveMaintenance}
                  onChange={(e) => setEnablePreventiveMaintenance(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4 accent-amber-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/30 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
              <span className="text-xs uppercase font-bold tracking-wider text-amber-500">
                Institutional Yield Projections
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                Cap Rate: {stats.capRate}%
              </span>
            </div>

            <div className="mb-8">
              <div className="text-xs text-muted-foreground mb-1">Projected Net Operating Income (NOI)</div>
              <div className="text-4xl sm:text-5xl font-black text-foreground tracking-tight text-gradient-propx">
                ${stats.netOperatingIncome}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From ${stats.grossAnnual} gross annual potential rent across {totalUnits} active units.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-card border border-border/40">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Annual Cash Recovered</span>
                </div>
                <div className="text-xl font-bold text-foreground">
                  +${stats.annualDollarsRecovered} <span className="text-xs font-normal text-muted-foreground">/yr</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/40">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <span>Admin Hours Saved</span>
                </div>
                <div className="text-xl font-bold text-foreground">
                  {stats.hoursSavedMonthly} <span className="text-xs font-normal text-muted-foreground">hrs/mo</span>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => toast.success(`Generated PropX Yield Audit for ${totalUnits} units. Ready to download!`)}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Export Institutional Pro-Forma Audit
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
