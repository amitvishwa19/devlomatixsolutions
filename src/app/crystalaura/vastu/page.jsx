'use client';

import React from "react";
import { motion } from "framer-motion";
import { Compass, Home, Briefcase, Heart, Flame, Droplets, Wind, Mountain } from "lucide-react";

const vastuTips = [
  {
    icon: Home,
    direction: "North-East",
    title: "Entrance & Prayer Room",
    crystal: "Clear Quartz & Amethyst",
    tip: "Place clear quartz near the north-east entrance to invite positive energy. Amethyst in the prayer room enhances spiritual connection.",
  },
  {
    icon: Briefcase,
    direction: "North",
    title: "Career & Wealth",
    crystal: "Citrine & Green Aventurine",
    tip: "Keep citrine in the north zone of your home or office to attract financial abundance and career growth.",
  },
  {
    icon: Heart,
    direction: "South-West",
    title: "Relationships & Love",
    crystal: "Rose Quartz",
    tip: "Place rose quartz in pairs in the south-west bedroom corner to strengthen romantic relationships and harmony.",
  },
  {
    icon: Flame,
    direction: "South-East",
    title: "Energy & Vitality",
    crystal: "Carnelian & Red Jasper",
    tip: "The fire zone benefits from carnelian to boost vitality, motivation, and physical energy in the household.",
  },
  {
    icon: Droplets,
    direction: "North-East",
    title: "Health & Healing",
    crystal: "Aquamarine & Moonstone",
    tip: "Place healing stones in the water element zone for overall health improvement and emotional balance.",
  },
  {
    icon: Wind,
    direction: "North-West",
    title: "Travel & Movement",
    crystal: "Lapis Lazuli",
    tip: "Lapis lazuli in the north-west supports beneficial travel, networking, and helpful people entering your life.",
  },
  {
    icon: Mountain,
    direction: "South",
    title: "Fame & Recognition",
    crystal: "Tiger's Eye & Pyrite",
    tip: "Tiger's eye in the south zone builds confidence, courage, and attracts recognition in your field.",
  },
  {
    icon: Compass,
    direction: "Center",
    title: "Brahmasthan (Center)",
    crystal: "Selenite & Crystal Sphere",
    tip: "Keep the center of your home clean and place a selenite tower or crystal sphere to radiate balanced energy throughout.",
  },
];

export default function CrystalAuraVastuPage() {
  return (
    <div className="min-h-screen bg-transparent pt-12 pb-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-primary text-[10px] tracking-[0.3em] uppercase mb-4 font-sans font-black">
            ✦ Ancient Wisdom ✦
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-foreground mb-6">
            <span className="text-gold-gradient font-semibold">Vastu</span> & Crystals
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Align your living spaces with cosmic energy using the ancient science of Vastu Shastra combined with the power of healing crystals.
          </p>
          <div className="section-divider w-48 mx-auto mt-8" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {vastuTips.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="glass-card border-white/5 bg-white/[0.02] rounded-[2rem] p-10 hover:border-primary/20 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -z-10 group-hover:bg-primary/10 transition-colors" />
              <div className="flex items-start gap-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="font-serif text-2xl lg:text-3xl text-foreground font-semibold">{item.title}</h3>
                    <span className="text-[10px] px-3 py-1 rounded-full bg-primary/10 text-primary uppercase font-black tracking-widest">{item.direction}</span>
                  </div>
                  <p className="text-primary text-[10px] uppercase tracking-[0.2em] font-black mb-6">
                    Resonates with: {item.crystal}
                  </p>
                  <p className="text-muted-foreground font-light leading-relaxed text-base italic">
                    "{item.tip}"
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-24 glass-card rounded-[2.5rem] p-12 text-center max-w-4xl mx-auto bg-primary/5 border-primary/10"
        >
            <Compass className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="font-serif text-3xl text-foreground mb-4">Dedicated Consultation</h2>
            <p className="text-muted-foreground font-light max-w-xl mx-auto mb-8">
                Need personalized guidance for your home or office? Our Vastu experts can help you select and place the perfect crystals for your specific needs.
            </p>
            <div className="flex justify-center gap-4">
               <button className="bg-gold-gradient text-white px-8 py-5 rounded-2xl font-sans tracking-widest uppercase font-black text-[10px] hover:opacity-90 transition-all shadow-xl">
                   Book Consultation
               </button>
            </div>
        </motion.div>
      </div>
    </div>
  );
}
