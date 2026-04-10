import React from 'react';
import './_styles/solarbright.css';

export const metadata = {
  title: 'SolarBright | Premium Solar Panel Cleaning & Maintenance',
  description: 'Maximize your solar efficiency with professional cleaning and smart monitoring solutions. Smart solar care for a brighter future.',
};

export default function SolarBrightLayout({ children }) {
  return (
    <div className="solar-bright min-h-screen relative overflow-x-hidden bg-background text-foreground selection:bg-primary/30 selection:text-white">
      {/* Mesh Background Effect */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-background" />
      <div className="fixed inset-0 pointer-events-none -z-10 mesh-bg opacity-40" />
      
      {/* Root Container */}
      <div className="relative flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
