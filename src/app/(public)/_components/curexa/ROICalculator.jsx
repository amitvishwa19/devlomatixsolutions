'use client';

import React, { useState, useMemo } from "react";
import { Calculator, TrendingUp, Clock, Users, BedDouble, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export function ROICalculator() {
  const [beds, setBeds] = useState([40]);
  const [dailyOPD, setDailyOPD] = useState([120]);
  const [staffCount, setStaffCount] = useState([30]);

  const calculations = useMemo(() => {
    const bedCount = beds[0];
    const opdCount = dailyOPD[0];
    const staff = staffCount[0];

    // ROI calculations formula
    const annualBillingErrors = opdCount * 365 * 0.05 * 500;
    const billingErrorsSaved = annualBillingErrors * 0.4;

    const manualHoursPerWeek = staff * 5;
    const hoursSavedPerYear = manualHoursPerWeek * 0.6 * 52;
    const labourCostSaved = hoursSavedPerYear * 150;

    const revenueLeakage = bedCount * 365 * 0.03 * 2000;
    const leakageRecovered = revenueLeakage * 0.5;

    const totalAnnualSavings = billingErrorsSaved + labourCostSaved + leakageRecovered;
    const monthlySavings = totalAnnualSavings / 12;

    return {
      billingErrorsSaved: Math.round(billingErrorsSaved),
      hoursSavedPerYear: Math.round(hoursSavedPerYear),
      labourCostSaved: Math.round(labourCostSaved),
      leakageRecovered: Math.round(leakageRecovered),
      totalAnnualSavings: Math.round(totalAnnualSavings),
      monthlySavings: Math.round(monthlySavings),
    };
  }, [beds, dailyOPD, staffCount]);

  const formatCurrency = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} Lakhs`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="cx-roi" className="py-20 lg:py-28 bg-background relative overflow-hidden">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="container mx-auto px-4 md:px-8 pt-16">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="module-badge mb-3">
            <Calculator className="w-3.5 h-3.5" />
            Interactive Value Calculator
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Calculate Your Hospital&apos;s{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 font-extrabold">
              Annual ROI & Savings
            </span>
          </h2>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            See how much time, revenue leakage, and billing errors Curexa eliminates for your facility every single month.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
          {/* Sliders Input Panel */}
          <div className="lg:col-span-7 glass-card rounded-2xl p-7 border border-border/70 space-y-7 shadow-lg">
            {/* Slider 1: Bed Count */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <div className="flex items-center gap-2">
                  <BedDouble className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-bold text-foreground">Hospital Bed Capacity</span>
                </div>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg">
                  {beds[0]} Beds
                </span>
              </div>
              <Slider
                value={beds}
                onValueChange={setBeds}
                min={5}
                max={300}
                step={5}
                className="py-2"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                <span>5 beds</span>
                <span>300+ beds</span>
              </div>
            </div>

            {/* Slider 2: Daily OPD Patients */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-bold text-foreground">Daily OPD Patient Footfall</span>
                </div>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg">
                  {dailyOPD[0]} Patients / Day
                </span>
              </div>
              <Slider
                value={dailyOPD}
                onValueChange={setDailyOPD}
                min={10}
                max={600}
                step={10}
                className="py-2"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                <span>10 patients</span>
                <span>600+ patients</span>
              </div>
            </div>

            {/* Slider 3: Staff Count */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-bold text-foreground">Staff & Technicians Count</span>
                </div>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg">
                  {staffCount[0]} Staff Members
                </span>
              </div>
              <Slider
                value={staffCount}
                onValueChange={setStaffCount}
                min={5}
                max={150}
                step={5}
                className="py-2"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                <span>5 staff</span>
                <span>150+ staff</span>
              </div>
            </div>
          </div>

          {/* Results Summary Card */}
          <div className="lg:col-span-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-7 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-white/80 text-xs uppercase font-bold tracking-wider">
                <TrendingUp className="w-4 h-4" />
                Projected Net Value
              </div>
              <h3 className="text-4xl font-black text-white tracking-tight">
                {formatCurrency(calculations.totalAnnualSavings)}
              </h3>
              <p className="text-xs text-white/80 mt-1 font-medium">Estimated Total Annual Cost Recovery</p>
            </div>

            <div className="space-y-3.5 my-7 pt-5 border-t border-white/20">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-white/80">Monthly Cash Saved:</span>
                <span className="font-bold text-white">{formatCurrency(calculations.monthlySavings)}/mo</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-white/80">Billing Errors Prevented:</span>
                <span className="font-bold text-white">{formatCurrency(calculations.billingErrorsSaved)}</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-white/80">Staff Hours Reclaimed:</span>
                <span className="font-bold text-white">{calculations.hoursSavedPerYear.toLocaleString()} hrs / yr</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-white/80">Revenue Leakage Recovered:</span>
                <span className="font-bold text-white">{formatCurrency(calculations.leakageRecovered)}</span>
              </div>
            </div>

            <Button
              onClick={() => scrollTo("cx-pricing")}
              className="w-full bg-white text-emerald-900 hover:bg-white/90 font-bold h-11 rounded-xl shadow-md cursor-pointer"
            >
              Lock In These Savings <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
