'use client';

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

// Inline SVG Icon components to completely bypass Next.js Turbopack lucide-react caching bugs
const SparklesIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.938A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.938l6.135 1.581a.5.5 0 0 1 0 .962L15.5 14.063A2 2 0 0 0 14.063 15.5L12.481 21.64a.5.5 0 0 1-.962 0z"/><path d="M20 3h.01"/><path d="M4 20h.01"/><path d="M18.5 18h.01"/><path d="M5.5 6h.01"/></svg>
);

const ArrowRightIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

const collections = [
  {
    title: "Crystal Bracelets",
    subtitle: "Sacred Wristwear",
    desc: "Elasticized beads designed to align personal energetic frequencies throughout the day.",
    img: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=700&fit=crop",
    link: "/shop?category=bracelets"
  },
  {
    title: "Healing Spheres",
    subtitle: "Harmonious Geometry",
    desc: "Polished spheres radiating calming energy equally in all directions of a space.",
    img: "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=600&h=700&fit=crop",
    link: "/shop?category=spheres"
  },
  {
    title: "Orgone Pyramids",
    subtitle: "Energetic Amplifiers",
    desc: "Metaphysical matrices crafted to clear environmental geopathic stress and EMF.",
    img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=700&fit=crop",
    link: "/shop?category=pyramids"
  }
];

const VibrantBanner = () => {
  return (
    <section className="py-24 px-6 relative bg-background overflow-hidden">
      {/* 1. Vibrant Crimson & Violet Banner */}
      <div className="max-w-7xl mx-auto mb-28">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl overflow-hidden py-16 px-8 md:px-16 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10"
          style={{
            background: 'linear-gradient(135deg, #1b0c2a 0%, #30071c 50%, #0d0917 100%)',
            boxShadow: '0 20px 50px -10px rgba(48,7,28,0.3)'
          }}
        >
          {/* Noise overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')]" />

          <div className="relative z-10 space-y-4 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-full text-primary text-[9px] font-sans font-black uppercase tracking-widest">
              <SparklesIcon className="w-3.5 h-3.5" />
              Special Vedic Blessing
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground font-medium leading-tight">
              Every crystal is purified with sacred Ganges water &amp; chanting.
            </h2>
            <p className="text-muted-foreground/80 text-xs font-light leading-relaxed max-w-md">
              We ensure your items arrive fully cleansed, active, and prepared to merge with your personal field.
            </p>
          </div>

          <Link href="/crystals" className="relative z-10 shrink-0">
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-gold-gradient text-white text-xs font-sans tracking-widest uppercase font-black px-8 py-4.5 rounded-full flex items-center gap-2 border border-primary/20 hover:shadow-2xl hover:shadow-primary/25 transition-all duration-300"
            >
              Cleansing Guide
              <ArrowRightIcon className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* 2. Collections Showcase */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary text-[10px] tracking-[0.35em] font-sans font-black uppercase mb-3">
            ✦ Sacred Treasures ✦
          </p>
          <h3 className="font-serif text-3xl md:text-5xl text-foreground">
            Explore <span className="text-gold-gradient italic font-normal">Our</span> Collections
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((col, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.15 }}
              className="glass-card rounded-2xl overflow-hidden border-white/5 hover:border-primary/25 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col group"
            >
              {/* Image box */}
              <div className="aspect-[4/5] overflow-hidden relative">
                <img 
                  src={col.img} 
                  alt={col.title} 
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105 filter brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                
                {/* Floating details inside image */}
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-[9px] tracking-[0.25em] text-primary font-sans font-black uppercase mb-1">{col.subtitle}</p>
                  <h4 className="font-serif text-2xl text-foreground font-medium">{col.title}</h4>
                </div>
              </div>

              {/* Description box */}
              <div className="p-6 flex-1 flex flex-col justify-between bg-[#0e0b17]/20">
                <p className="text-muted-foreground/80 text-xs leading-relaxed font-light mb-6">
                  {col.desc}
                </p>
                <Link href={col.link} className="inline-flex items-center gap-1.5 text-[10px] tracking-widest text-primary font-sans font-black uppercase group-hover:text-foreground transition-colors duration-300">
                  Shop Collection
                  <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VibrantBanner;
