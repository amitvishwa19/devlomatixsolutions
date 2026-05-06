"use client"
import React, { useRef } from "react";
import SEO from "./_components/SEO";
import { categories, testimonials } from "./_data/products";
import Link from "next/link";
import { MoveRight, Plus, Minus, ArrowUpRight } from "lucide-react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import CrystalOfTheDay from "./_components/CrystalOfTheDay";
import QuizSection from "./_components/QuizSection";
import ChakraDiagram from "./_components/ChakraDiagram";
import PersonalizedPicks from "./_components/PersonalizedPicks";
import RecentlyViewed from "./_components/RecentlyViewed";

const instagramImages = [
  "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1603344797033-f0f4f587ab60?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800&h=800&fit=crop",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=800&fit=crop",
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

const revealMask = {
  hidden: { clipPath: "inset(100% 0% 0% 0%)" },
  show: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
};

export default function HomePage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroImageY = useTransform(scrollYProgress, [0, 0.2], [0, 150]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

  return (
    <div ref={containerRef} className="bg-background text-foreground font-sans antialiased selection:bg-foreground selection:text-background transition-colors duration-500">
      <SEO
        title="Crystal Aura - Architectural Minerals"
        description="Exceptional ethically-sourced healing crystals and gemstones for modern spaces."
        path="/"
      />

      {/* Modern Scroll Progress Indicator */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[2px] bg-primary z-[100] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Hero Section - Polished Minimalist with Crystal Mesh Background */}
      <section className="relative min-h-[100vh] flex flex-col justify-center px-6 md:px-12 lg:px-24 overflow-hidden pt-20 crystal-mesh dark:bg-background dark:bg-none transition-all duration-700">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="lg:col-span-7"
          >
            <motion.div variants={fadeUp} className="mb-6 flex items-center gap-2 text-xs font-bold tracking-[0.3em] uppercase text-primary">
              <Plus className="w-3 h-3 animate-spin-slow" /> Based in India <Minus className="w-3 h-3" /> Shipping Worldwide
            </motion.div>
            
            <motion.h1 
              variants={fadeUp}
              className="text-[12vw] md:text-[10vw] lg:text-[9vw] font-medium tracking-[-0.04em] leading-[0.85] mb-8"
            >
              Earth's<br/>
              <span className="italic font-light text-accent">Finest</span> Essence.
            </motion.h1>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
              <Button asChild size="lg" className="rounded-full h-14 px-8 text-lg vibrant-gradient text-white border-none hover:opacity-90 transition-all shadow-lg hover:shadow-primary/20 group">
                <Link href="/shop" className="flex items-center">
                  Explore Collection
                  <ArrowUpRight className="w-6 h-6 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
              </Button>
              <p className="text-muted-foreground text-sm max-w-[280px] font-medium leading-relaxed border-l-2 border-primary/20 pl-4">
                Hand-selected architectural minerals and healing stones for the contemporary home.
              </p>
            </motion.div>
          </motion.div>

          <motion.div 
            variants={revealMask}
            initial="hidden"
            animate="show"
            className="lg:col-span-5 relative group"
          >
            <motion.div style={{ y: heroImageY, scale: heroScale }} className="aspect-[4/5] overflow-hidden rounded-sm bg-muted shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1545389336-cf090694435e?w=1000&h=1200&fit=crop" 
                alt="Amethyst Cluster" 
                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
              />
            </motion.div>
            <div className="absolute -bottom-6 -left-6 hidden md:block">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 rounded-full border border-primary/30 bg-background/80 backdrop-blur-md flex items-center justify-center text-[10px] tracking-widest uppercase font-bold p-4 text-center leading-none text-primary"
              >
                100% Authentic • Ethically Sourced •
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-[33%] w-[1px] h-full bg-primary/10 -z-10" />
        <div className="absolute top-[20%] left-0 w-full h-[1px] bg-primary/10 -z-10" />
      </section>

      {/* Featured Marquee - Vibrant Section */}
      <section className="py-40 vibrant-gradient text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
        <div className="px-6 md:px-12 lg:px-24 relative z-10">
          <div className="max-w-5xl">
            <motion.h2 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight"
            >
              We honor the <span className="italic font-medium text-primary-foreground">unpolished</span> beauty of the earth. Every stone is a structural masterpiece of nature.
            </motion.h2>
          </div>
        </div>
      </section>

      {/* Categories Grid - Revamped with Vibrant Touches */}
      <section className="py-40 px-6 md:px-12 lg:px-24 relative overflow-hidden">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-between items-end mb-24 relative z-10"
        >
          <div className="overflow-hidden">
            <motion.p 
              initial={{ y: "100%" }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-xs font-bold tracking-widest uppercase text-primary mb-4"
            >
              Curation 01
            </motion.p>
            <motion.h2 
              initial={{ y: "100%" }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-medium tracking-tighter"
            >
              Essential <span className="text-accent italic">Collections</span>
            </motion.h2>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-24 gap-x-12 relative z-10">
          {categories.slice(0, 3).map((cat, i) => (
            <motion.div
              key={cat.id}
              className={`md:col-span-${i === 0 ? '7' : '5'} ${i === 1 ? 'md:mt-40' : ''}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
            >
              <Link href={`/shop?category=${cat.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-muted mb-8 rounded-xl shadow-xl transition-shadow duration-500 group-hover:shadow-accent/20">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="bg-primary text-white text-[10px] font-bold px-4 py-1.5 uppercase tracking-widest rounded-full shadow-lg">
                      Explore
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-medium tracking-tight group-hover:text-primary transition-colors duration-500">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-[200px] leading-relaxed italic">{cat.description}</p>
                  </div>
                  <span className="text-sm font-bold tracking-tighter mt-1 text-primary/40">0{i+1}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Refined Functional Sections */}
      <div className="py-24 space-y-40 bg-secondary/20 transition-colors duration-500">
        <section className="px-6 md:px-12 lg:px-24">
          <CrystalOfTheDay />
        </section>
        
        <QuizSection />
        
        <section className="px-6 md:px-12 lg:px-24">
          <ChakraDiagram />
        </section>

        <PersonalizedPicks />
        <RecentlyViewed />
      </div>

      {/* Social - Modern Editorial Grid with Color */}
      <section className="py-40 px-6 md:px-12 lg:px-24 relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-8">
          <h2 className="text-5xl md:text-8xl font-medium tracking-tighter max-w-xl leading-[0.85]">
            Connect<br/>
            With The<br/>
            <span className="italic font-light text-accent">Source.</span>
          </h2>
          <div className="space-y-6">
            <p className="text-muted-foreground text-sm max-w-[200px] border-l-2 border-accent/30 pl-4 font-medium">Follow our journey of discovery across the globe @crystalaura</p>
            <Button asChild size="lg" className="rounded-full h-14 px-10 vibrant-gradient text-white shadow-xl hover:scale-105 transition-all active:scale-95">
              <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {instagramImages.map((img, i) => (
            <motion.a
              key={i}
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className={`group overflow-hidden rounded-2xl relative aspect-square shadow-lg ${i % 2 !== 0 ? 'lg:mt-12' : ''}`}
            >
              <img
                src={img}
                alt={`IG ${i + 1}`}
                className="w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <ArrowUpRight className="w-12 h-12 text-white" />
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Footer-like Branding with Gradient */}
      <footer className="py-24 border-t border-border px-6 md:px-12 lg:px-24 text-center overflow-hidden">
        <p className="text-[15vw] font-medium tracking-tighter opacity-10 select-none pointer-events-none gold-text-gradient animate-pulse">CRYSTAL AURA</p>
      </footer>
    </div>
  );
}
