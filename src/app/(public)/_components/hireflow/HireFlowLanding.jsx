"use client";

import React from "react";
import "./hireflow.css";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Marquee from "./Marquee";
import Stats from "./Stats";
import Features from "./Features";
import PipelinePreview from "./PipelinePreview";
import HowItWorks from "./HowItWorks";
import Comparison from "./Comparison";
import Integrations from "./Integrations";
import Pricing from "./Pricing";
import Testimonials from "./Testimonials";
import Team from "./Team";
import FAQ from "./FAQ";
import Newsletter from "./Newsletter";
import CTA from "./CTA";
import Footer from "./Footer";

export default function HireFlowLanding({ onClose }) {
    return (
        <div className="hireflow-site min-h-screen text-slate-100 bg-[#0B0F19] antialiased selection:bg-indigo-500 selection:text-white">
            <Navbar onClose={onClose} />
            <main>
                <Hero />
                <Marquee />
                <Stats />
                <Features />
                <PipelinePreview />
                <HowItWorks />
                <Comparison />
                <Integrations />
                <Pricing />
                <Testimonials />
                <Team />
                <FAQ />
                <Newsletter />
                <CTA />
            </main>
            <Footer />
        </div>
    );
}
