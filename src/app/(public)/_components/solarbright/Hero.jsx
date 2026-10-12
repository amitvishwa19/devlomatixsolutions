'use client';

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { value: "50+", label: "Cities Served" },
  { value: "10K+", label: "Panels Cleaned" },
  { value: "30%", label: "Efficiency Boost" },
];

export function Hero() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="sb-hero" className="relative min-h-[85vh] flex items-center overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28">
      {/* Background Decor */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="relative z-10 container mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>India&apos;s #1 Solar Panel Cleaning Service</span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.12] tracking-tight">
              Maximize Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 font-extrabold">
                Solar Energy
              </span>{" "}
              Output
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed font-normal">
              Dust, soot, and bird droppings cut panel generation by up to 30%. Our professional demineralized cleaning restores peak electrical output — saving ₹1000s on your monthly bills.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
              <Button
                size="lg"
                onClick={() => scrollTo("sb-contact")}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Get Free Quote <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollTo("sb-calculator")}
                className="border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-semibold h-12 rounded-xl cursor-pointer"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Calculate Savings
              </Button>
            </div>

            {/* Quality assurances */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground">
              {["DM Water Cleaning", "Zero Scratch Guarantee", "Full Insurance Covered"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  {t}
                </span>
              ))}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border/40">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="font-heading text-2xl sm:text-3xl font-extrabold text-amber-500">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden border border-amber-500/20 bg-amber-500/5 p-2 shadow-2xl backdrop-blur-md">
              <div className="relative rounded-2xl overflow-hidden">
                <Image
                  src="/solarbright/hero-solar.png"
                  alt="Modern solar panel installation"
                  width={640}
                  height={420}
                  className="w-full h-auto object-cover rounded-2xl transition-transform duration-500 hover:scale-[1.02]"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />

                {/* Floating badge */}
                <div className="absolute bottom-4 left-4 right-4 glass-card rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Restored to 100% Generation</p>
                      <p className="text-[10px] text-muted-foreground">Certified Clean Certificate Issued</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Live
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
