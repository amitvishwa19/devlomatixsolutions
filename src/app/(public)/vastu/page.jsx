'use client';

import React from "react";
import { motion } from "framer-motion";

// Inline SVG Icons for Vastu Page
const HomeIcon = ({ className = "w-8 h-8" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);

const SunIcon = ({ className = "w-8 h-8" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
);

const CompassIcon = ({ className = "w-8 h-8" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
);

const ShieldIcon = ({ className = "w-8 h-8" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);

const WindIcon = ({ className = "w-8 h-8" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59-3.41A2 2 0 1 1 14 8H2m15.59 3.59A2 2 0 1 1 19 15H2"/></svg>
);

const GemIcon = ({ className = "w-8 h-8" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>
);

const vastuTips = [
  { icon: HomeIcon, title: "Entrance & Living Room", description: "Place clear quartz near the entrance to invite positive energy. A citrine crystal in the living room attracts abundance and warmth.", crystals: "Clear Quartz, Citrine, Green Aventurine" },
  { icon: SunIcon, title: "Bedroom & Sleep", description: "Amethyst under your pillow promotes peaceful sleep. Rose quartz on your bedside table enhances love and harmony.", crystals: "Amethyst, Rose Quartz, Lepidolite" },
  { icon: CompassIcon, title: "North-East Direction", description: "The most auspicious direction in Vastu. Place a crystal pyramid or clear quartz cluster here for spiritual growth.", crystals: "Clear Quartz Pyramid, Selenite" },
  { icon: ShieldIcon, title: "Protection & EMF", description: "Black tourmaline near electronic devices protects against EMF radiation. Place at all four corners for complete protection.", crystals: "Black Tourmaline, Shungite, Obsidian" },
  { icon: WindIcon, title: "Office & Study", description: "Tiger eye on your desk enhances focus and determination. Fluorite helps with concentration and decision-making.", crystals: "Tiger Eye, Fluorite, Pyrite" },
  { icon: GemIcon, title: "Wealth & Prosperity", description: "Place a citrine crystal tree in the south-east direction to activate the wealth corner according to Vastu Shastra.", crystals: "Citrine, Pyrite, Green Jade" },
];

export default function VastuPage() {
  return (
    <div className="min-h-screen bg-[#06040a] pt-32 pb-24 text-foreground font-sans">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Vastu Header */}
        <div className="text-center mb-16">
          <span className="text-[10px] font-sans tracking-[0.35em] text-primary uppercase font-bold block mb-3">
            ✦ Sacred Placement ✦
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-4">
            Vastu <span className="shimmer-text italic font-normal">Guidance</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            Position minerals and crystals in accordance with traditional Vastu Shastra direction nodes to align spiritual harmonics and protect your workspace.
          </p>
          <div className="w-16 h-[1px] bg-primary/30 mx-auto mt-6" />
        </div>

        {/* Vastu Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {vastuTips.map((tip, i) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glass-card rounded-2xl p-6 border border-white/5 hover:border-primary/20 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/20 mb-5">
                  <tip.icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-foreground mb-2">{tip.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-6">{tip.description}</p>
              </div>
              <div className="pt-4 border-t border-white/5">
                <span className="text-[9px] tracking-widest text-primary font-bold uppercase block mb-1">Recommended Crystals</span>
                <p className="text-xs text-foreground font-medium font-serif">{tip.crystals}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Consultation Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-3xl p-8 md:p-12 text-center border border-white/5 relative overflow-hidden"
        >
          {/* Decorative Glowing Sphere */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full opacity-10 blur-3xl bg-primary/40 pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
              Need Personalized <span className="text-primary italic">Vastu Consultation?</span>
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed mb-8">
              Our Vastu Shastra experts analyze spatial flow and direction profiles to recommend customized crystal mapping tailored to your specific energetic objectives.
            </p>
            <a
              href="https://wa.me/919876543210?text=Hi!%20I%20need%20a%20Vastu%20consultation%20for%20crystal%20placement."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl px-8 py-3.5 text-xs font-bold tracking-widest uppercase transition-all duration-300 active:scale-95 shadow-lg shadow-primary/5"
            >
              Book Free Consultation
            </a>
          </div>
        </motion.div>

      </div>
    </div>
  );
}