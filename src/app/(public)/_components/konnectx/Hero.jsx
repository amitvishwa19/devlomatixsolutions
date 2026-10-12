'use client';

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, MessageCircle, Sparkles } from "lucide-react";
import { useLanguage } from "./use-language";

const stats = [
  { value: "10M+", label: "Messages Sent" },
  { value: "5,000+", label: "Businesses" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "150+", label: "Countries" },
];

export function Hero() {
  const { t } = useLanguage();
  const heroDashboard = "/konnectx/hero-dashboard.png";

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="kx-hero" className="relative overflow-hidden mesh-bg pt-10 pb-20 sm:pt-14 sm:pb-28">
      {/* Decorative Orbs */}
      <div className="absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />

      {/* Dot Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '36px 36px',
        }} 
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md">
              <MessageCircle className="h-3.5 w-3.5" />
              {t("hero.badge")}
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl text-foreground">
              {t("hero.title1")}{" "}
              <span className="text-gradient-sun block mt-1">
                WhatsApp Business API
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base sm:text-lg leading-relaxed text-muted-foreground font-normal">
              {t("hero.subtitle")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={() => scrollTo("kx-pricing")}
                className="gap-2 text-base font-bold w-full sm:w-auto text-white shadow-xl cursor-pointer"
                style={{ background: "var(--gradient-sun)" }}
              >
                {t("hero.cta1")} <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollTo("kx-features")}
                className="gap-2 text-base border-border/80 hover:bg-muted w-full sm:w-auto cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                Explore Features
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-xs sm:text-sm text-muted-foreground">
              {["No credit card required", "7-day free trial", "Cancel anytime"].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Dashboard Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative mx-auto w-full max-w-lg lg:mx-0"
          >
            <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl -z-10" />
            <div className="relative rounded-2xl border border-white/10 p-1 bg-gradient-to-b from-white/10 to-transparent shadow-2xl backdrop-blur-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroDashboard}
                alt="KonnectX WhatsApp Business API Dashboard"
                className="relative w-full rounded-xl object-cover shadow-2xl"
                onError={(e) => {
                  // Fallback if image fails
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Quick Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 gap-4 glass-card rounded-2xl p-6 sm:grid-cols-4 sm:p-8"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center p-2">
              <p className="text-2xl sm:text-3xl font-extrabold text-gradient-sun">{s.value}</p>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground font-medium">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
