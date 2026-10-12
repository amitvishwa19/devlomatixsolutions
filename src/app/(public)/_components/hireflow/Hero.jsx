'use client';

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Play, CheckCircle2, Shield, Users } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="hf-hero" className="relative min-h-[80vh] flex items-center overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28">
      {/* Background Decor */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="relative z-10 container mx-auto px-4 md:px-8 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold backdrop-blur-md">
            <Zap className="h-3.5 w-3.5 text-indigo-400" />
            <span>Now with AI-Powered Candidate Matching & Resume Scoring</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Hire Smarter,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400 font-extrabold">
              Hire Faster
            </span>
          </h1>

          <p className="text-base sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-normal">
            HireFlow is the modern applicant tracking system that helps you find, evaluate, and onboard top engineering and business talent — all in one unified, collaborative platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              size="lg"
              onClick={() => scrollTo("hf-pipeline")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-indigo-500/25 cursor-pointer text-sm"
            >
              Try Demo Pipeline <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollTo("hf-how-it-works")}
              className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 font-semibold h-12 rounded-xl cursor-pointer text-sm"
            >
              <Play className="mr-2 h-4 w-4 fill-current" />
              See How It Works
            </Button>
          </div>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-400" />
              SOC-2 & GDPR compliant
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-violet-400" />
              15-minute quick migration
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
