'use client';

import React from "react";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { Compliance } from "./Compliance";
import { Modules } from "./Modules";
import { ROICalculator } from "./ROICalculator";
import { Features } from "./Features";
import { Comparison } from "./Comparison";
import { Pricing } from "./Pricing";
import { Testimonials } from "./Testimonials";
import { FAQ } from "./FAQ";
import { CTA } from "./CTA";
import { Footer } from "./Footer";
import "./curexa.css";

export function CurexaLanding({ onClose }) {
  return (
    <div className="curexa-site relative min-h-screen w-full selection:bg-emerald-500/20 selection:text-emerald-600">
      <Navbar onClose={onClose} />
      <main>
        <Hero />
        <Compliance />
        <Modules />
        <ROICalculator />
        <Features />
        <Comparison />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
