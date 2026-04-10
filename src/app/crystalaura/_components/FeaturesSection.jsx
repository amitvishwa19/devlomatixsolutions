'use client';

import React from "react";
import { motion } from "framer-motion";
import { Gem, Shield, Truck, Heart } from "lucide-react";

const features = [
  {
    icon: Gem,
    title: "100% Authentic",
    description: "Every crystal is naturally sourced and certified genuine",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: Shield,
    title: "Energetically Cleansed",
    description: "Each stone is purified with sage and moonlight before shipping",
    gradient: "from-accent/20 to-accent/5",
  },
  {
    icon: Truck,
    title: "Pan-India Delivery",
    description: "Secure packaging with free shipping on orders above ₹999",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: Heart,
    title: "Vastu Guidance",
    description: "Complimentary consultation on crystal placement & energy flow",
    gradient: "from-accent/20 to-accent/5",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-28 px-6 relative overflow-hidden bg-background">
      {/* Subtle bg accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary text-[10px] tracking-[0.3em] uppercase mb-4 font-sans font-black">Why Choose Us</p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground">
            The <span className="text-gold-gradient font-semibold">Crystal Aura</span> Promise
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="glass-card rounded-2xl p-8 h-full text-center transition-all duration-500 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif text-xl text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm font-light leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
