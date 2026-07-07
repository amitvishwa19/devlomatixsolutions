'use client';

import React from "react";
import { motion } from "framer-motion";

// Inline SVG Icon components to completely bypass Next.js Turbopack lucide-react caching bugs
const ArrowUpRightIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
);

const igPhotos = [
  "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1603344797033-f0f4f587ab60?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=800&fit=crop"
];

const SiteInstagramFeed = () => {
  return (
    <section className="py-40 px-6 md:px-12 lg:px-24 relative overflow-hidden bg-background">
      {/* Decorative texture overlay */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')"
        }}
      />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-8 border-b border-white/5 pb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-8xl font-medium tracking-tighter max-w-xl leading-[0.85] font-serif text-foreground"
          >
            Connect
            <br />
            With The
            <br />
            <span className="italic font-light text-primary text-gold-gradient">Source.</span>
          </motion.h2>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6 flex flex-col items-start"
          >
            <p className="text-muted-foreground/80 text-sm max-w-[280px] border-l border-primary/30 pl-4 font-sans font-bold tracking-wider leading-relaxed">
              Follow our daily journey of discovery and alignment across the globe @crystalaura
            </p>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noreferrer" 
              className="inline-flex items-center justify-center whitespace-nowrap text-[10px] font-sans font-black tracking-widest uppercase bg-gold-gradient text-white rounded-full h-14 px-10 shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 border border-primary/15"
            >
              Instagram
            </a>
          </motion.div>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {igPhotos.map((imgUrl, i) => (
            <motion.a
              key={i}
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`group overflow-hidden rounded-3xl relative aspect-square shadow-xl border border-white/5 p-2 hover:border-primary/20 transition-all duration-500 ${
                i % 2 === 1 ? "lg:mt-12" : ""
              }`}
            >
              <div className="w-full h-full overflow-hidden rounded-2xl relative">
                <img 
                  src={imgUrl} 
                  alt={`Instagram image ${i + 1}`} 
                  className="w-full h-full object-cover transition-all duration-[1.5s] ease-out group-hover:scale-110 filter brightness-95"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-[#06040a]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[1.5px]">
                  <ArrowUpRightIcon className="w-10 h-10 text-white transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>

      </div>
    </section>
  );
};

export default SiteInstagramFeed;
