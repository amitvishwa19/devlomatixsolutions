'use client';

import React, { useState, useMemo } from "react";
import { Sparkles, ArrowRight, Building2, Sun, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import calculatorConfig from "./calculatorConfig";

export function PlanCalculator() {
  const [propertyType, setPropertyType] = useState(calculatorConfig.propertyTypes[0].value);
  const [towers, setTowers] = useState(1);
  const [panelCount, setPanelCount] = useState(calculatorConfig.panelRange.default);
  const [frequency, setFrequency] = useState(calculatorConfig.cleaningFrequency[0].value);

  const totalPanels = useMemo(() => {
    const prop = calculatorConfig.propertyTypes.find((p) => p.value === propertyType);
    return Math.round(panelCount * towers * (prop?.panelMultiplier ?? 1));
  }, [propertyType, towers, panelCount]);

  const frequencyMultiplier = useMemo(() => {
    return calculatorConfig.cleaningFrequency.find((f) => f.value === frequency)?.multiplier ?? 1;
  }, [frequency]);

  const recommendedPlan = useMemo(() => {
    const plans = calculatorConfig.plans;
    if (totalPanels >= 50 || frequencyMultiplier >= 6) return plans[2]; // AMC
    if (totalPanels >= 20 || frequencyMultiplier >= 4) return plans[1]; // Standard
    return plans[0]; // Basic
  }, [totalPanels, frequencyMultiplier]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden bg-secondary/10">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="container mx-auto px-4 md:px-8 pt-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-amber-500 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            <span className="w-6 h-px bg-amber-500" />
            Instant Plan Quotation
            <span className="w-6 h-px bg-amber-500" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
            Calculate Your Customized Plan
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            Select your property dimensions and frequency to find the most cost-effective maintenance package.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-8 items-start">
          {/* Controls */}
          <div className="lg:col-span-3 rounded-2xl border border-border/70 bg-card p-7 space-y-6 shadow-md">
            {/* Property Type */}
            <div className="space-y-2.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-amber-500" /> Property Classification
              </Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="h-11 bg-secondary/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {calculatorConfig.propertyTypes.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Buildings */}
            <div className="space-y-2.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-amber-500" /> Building Blocks / Towers
              </Label>
              <Select value={String(towers)} onValueChange={(v) => setTowers(Number(v))}>
                <SelectTrigger className="h-11 bg-secondary/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {calculatorConfig.towerOptions.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Panels Slider */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Sun className="h-4 w-4 text-amber-500" /> Panels Per Building
                </Label>
                <span className="text-amber-500 font-extrabold text-sm bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                  {panelCount} Panels
                </span>
              </div>
              <Slider
                value={[panelCount]}
                onValueChange={([v]) => setPanelCount(v)}
                min={calculatorConfig.panelRange.min}
                max={calculatorConfig.panelRange.max}
                step={calculatorConfig.panelRange.step}
                className="py-2"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>{calculatorConfig.panelRange.min} panels</span>
                <span>{calculatorConfig.panelRange.max} panels</span>
              </div>
            </div>

            {/* Frequency */}
            <div className="space-y-2.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" /> Service Frequency
              </Label>
              <RadioGroup value={frequency} onValueChange={setFrequency} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {calculatorConfig.cleaningFrequency.map((opt) => (
                  <Label
                    key={opt.value}
                    htmlFor={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      frequency === opt.value
                        ? "border-amber-500/60 bg-amber-500/10 text-foreground font-semibold"
                        : "border-border bg-secondary/40 text-muted-foreground hover:border-amber-500/30"
                    }`}
                  >
                    <RadioGroupItem value={opt.value} id={opt.value} />
                    <span className="text-xs">{opt.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          </div>

          {/* Results Side */}
          <div className="lg:col-span-2 space-y-5">
            {/* Summary */}
            <div className="rounded-2xl border border-border/70 bg-card p-6 space-y-4 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Deployment Summary</h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Solar Panels:</span>
                  <span className="font-extrabold text-amber-500 text-sm">{totalPanels}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Visits / Year:</span>
                  <span className="font-bold text-foreground">{frequencyMultiplier}x</span>
                </div>
                <div className="h-px bg-border/40" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Cost Per Visit:</span>
                  <span className="font-bold text-foreground">₹{(totalPanels * recommendedPlan.pricePerPanel).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Annual Cost:</span>
                  <span className="font-extrabold text-amber-500 text-base">
                    ₹{(totalPanels * recommendedPlan.pricePerPanel * frequencyMultiplier).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Recommended Plan */}
            <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-transparent p-6 space-y-4 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 bg-amber-500 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" /> Recommended
                </span>
                <span className="text-xs text-muted-foreground font-medium">{recommendedPlan.bestFor}</span>
              </div>

              <div>
                <h4 className="font-heading text-2xl font-bold text-foreground">{recommendedPlan.name}</h4>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-amber-500 font-heading">₹{recommendedPlan.pricePerPanel}</span>
                  <span className="text-xs text-muted-foreground">/ panel / visit</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">{recommendedPlan.description}</p>

              <Button
                onClick={() => scrollTo("sb-contact")}
                className="w-full rounded-xl h-11 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 cursor-pointer"
              >
                Book With This Rate <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PlanCalculator;
