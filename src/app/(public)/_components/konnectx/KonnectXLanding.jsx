'use client';

import React from "react";
import { LanguageProvider } from "./use-language";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { Features } from "./Features";
import { Stats } from "./Stats";
import { Industries } from "./Industries";
import { Integrations } from "./Integrations";
import { Pricing } from "./Pricing";
import { Testimonials } from "./Testimonials";
import { FAQ } from "./FAQ";
import { CTA } from "./CTA";
import { Footer } from "./Footer";
import { ChatbotWidget } from "./ChatbotWidget";
import "./konnectx.css";

export function KonnectXLanding({ onClose }) {
  return (
    <LanguageProvider>
      <div className="konnectx-site relative min-h-screen w-full bg-background/40  selection:text-primary ">
        <Navbar onClose={onClose} />
        <main>
          <Hero />
          <Features />
          <Stats />
          <Industries />
          <Integrations />
          <Pricing />
          <Testimonials />
          <FAQ />
          <CTA />
        </main>
        <Footer />
        <ChatbotWidget />
      </div>
    </LanguageProvider>
  );
}
