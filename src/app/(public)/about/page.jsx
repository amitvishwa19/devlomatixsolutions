'use client';

import React from "react";
import { motion } from "framer-motion";

// Inline SVG Icons for About Page
const GemIcon = ({ className = "w-8 h-8" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>
);

const UsersIcon = ({ className = "w-8 h-8" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

const MapPinIcon = ({ className = "w-8 h-8" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
);

const AwardIcon = ({ className = "w-8 h-8" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
);

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#06040a] pt-32 pb-24 text-foreground font-sans">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* About Header */}
        <div className="text-center mb-16">
          <span className="text-[10px] font-sans tracking-[0.35em] text-primary uppercase font-bold block mb-3">
            ✦ Our Journey ✦
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-4">
            About <span className="shimmer-text italic font-normal">Crystal Aura</span>
          </h1>
          <div className="w-16 h-[1px] bg-primary/30 mx-auto mt-6" />
        </div>

        {/* Narrative Card */}
        <motion.div
          {...fadeUp}
          className="glass-card rounded-3xl p-8 md:p-16 mb-16 border border-white/5 relative overflow-hidden"
        >
          <blockquote className="font-serif text-xl md:text-2xl italic text-center text-muted-foreground leading-relaxed mb-12 border-b border-white/5 pb-8">
            "Crystal Aura was born from a deep love for the earth's hidden treasures and a sacred mission to heal world through frequency."
          </blockquote>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              We are a team of crystal healers, Vastu Shastra consultants, and spiritual practitioners based in Mumbai, India — dedicated to sourcing and cataloging only the most authentic and energetically charged gemstones.
            </p>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Our mission is simple: to make the healing power of crystals accessible to everyone. Whether you are a seasoned practitioner or just beginning your spiritual journey, we provide the tools and guidance you need.
            </p>
          </div>
        </motion.div>

        {/* Stat Blocks */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: GemIcon, value: "5,000+", label: "Crystals Sourced" },
            { icon: UsersIcon, value: "10,000+", label: "Happy Customers" },
            { icon: MapPinIcon, value: "500+", label: "Cities Served" },
            { icon: AwardIcon, value: "3+", label: "Years of Trust" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glass-card rounded-2xl p-6 text-center border border-white/5 hover:border-primary/20 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/20 mx-auto mb-4">
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="font-serif text-xl md:text-2xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold">{stat.label}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}