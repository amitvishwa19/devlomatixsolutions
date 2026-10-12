'use client';

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Cloud, FlaskConical, Smartphone, Shield, Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroDashboard from "@/assets/images/curexa/hero-dashboard.jpg";

const highlights = [
  { icon: Cloud, text: "Auto Cloud Backup" },
  { icon: FlaskConical, text: "500+ Pathology Reports" },
  { icon: Smartphone, text: "Doctor & Patient Mobile App" },
  { icon: Shield, text: "NABH / HIPAA Compliant" },
];

export function Hero() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="cx-hero" className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28">
      {/* Background Decor */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="module-badge">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Trusted by 500+ Healthcare Facilities
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Complete{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 font-extrabold">
                Hospital Management
              </span>{" "}
              System with AI-Powered CRM
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              15+ integrated modules including OPD/IPD, Pathology with 500+ report templates,
              Pharmacy, Billing & TPA insurance automation — all with automated daily cloud backup.
            </p>

            {/* Highlights Chips */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              {highlights.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                >
                  <item.icon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 pt-4">
              <Button
                size="lg"
                onClick={() => scrollTo("cx-pricing")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-7 h-12 rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollTo("cx-roi")}
                className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-semibold h-12 rounded-xl cursor-pointer"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Calculate Hospital ROI
              </Button>
            </div>

            <div className="flex items-center gap-6 pt-2 text-xs text-muted-foreground">
              {["Free 14-day trial", "Zero server setup needed", "Guided data migration"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  {t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right Content - Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-2 shadow-2xl backdrop-blur-md">
              <div className="overflow-hidden rounded-xl">
                <Image
                  src={heroDashboard}
                  alt="Curexa HMS Hospital Dashboard"
                  width={650}
                  height={420}
                  className="w-full h-auto object-cover rounded-xl shadow-inner transition-transform duration-500 hover:scale-[1.02]"
                  priority
                />
              </div>

              {/* Floating Stat Badge */}
              <div className="absolute -bottom-5 -left-5 bg-card/95 border border-border/70 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">99.9% Uptime SLA</p>
                  <p className="text-[11px] text-muted-foreground">NABH & HIPAA Compliant</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
