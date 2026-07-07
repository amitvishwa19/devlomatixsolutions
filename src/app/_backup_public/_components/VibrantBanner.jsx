'use client';

import React from "react";
import { motion } from "framer-motion";

const VibrantBanner = () => {
  return (
    <section className="py-40 text-white overflow-hidden relative select-none" style={{
      background: "linear-gradient(135deg, #0b071e 0%, #200f3c 45%, #421b2d 100%)"
    }}>
      {/* Texture overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')"
        }}
      />
      
      {/* Decorative ambient spots */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
      
      <div className="px-6 md:px-12 lg:px-24 relative z-10 max-w-7xl mx-auto w-full">
        <div className="max-w-5xl">
          <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight font-serif"
          >
            We honor the <span className="italic font-medium text-primary text-gold-gradient">unpolished</span> beauty of the earth. Every stone is a structural masterpiece of nature.
          </motion.h2>
        </div>
      </div>
    </section>
  );
};

export default VibrantBanner;
