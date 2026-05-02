import React from 'react';
import './_styles/crystals.css';
import { CrystalAuraProviders } from './_context/CrystalAuraProviders';
import Navbar from './_components/Navbar';
import FooterSection from './_components/FooterSection';
import CartDrawer from './_components/CartDrawer';
import WhatsAppButton from './_components/WhatsAppButton';
import GoogleOneTapLogin from './_components/GoogleOneTapLogin';

export const metadata = {
  title: 'Crystal Aura | Sacred Gemstones & Healing Crystals',
  description: 'Discover our curated collection of authentic healing crystals, gemstones, and spiritual tools. Expertly sourced for your spiritual journey.',
};

export default function CrystalAuraLayout({ children }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_ID;

  return (
    <div className="crystal-aura min-h-screen relative font-sans">
      <CrystalAuraProviders>
        <div className="crystal-aura-root flex flex-col min-h-screen">
          <GoogleOneTapLogin clientId={googleClientId} />
          {/* Background effects */}
          <div className="fixed inset-0 bg-[#0a0a0a] pointer-events-none -z-10" />
          <div className="fixed inset-0 noise-overlay pointer-events-none opacity-20 -z-10" />

          <Navbar />
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
