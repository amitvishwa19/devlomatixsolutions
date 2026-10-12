'use client';

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  Fuel, 
  DollarSign, 
  Clock, 
  Leaf, 
  Sparkles, 
  Sliders, 
  Truck,
  ArrowRight,
  TrendingUp,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";

export function FleetTelemetrySimulator() {
  const [fleetSize, setFleetSize] = useState(35);
  const [monthlyKm, setMonthlyKm] = useState(6500);
  const [fuelCostPerLiter, setFuelCostPerLiter] = useState(1.15); // USD / equivalent
  const [enableAiRerouting, setEnableAiRerouting] = useState(true);
  const [enableSiphonGuard, setEnableSiphonGuard] = useState(true);
  const [enableWhatsAppAlerts, setEnableWhatsAppAlerts] = useState(true);

  // Calculations
  const stats = useMemo(() => {
    // Average diesel efficiency: 3.8 km/liter
    const kmPerLiter = 3.8;
    const totalKm = fleetSize * monthlyKm;
    const baselineLiters = totalKm / kmPerLiter;
    const baselineMonthlyFuelBill = baselineLiters * fuelCostPerLiter;

    // Efficiency gains
    let savingsPercent = 0.08; // baseline telematics
    if (enableAiRerouting) savingsPercent += 0.14; // 14% from route optimization
    if (enableSiphonGuard) savingsPercent += 0.07; // 7% from theft & idling elimination

    const monthlySavedDollars = baselineMonthlyFuelBill * savingsPercent;
    const annualSavedDollars = monthlySavedDollars * 12;

    // Time savings: approx 18 mins per 500 km saved
    const monthlyHoursSaved = Math.round((totalKm / 500) * 0.35);

    // Carbon reduction: ~2.68 kg CO2 per liter diesel saved
    const litersSavedMonthly = baselineLiters * savingsPercent;
    const co2SavedTonnesAnnual = ((litersSavedMonthly * 2.68 * 12) / 1000).toFixed(1);

    return {
      totalMonthlyKm: totalKm.toLocaleString(),
      monthlySavedDollars: Math.round(monthlySavedDollars).toLocaleString(),
      annualSavedDollars: Math.round(annualSavedDollars).toLocaleString(),
      monthlyHoursSaved: monthlyHoursSaved.toLocaleString(),
      co2SavedTonnesAnnual,
      savingsPercent: Math.round(savingsPercent * 100)
    };
  }, [fleetSize, monthlyKm, fuelCostPerLiter, enableAiRerouting, enableSiphonGuard]);

  return (
    <section id="fx-simulator" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="module-badge mb-3">Live ROI & Fuel Analytics</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Calculate Your Fleet's Projected Annual Savings
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3">
            Simulate fuel cost reductions, transit time savings, and carbon offset by applying FleetX algorithms.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-card border border-border/60 shadow-lg">
            <h3 className="text-base font-bold text-foreground mb-6 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-sky-500" />
              Adjust Fleet Operating Parameters
            </h3>

            {/* Slider 1: Fleet Size */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-semibold text-foreground mb-2">
                <span>Fleet Size (Vehicles)</span>
                <span className="text-sky-500 font-bold">{fleetSize} Rigs</span>
              </div>
              <input
                type="range"
                min="5"
                max="300"
                step="5"
                value={fleetSize}
                onChange={(e) => setFleetSize(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>5</span>
                <span>150</span>
                <span>300</span>
              </div>
            </div>

            {/* Slider 2: Monthly Distance per Rig */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-semibold text-foreground mb-2">
                <span>Avg. Monthly Km per Vehicle</span>
                <span className="text-sky-500 font-bold">{monthlyKm.toLocaleString()} km</span>
              </div>
              <input
                type="range"
                min="2000"
                max="15000"
                step="500"
                value={monthlyKm}
                onChange={(e) => setMonthlyKm(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>2,000 km</span>
                <span>8,000 km</span>
                <span>15,000 km</span>
              </div>
            </div>

            {/* Slider 3: Fuel Price */}
            <div className="mb-8">
              <div className="flex justify-between text-xs font-semibold text-foreground mb-2">
                <span>Fuel Cost / Liter ($ USD)</span>
                <span className="text-sky-500 font-bold">${fuelCostPerLiter.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.80"
                max="2.50"
                step="0.05"
                value={fuelCostPerLiter}
                onChange={(e) => setFuelCostPerLiter(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Feature Toggles */}
            <div className="space-y-3 pt-4 border-t border-border/40">
              <label className="flex items-center justify-between text-xs font-medium text-foreground cursor-pointer p-2.5 rounded-xl hover:bg-secondary/40 transition-colors">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-sky-500" />
                  Enable AI Dynamic Route Optimizer (+14% Fuel Efficiency)
                </span>
                <input
                  type="checkbox"
                  checked={enableAiRerouting}
                  onChange={(e) => setEnableAiRerouting(e.target.checked)}
                  className="rounded text-sky-500 focus:ring-sky-500 h-4 w-4 accent-sky-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs font-medium text-foreground cursor-pointer p-2.5 rounded-xl hover:bg-secondary/40 transition-colors">
                <span className="flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-cyan-500" />
                  CAN-Bus Fuel Theft & Idling Guard (+7% Savings)
                </span>
                <input
                  type="checkbox"
                  checked={enableSiphonGuard}
                  onChange={(e) => setEnableSiphonGuard(e.target.checked)}
                  className="rounded text-sky-500 focus:ring-sky-500 h-4 w-4 accent-sky-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs font-medium text-foreground cursor-pointer p-2.5 rounded-xl hover:bg-secondary/40 transition-colors">
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-emerald-500" />
                  KonnectX WhatsApp Automated Delivery Alerts
                </span>
                <input
                  type="checkbox"
                  checked={enableWhatsAppAlerts}
                  onChange={(e) => setEnableWhatsAppAlerts(e.target.checked)}
                  className="rounded text-sky-500 focus:ring-sky-500 h-4 w-4 accent-sky-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-sky-500/10 via-cyan-500/5 to-transparent border border-sky-500/30 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
              <span className="text-xs uppercase font-bold tracking-wider text-sky-500">
                Projected Net Savings
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                {stats.savingsPercent}% Total Cost Reduction
              </span>
            </div>

            <div className="mb-8">
              <div className="text-xs text-muted-foreground mb-1">Estimated Annual Operating Savings</div>
              <div className="text-4xl sm:text-5xl font-black text-foreground tracking-tight text-gradient-fleetx">
                ${stats.annualSavedDollars}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Estimated ${stats.monthlySavedDollars} saved monthly across {stats.totalMonthlyKm} km logged.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-card border border-border/40">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Clock className="h-3.5 w-3.5 text-sky-500" />
                  <span>Transit Time Saved</span>
                </div>
                <div className="text-xl font-bold text-foreground">
                  {stats.monthlyHoursSaved} <span className="text-xs font-normal text-muted-foreground">hrs/mo</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border/40">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Leaf className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Carbon Offset</span>
                </div>
                <div className="text-xl font-bold text-foreground">
                  {stats.co2SavedTonnesAnnual} <span className="text-xs font-normal text-muted-foreground">MT CO2e/yr</span>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => toast.success(`Generated custom FleetX ROI report for ${fleetSize} vehicles. PDF dispatched!`)}
              className="w-full bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-sky-500/20 cursor-pointer"
            >
              Export Customized ROI Audit
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
