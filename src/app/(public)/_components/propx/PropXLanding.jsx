'use client';

import React from "react";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { Features } from "./Features";
import { RentalYieldCalculator } from "./RentalYieldCalculator";
import { Comparison } from "./Comparison";
import { Pricing } from "./Pricing";
import { FAQ } from "./FAQ";
import { CTA } from "./CTA";
import { Footer } from "./Footer";
import "./propx.css";

export function PropXLanding({ onClose }) {
  return (
    <div className="propx-site relative min-h-screen w-full selection:bg-amber-500/20 selection:text-amber-500 bg-background text-foreground">
      <Navbar onClose={onClose} />
      <main>
        <Hero />
        <Features />
        <RentalYieldCalculator />
        <Comparison />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
