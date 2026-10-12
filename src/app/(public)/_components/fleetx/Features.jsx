'use client';

import React from "react";
import { 
  Navigation, 
  Cpu, 
  FileCheck, 
  ShieldAlert, 
  Award, 
  MessageCircle,
  Clock,
  Zap,
  BarChart3,
  Layers
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Navigation,
    title: "AI Dynamic Route Solver",
    desc: "Recalculates optimal highway corridors every 90 seconds based on live congestion, weather, axle weight limits, and toll costs.",
    tag: "32% Faster Turnaround"
  },
  {
    icon: Cpu,
    title: "CAN-Bus Telemetry & Fuel Guard",
    desc: "Direct integration with OBD-II / J1939 protocols. Detects fuel siphoning, engine temperature spikes, and tire wear instantly.",
    tag: "Zero Fuel Theft"
  },
  {
    icon: FileCheck,
    title: "Digital e-Way Bill Manifests",
    desc: "Single-click sync with national tax and e-Way portals. Automatically links freight invoices to electronic consignment notes.",
    tag: "100% Tax Compliant"
  },
  {
    icon: ShieldAlert,
    title: "Polygonal Geofence & Auto-Lock",
    desc: "Set millimetric polygon boundaries around warehouses and corridors. Automated immobilizer trigger if vehicle leaves authorized track.",
    tag: "Bank-Grade Security"
  },
  {
    icon: MessageCircle,
    title: "KonnectX WhatsApp Tracking",
    desc: "Customers get interactive WhatsApp tracking links with driver details and real-time live map telemetry—no mobile app download required.",
    tag: "Powered by KonnectX"
  },
  {
    icon: Award,
    title: "Driver Safety & ELD Compliance",
    desc: "Monitors driver fatigue, harsh acceleration, and cornering g-force. Rewards top-rated safe drivers with monthly fuel bonuses.",
    tag: "Reduced Insurance Risk"
  }
];

export function Features() {
  return (
    <section id="fx-features" className="py-20 bg-secondary/10 border-y border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="module-badge mb-3">Enterprise Logistics Capabilities</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Built for 10 to 10,000+ Commercial Fleets
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed">
            Eliminate dispatch chaos, fuel siphoning, and delayed consignments with autonomous intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="p-6 rounded-3xl bg-card border border-border/60 hover:border-sky-500/40 hover:shadow-xl hover:shadow-sky-500/10 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all shadow-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
                      {f.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-sky-500 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
