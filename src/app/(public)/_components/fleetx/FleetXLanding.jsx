'use client';

import React from "react";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { Features } from "./Features";
import { FleetTelemetrySimulator } from "./FleetTelemetrySimulator";
import { Comparison } from "./Comparison";
import { Pricing } from "./Pricing";
import { FAQ } from "./FAQ";
import { CTA } from "./CTA";
import { Footer } from "./Footer";
import "./fleetx.css";

export function FleetXLanding({ onClose }) {
  return (
    <div className="fleetx-site relative min-h-screen w-full selection:bg-sky-500/20 selection:text-sky-500 bg-background text-foreground">
      <Navbar onClose={onClose} />
      <main>
        <Hero />
        <Features />
        <FleetTelemetrySimulator />
        <Comparison />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
