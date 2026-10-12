'use client';

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  MapPin, 
  Fuel, 
  ShieldCheck, 
  Gauge, 
  ArrowRight, 
  Navigation, 
  MessageSquare, 
  Activity,
  CheckCircle2,
  Cpu
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function Hero() {
  const scrollToSimulator = () => {
    const el = document.getElementById("fx-simulator");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="fx-hero" className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-sky-500/15 via-cyan-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <span className="module-badge radar-ping">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              Next-Gen Autonomous Fleet & Supply Chain Cloud
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12] mb-6"
          >
            The Operating System for{" "}
            <span className="text-gradient-fleetx">
              Connected Fleets & Smart Logistics
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-normal leading-relaxed mb-8"
          >
            Empower dispatchers, drivers, and freight managers with AI-driven dynamic routing, real-time CAN-bus telemetry, automated e-Way manifests, and automated customer WhatsApp dispatch tracking via KonnectX.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={() => toast.success("FleetX Sandbox environment initialized with 50 simulated trucks.")}
              className="bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white font-bold h-12 px-8 rounded-xl shadow-xl shadow-sky-500/25 cursor-pointer text-sm"
            >
              Start 14-Day Fleet Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={scrollToSimulator}
              className="h-12 px-6 rounded-xl border-border/80 hover:bg-muted font-semibold text-sm cursor-pointer"
            >
              Interactive Fuel Simulator
            </Button>
          </motion.div>
        </div>

        {/* Live Simulated Telemetry Dashboard HUD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative max-w-5xl mx-auto rounded-3xl border border-sky-500/30 bg-card/70 p-4 sm:p-6 backdrop-blur-2xl shadow-2xl shadow-sky-500/10"
        >
          {/* Top Bar HUD */}
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-border/40 gap-3">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-foreground">
                LIVE TELEMETRY HUB • REGION: AP-SOUTH-1
              </span>
              <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
                LATENCY: 12ms
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-sky-500/10 text-sky-500 border-sky-500/30 text-[10px]">
                <MessageSquare className="h-3 w-3 mr-1" />
                KonnectX Cloud Hook: Active
              </Badge>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]">
                GPS CAN-Bus: 99.98% Online
              </Badge>
            </div>
          </div>

          {/* Quick HUD Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 my-6">
            <div className="p-3 sm:p-4 rounded-2xl bg-secondary/30 border border-border/30">
              <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                <span>Active Rigs</span>
                <Truck className="h-3.5 w-3.5 text-sky-500" />
              </div>
              <div className="text-2xl font-black text-foreground">148 <span className="text-xs font-normal text-muted-foreground">/ 152</span></div>
              <span className="text-[10px] text-emerald-500 font-semibold">97.3% Utilization</span>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-secondary/30 border border-border/30">
              <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                <span>Fuel Optimization</span>
                <Fuel className="h-3.5 w-3.5 text-cyan-500" />
              </div>
              <div className="text-2xl font-black text-foreground">-28.4%</div>
              <span className="text-[10px] text-emerald-500 font-semibold">Saved $4,820 today</span>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-secondary/30 border border-border/30">
              <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                <span>Mean Speed</span>
                <Gauge className="h-3.5 w-3.5 text-indigo-500" />
              </div>
              <div className="text-2xl font-black text-foreground">62.8 <span className="text-xs font-normal text-muted-foreground">km/h</span></div>
              <span className="text-[10px] text-emerald-500 font-semibold">Zero over-speeding alerts</span>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-secondary/30 border border-border/30">
              <div className="flex items-center justify-between text-muted-foreground text-xs mb-1">
                <span>WhatsApp Delivery ETA</span>
                <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-foreground">1,480</div>
              <span className="text-[10px] text-sky-500 font-semibold">99.1% Read Rate</span>
            </div>
          </div>

          {/* Active Dispatch Feed Preview */}
          <div className="rounded-2xl bg-background/60 border border-border/40 p-4">
            <div className="text-xs font-bold text-foreground mb-3 flex items-center justify-between">
              <span>Active Dispatches in Transit</span>
              <span className="text-[10px] text-sky-500">Live Updating Every 2s</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/30">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-mono font-bold text-foreground">RIG-8024</span>
                  <span className="text-muted-foreground">Mumbai Hub ➔ Delhi Logistics Park</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sky-500 font-medium">ETA: 4h 12m</span>
                  <Badge className="bg-emerald-500/10 text-emerald-500 text-[10px] border-emerald-500/20">On Schedule</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/30">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-sky-500" />
                  <span className="font-mono font-bold text-foreground">RIG-3190</span>
                  <span className="text-muted-foreground">Bangalore Tech Hub ➔ Chennai Port</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sky-500 font-medium">ETA: 1h 45m</span>
                  <Badge className="bg-sky-500/10 text-sky-500 text-[10px] border-sky-500/20">Auto-Rerouted (Weather)</Badge>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
