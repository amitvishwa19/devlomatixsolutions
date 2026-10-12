'use client';

import React from "react";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { Services } from "./Services";
import { HowItWorks } from "./HowItWorks";
import { CleaningTech } from "./CleaningTech";
import { Benefits } from "./Benefits";
import { EnergySavingsCalculator } from "./EnergySavingsCalculator";
import { PlanCalculator } from "./PlanCalculator";
import { Pricing } from "./Pricing";
import { Dashboard } from "./Dashboard";
import { Gallery } from "./Gallery";
import { Tips } from "./Tips";
import { FAQ } from "./FAQ";
import { Testimonials } from "./Testimonials";
import { Contact } from "./Contact";
import { Footer } from "./Footer";
import "./solarbright.css";

export function SolarBrightLanding({ onClose }) {
  return (
    <div className="solar-bright-site relative min-h-screen w-full selection:bg-amber-500/20 selection:text-amber-500">
      <Navbar onClose={onClose} />
      <main>
        <Hero />
        <Services />
        <HowItWorks />
        <CleaningTech />
        <Benefits />
        <EnergySavingsCalculator />
        <PlanCalculator />
        <Pricing />
        <Dashboard />
        <Gallery />
        <Tips />
        <FAQ />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default SolarBrightLanding;
