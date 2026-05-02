'use client';

import React from "react";
import { motion } from "framer-motion";
import { Gem, Users, MapPin, Award } from "lucide-react";
import FeaturesSection from "../_components/FeaturesSection";
import TestimonialSection from "../_components/TestimonialSection";

const stats = [
  { icon: Gem, value: "5,000+", label: "Crystals Sold" },
  { icon: Users, value: "2,500+", label: "Happy Customers" },
  { icon: MapPin, value: "500+", label: "Cities Delivered" },
  { icon: Award, value: "100%", label: "Authentic Stones" },
];

export default function CrystalAuraAboutPage() {
  return (
    <div className="min-h-screen bg-transparent pt-12 overflow-hidden">
      <div className="pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <p className="text-primary text-xs font-medium mb-4">
              ✦ Our Journey ✦
            </p>
            <h1 className="font-serif text-5xl md:text-7xl text-foreground mb-6">
              About <span className="text-gold-gradient font-semibold">Crystal Aura</span>
            </h1>
            <div className="section-divider w-48 mx-auto mt-8" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="glass-card rounded-[2.5rem] p-10 md:p-16 mb-20 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] -z-10 group-hover:bg-primary/10 transition-colors" />
            <div className="max-w-4xl mx-auto">
                <p className="text-foreground font-serif text-3xl md:text-4xl italic leading-tight mb-12 text-center">
                    "Crystal Aura was born from a deep love for the earth's hidden treasures and a sacred mission to heal world through frequency."
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <p className="text-muted-foreground font-light leading-relaxed text-lg">
                        We are a team of crystal healers, Vastu consultants, and spiritual practitioners based in Mumbai, India — dedicated to bringing you the most authentic and energetically powerful gemstones. Every crystal in our collection is hand-selected from trusted mines and suppliers across India, Brazil, Madagascar, and beyond.
                    </p>
                    <p className="text-muted-foreground font-light leading-relaxed text-lg">
                        Our mission is simple: to make the healing power of crystals accessible to everyone. Whether you're a seasoned practitioner or just beginning your spiritual journey, we're here to guide you with expert Vastu advice and personalized crystal recommendations to align your home and soul.
                    </p>
                </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center glass-card border-white/5 bg-white/[0.02] rounded-3xl p-10 hover:border-primary/20 transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="font-serif text-4xl text-gold-gradient font-bold mb-2">{stat.value}</p>
                <p className="text-muted-foreground/40 text-xs font-medium leading-tight">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <FeaturesSection />
      <div className="my-12" />
      <TestimonialSection />
    </div>
  );
}
