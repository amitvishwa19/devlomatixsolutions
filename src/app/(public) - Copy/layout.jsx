import React from 'react';
import './_styles/crystals.css';
import { CrystalAuraProviders } from './_context/CrystalAuraProviders';
import SiteNavbar from './_components/SiteNavbar';
import FooterSection from './_components/FooterSection';
import CartDrawer from './_components/CartDrawer';
import WhatsAppButton from './_components/WhatsAppButton';

export const metadata = {
  title: 'Crystal Aura | Sacred Gemstones & Healing Crystals',
  description: 'Discover our curated collection of authentic healing crystals, gemstones, and spiritual tools. Expertly sourced for your spiritual journey.',
};

export default function CrystalAuraLayout({ children }) {
  return (
    <div className="crystal-aura min-h-screen relative font-sans overflow-x-hidden">
      <CrystalAuraProviders>
        <div className="crystal-aura-root flex flex-col min-h-screen relative">
          {/* Fixed Background effects and Ambient Glowing Orbs */}
          <div className="fixed inset-0 bg-[#06040a] pointer-events-none -z-20" />
          <div className="fixed inset-0 noise-overlay pointer-events-none opacity-[0.15] -z-20" />
          
          {/* Floating glowing background orbs */}
          <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full orb-glow-primary pointer-events-none -z-10 blur-[80px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full orb-glow-accent pointer-events-none -z-10 blur-[100px] animate-pulse" style={{ animationDuration: '12s' }} />
          <div className="fixed top-[40%] right-[10%] w-[45%] h-[45%] rounded-full orb-glow-rose pointer-events-none -z-10 blur-[90px] animate-pulse" style={{ animationDuration: '10s' }} />

          <SiteNavbar />
          <CartDrawer />
          <WhatsAppButton />

          <main className="grow pt-20">
            {children}
          </main>

          <FooterSection />
        </div>
      </CrystalAuraProviders>
    </div>
  );
}
