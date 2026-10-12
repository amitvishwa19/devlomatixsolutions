'use client';

import React, { useState, useEffect, useRef } from "react";
import { Zap, TrendingDown, TrendingUp, IndianRupee, Sun, Leaf } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const ELECTRICITY_RATE = 7; // ₹ per kWh average in India
const PANEL_WATT = 400; // watts per panel
const PEAK_SUN_HOURS = 5; // average daily peak sun hours in India
const DIRTY_LOSS_PERCENT = 25; // efficiency loss from dirty panels

function useAnimatedCounter(target, duration = 600) {
  const [value, setValue] = useState(target);
  const prevTargetRef = useRef(target);

  useEffect(() => {
    const from = prevTargetRef.current;
    const to = target;
    prevTargetRef.current = target;

    if (from === to) return;

    let animId = null;
    let startTimestamp = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setValue(Math.round(from + (to - from) * progress));

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };

    animId = requestAnimationFrame(step);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [target, duration]);

  return value;
}

export function EnergySavingsCalculator() {
  const [panelCount, setPanelCount] = useState(24);
  const [years, setYears] = useState("1");

  const yearNum = Number(years);
  const dailyOutputClean = (panelCount * PANEL_WATT * PEAK_SUN_HOURS) / 1000; // kWh/day
  const dailyOutputDirty = dailyOutputClean * (1 - DIRTY_LOSS_PERCENT / 100);
  const dailyLossKWh = dailyOutputClean - dailyOutputDirty;

  const totalLoss = Math.round(dailyLossKWh * 365 * yearNum * ELECTRICITY_RATE);
  const totalCleanRevenue = Math.round(dailyOutputClean * 365 * yearNum * ELECTRICITY_RATE);
  const co2WastedKg = Math.round(dailyLossKWh * 365 * yearNum * 0.82);

  const animatedLoss = useAnimatedCounter(totalLoss);
  const animatedRevenue = useAnimatedCounter(totalCleanRevenue);
  const animatedCO2 = useAnimatedCounter(co2WastedKg);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="sb-calculator" className="py-20 lg:py-28 relative overflow-hidden bg-background">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="container mx-auto px-4 md:px-8 pt-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-amber-500 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            <span className="w-6 h-px bg-amber-500" />
            ROI Estimator
            <span className="w-6 h-px bg-amber-500" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            How Much Are Dirty Panels Costing You?
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            Dust and airborne grime reduce generation by up to 25%. See how much revenue you can recover.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 items-start">
          {/* Controls */}
          <div className="rounded-2xl border border-border/70 bg-card p-7 space-y-7 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-500">
                <Sun className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground">Configure Your Installation</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" /> Number of Solar Panels
                </Label>
                <span className="text-amber-500 font-extrabold text-base bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                  {panelCount} Panels
                </span>
              </div>
              <Slider
                value={[panelCount]}
                onValueChange={([v]) => setPanelCount(v)}
                min={5}
                max={500}
                step={5}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 panels</span>
                <span>500 panels</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-amber-500" /> Evaluation Horizon
              </Label>
              <Select value={years} onValueChange={setYears}>
                <SelectTrigger className="h-11 bg-secondary/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Year Analysis</SelectItem>
                  <SelectItem value="2">2 Years Analysis</SelectItem>
                  <SelectItem value="5">5 Years Analysis</SelectItem>
                  <SelectItem value="10">10 Years Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Visual comparison bar */}
            <div className="space-y-4 pt-4 border-t border-border/40">
              <p className="text-xs uppercase tracking-wider font-bold text-foreground">Daily Generation Comparison</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-emerald-500 font-bold">Clean Panels (Optimal)</span>
                    <span className="text-foreground font-bold">{dailyOutputClean.toFixed(1)} kWh / day</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 w-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-destructive font-bold">Dirty / Soiled Panels</span>
                    <span className="text-foreground font-bold">{dailyOutputDirty.toFixed(1)} kWh / day</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-destructive/80 w-[75%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-5">
            {/* Money Lost */}
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-destructive" />
                <span className="text-xs font-bold text-destructive uppercase tracking-wider">Unrealized Revenue Lost</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-destructive font-heading">
                  ₹{animatedLoss.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Lost over {yearNum} year{yearNum > 1 ? "s" : ""} at standard ₹{ELECTRICITY_RATE}/kWh tariff.
              </p>
            </div>

            {/* Clean Revenue */}
            <div className="rounded-2xl border border-amber-500/40 bg-card p-6 shadow-md shadow-amber-500/5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-amber-500" />
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Total Energy Value Generated</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-foreground font-heading">
                  ₹{animatedRevenue.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Full generation potential with periodic maintenance.
              </p>
            </div>

            {/* CO2 Impact */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="h-5 w-5 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Environmental Offset</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground font-heading">
                  {animatedCO2.toLocaleString()} kg
                </span>
                <span className="text-muted-foreground text-xs pl-2">CO₂ wasted from grid power compensation</span>
              </div>
            </div>

            <Button
              onClick={() => scrollTo("sb-contact")}
              className="w-full rounded-xl h-12 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Stop Losing Output — Book Cleaning Visit
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EnergySavingsCalculator;
