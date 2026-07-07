import React from "react";
import SiteNavbar from "./_components/SiteNavbar";
import FooterSection from "./_components/FooterSection";
import { CrystalAuraProviders } from "./_context/CrystalAuraProviders";

// Import local premium stylesheet overrides
import "./_styles/crystals.css";

export const metadata = {
  title: 'Crystal Aura | Sacred Gemstones & Healing Crystals',
  description: 'Discover our curated collection of authentic healing crystals, gemstones, and spiritual tools. Expertly sourced for your spiritual journey.',
};

export default function CrystalAuraLayout({ children }) {
  return (
    <CrystalAuraProviders>
      <div className="relative min-h-screen flex flex-col bg-[#06040a] text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        {/* 🔮 Background Floating Ambient Glowing Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20">
          <div className="absolute top-[10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[130px] orb-glow-primary opacity-50" />
          <div className="absolute top-[45%] right-[-10%] w-[45vw] h-[45vw] rounded-full blur-[130px] orb-glow-accent opacity-45" />
          <div className="absolute bottom-[10%] left-[10%] w-[50vw] h-[50vw] rounded-full blur-[130px] orb-glow-rose opacity-40" />
        </div>

        {/* 🧭 Site Navbar Header */}
        <SiteNavbar />

        {/* 🌌 Main Body Contents */}
        <main className="flex-grow">
          {children}
        </main>

        {/* 🧭 Site Footer Section */}
        <FooterSection />
      </div>
    </CrystalAuraProviders>
  );
}

