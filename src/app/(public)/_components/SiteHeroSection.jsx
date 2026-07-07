'use client';

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

// Inline SVG Icon components to completely bypass Next.js Turbopack lucide-react caching bugs
const ArrowUpRightIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
);

const SiteHeroSection = () => {
  return (
    <section className="relative min-h-[100vh] flex flex-col justify-center px-6 md:px-12 lg:px-24 overflow-hidden pt-28 pb-16 transition-all duration-700">
      {/* Background fine grid and gradient overlay */}
      <div className="absolute inset-0 pointer-events-none -z-10 bg-gradient-to-b from-[#0c0a15] via-[#06040a] to-[#06040a]" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10 max-w-7xl mx-auto w-full">
        {/* Left Column: Visual copy & call to action */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6 inline-flex items-center gap-2 text-[10px] font-sans tracking-[0.35em] uppercase text-primary font-black bg-primary/5 px-4.5 py-2.5 rounded-full border border-primary/25 shadow-lg shadow-primary/5"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            BASED IN INDIA — SHIPPING WORLDWIDE
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="font-serif text-[11vw] md:text-[9vw] lg:text-[7vw] font-medium tracking-[-0.03em] leading-[0.85] mb-8 text-foreground"
          >
            Earth's
            <br />
            <span className="italic font-light text-gold-gradient shimmer-text">Finest</span> Essence.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-muted-foreground/80 text-sm md:text-base max-w-lg mb-10 font-light leading-relaxed"
          >
            Delicately hand-selected architectural minerals, Vedic-energized healing crystals, and sacred treasures curated to align your chakras, balance your home environment, and elevate your spiritual vibration.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 items-start sm:items-center w-full mb-12"
          >
            <Link
              href="/shop"
              className="inline-flex items-center justify-center whitespace-nowrap font-sans tracking-widest uppercase font-black text-xs focus-visible:outline-none bg-primary rounded-full h-15 px-10 bg-gold-gradient text-white border border-primary/20 hover:opacity-90 hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95 group shrink-0"
            >
              Explore Collection
              <ArrowUpRightIcon className="w-5 h-5 ml-2.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
            <p className="text-muted-foreground/60 text-xs max-w-[260px] font-sans font-bold tracking-widest uppercase border-l border-white/10 pl-4 py-1 leading-relaxed">
              ✦ 100% NATURAL STONES<br />✧ VEDIC ENERGIZED
            </p>
          </motion.div>

          {/* Core Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="grid grid-cols-3 gap-6 w-full border-t border-white/5 pt-8 font-sans"
          >
            <div>
              <p className="text-foreground text-sm font-black tracking-widest uppercase">9k+</p>
              <p className="text-muted-foreground text-[10px] uppercase tracking-widest mt-1">Spirits Aligned</p>
            </div>
            <div>
              <p className="text-foreground text-sm font-black tracking-widest uppercase">100%</p>
              <p className="text-muted-foreground text-[10px] uppercase tracking-widest mt-1">Ethical Source</p>
            </div>
            <div>
              <p className="text-foreground text-sm font-black tracking-widest uppercase">A+</p>
              <p className="text-muted-foreground text-[10px] uppercase tracking-widest mt-1">Vedic Rating</p>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Visual Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="lg:col-span-5 relative group w-full"
        >
          {/* Main image container */}
          <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-secondary/20 shadow-2xl border border-white/10 p-2.5 group-hover:border-primary/20 transition-all duration-700">
            <div className="w-full h-full overflow-hidden rounded-xl relative">
              <img
                src="https://images.unsplash.com/photo-1545389336-cf090694435e?w=1000&h=1250&fit=crop"
                alt="Amethyst Cluster on Rock"
                className="w-full h-full object-cover transition-all duration-[1.5s] ease-out group-hover:scale-105 filter brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
            </div>
          </div>
          
          {/* Floating authentic gold badge */}
          <div className="absolute -bottom-8 -left-8 hidden md:block">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 rounded-full border border-primary/20 bg-background/90 backdrop-blur-md flex items-center justify-center text-[9px] tracking-[0.2em] uppercase font-black p-5 text-center leading-tight text-primary shadow-2xl hover:border-primary/40 transition-colors"
              style={{ boxShadow: '0 10px 30px -10px rgba(220,160,40,0.2)' }}
            >
              100% Authentic • Ethically Sourced •
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SiteHeroSection;
