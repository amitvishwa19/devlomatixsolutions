'use client';

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Key, 
  Receipt, 
  Wrench, 
  ArrowRight, 
  CheckCircle2, 
  MessageSquare, 
  Sparkles,
  ShieldCheck,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function Hero() {
  const scrollToCalculator = () => {
    const el = document.getElementById("px-calculator");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="px-hero" className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-amber-500/15 via-orange-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <span className="module-badge">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Unified Residential & Commercial PropTech Ecosystem
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12] mb-6"
          >
            Autonomous Property Management &{" "}
            <span className="text-gradient-propx">
              Real Estate Asset Cloud
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-normal leading-relaxed mb-8"
          >
            Consolidate your entire real estate portfolio: automated digital lease generation, online rent collection, maintenance contractor ticketing, and instant WhatsApp rent reminders powered by KonnectX.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={() => toast.success("PropX Portfolio Trial activated! Ready to link properties.")}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold h-12 px-8 rounded-xl shadow-xl shadow-amber-500/25 cursor-pointer text-sm"
            >
              Start Free Portfolio Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={scrollToCalculator}
              className="h-12 px-6 rounded-xl border-border/80 hover:bg-muted font-semibold text-sm cursor-pointer"
            >
              Calculate Rental Yield
            </Button>
          </motion.div>
        </div>

        {/* Live Simulated Property Portfolio HUD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative max-w-5xl mx-auto rounded-3xl border border-amber-500/30 bg-card/75 p-4 sm:p-6 backdrop-blur-2xl shadow-2xl shadow-amber-500/10"
        >
          {/* Top Bar HUD */}
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-border/40 gap-3">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-foreground">
                PORTFOLIO HEALTH: OPTIMAL • ASSET REGION: PRIME METRO
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px]">
                <MessageSquare className="h-3 w-3 mr-1" />
                KonnectX WhatsApp Rent Reminders: Active
              </Badge>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]">
                Occupancy: 98.4%
              </Badge>
            </div>
          </div>

          {/* Quick HUD Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 my-6">
            <div className="p-3 sm:p-4 rounded-2xl bg-secondary/30 border border-border/30">
              <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                <span>Managed Units</span>
                <Building2 className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-foreground">340 <span className="text-xs font-normal text-muted-foreground">Units</span></div>
              <span className="text-[10px] text-emerald-500 font-semibold">98.4% Occupied</span>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-secondary/30 border border-border/30">
              <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                <span>Monthly Rent Inflows</span>
                <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-foreground">$428,500</div>
              <span className="text-[10px] text-emerald-500 font-semibold">99.2% Collection Rate</span>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-secondary/30 border border-border/30">
              <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                <span>Open Maintenance</span>
                <Wrench className="h-3.5 w-3.5 text-orange-500" />
              </div>
              <div className="text-2xl font-black text-foreground">3 <span className="text-xs font-normal text-muted-foreground">Tickets</span></div>
              <span className="text-[10px] text-emerald-500 font-semibold">Avg SLA: 2.4 Hours</span>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-secondary/30 border border-border/30">
              <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                <span>Annual Net Yield</span>
                <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-foreground">8.4%</div>
              <span className="text-[10px] text-emerald-500 font-semibold">+1.8% vs Market Avg</span>
            </div>
          </div>

          {/* Active Tenant Leases Preview */}
          <div className="rounded-2xl bg-background/60 border border-border/40 p-4">
            <div className="text-xs font-bold text-foreground mb-3 flex items-center justify-between">
              <span>Recent Lease Activities & Rent Reconciliations</span>
              <span className="text-[10px] text-amber-500">Auto-Reconciled via Stripe & PayFlow</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/30">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-foreground">The Heights • Unit 14B</span>
                  <span className="text-muted-foreground">Alexander Wright • 2-Year Lease Active</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-emerald-500 font-semibold">$3,400 /mo Paid</span>
                  <Badge className="bg-emerald-500/10 text-emerald-500 text-[10px] border-emerald-500/20">Auto-Renewed</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/30">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="font-bold text-foreground">Skyline Tower • Suite 402</span>
                  <span className="text-muted-foreground">Apex Media Group • Commercial Lease</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-amber-500 font-semibold">WhatsApp Rent Ping Sent</span>
                  <Badge className="bg-amber-500/10 text-amber-500 text-[10px] border-amber-500/20">Due in 3 Days</Badge>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
