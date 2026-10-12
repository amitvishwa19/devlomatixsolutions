'use client';

import React from "react";
import Image from "next/image";
import { BarChart3, Smartphone, FileText, Bell, TrendingUp, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: BarChart3,
    title: "Weekly Generation Dashboard",
    description: "Real-time graphs track unit generation, peak production hours, and compare pre vs post-cleaning gains.",
  },
  {
    icon: Smartphone,
    title: "Dedicated Mobile Access",
    description: "Check your solar generation anytime with our clean mobile interface. Instant push notifications on cleaning status.",
  },
  {
    icon: TrendingUp,
    title: "Performance Analytics",
    description: "In-depth telemetry shows irradiance efficiency, inverter conversion ratios, and weather-adjusted yield projections.",
  },
  {
    icon: FileText,
    title: "Inspection Reports",
    description: "Detailed before/after photo documentation with technician diagnostic notes delivered straight to your email.",
  },
  {
    icon: Bell,
    title: "Intelligent Fault Alerts",
    description: "Instant alerts triggered if output drops beyond standard degradation thresholds, flagging soil build-up early.",
  },
  {
    icon: Shield,
    title: "Dedicated Account Manager",
    description: "A single certified solar engineer directly handles scheduling, queries, and annual warranty validations.",
  },
];

export function Dashboard() {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden bg-secondary/15">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="container mx-auto px-4 md:px-8 pt-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="outline" className="mb-3 border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold px-3.5 py-1 rounded-full uppercase tracking-wider text-[10px]">
            AMC Exclusive Feature
          </Badge>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Smart Solar Telemetry & Monitoring
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            AMC plan subscribers gain full visibility into daily energy generation metrics and automated cleaning logs.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-2xl border border-border/70 bg-card p-6 hover:border-amber-500/30 hover:shadow-md transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-base font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Dashboard Mockup */}
        <div className="max-w-5xl mx-auto rounded-3xl border border-amber-500/20 bg-amber-500/5 p-2 shadow-2xl backdrop-blur-md">
          <div className="rounded-2xl overflow-hidden border border-border/60 bg-card">
            <Image
              src="/solarbright/dashboard-mockup.png"
              alt="SolarBright smart monitoring dashboard preview"
              width={1000}
              height={550}
              className="w-full h-auto object-cover hover:scale-[1.01] transition-transform duration-500"
            />
          </div>
          <p className="text-center text-[11px] uppercase tracking-widest text-muted-foreground mt-4 font-semibold">
            Live Preview of the SolarBright Energy Monitoring Cloud
          </p>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
