'use client';

import React from "react";
import { Home, Building2, Factory, Droplets, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  {
    icon: Home,
    title: "Residential Cleaning",
    description: "Perfect for rooftop solar panels on homes & villas. We handle 1kW to 10kW setups across 50+ Indian cities.",
    tag: "Most Popular",
  },
  {
    icon: Building2,
    title: "Commercial Cleaning",
    description: "Offices, hospitals, malls & schools — we clean large commercial installations with zero business downtime.",
    tag: "Enterprise",
  },
  {
    icon: Factory,
    title: "Solar Farm Cleaning",
    description: "Specialized robotic & high-capacity manual cleaning for multi-MW solar farms across Rajasthan, Gujarat & Maharashtra.",
    tag: "Industrial",
  },
  {
    icon: Droplets,
    title: "AMC & Preventive Care",
    description: "Annual Maintenance Contracts from ₹14/panel. Scheduled cleanings, inverter inspections & automated monitoring.",
    tag: "Best Value",
  },
];

export function Services() {
  return (
    <section id="sb-services" className="py-20 lg:py-28 relative overflow-hidden bg-background">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="container mx-auto px-4 md:px-8 pt-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-amber-500 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            <span className="w-6 h-px bg-amber-500" />
            Comprehensive Solutions
            <span className="w-6 h-px bg-amber-500" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
            Complete Solar Panel Care
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed font-normal">
            From rooftop residential setups to utility-scale solar farms — precision care for maximum clean energy returns.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative rounded-2xl border border-border/70 bg-card/80 p-7 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
                  <service.icon className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {service.tag}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-60 group-hover:opacity-100 group-hover:text-amber-500 transition-all" />
                </div>
              </div>

              <h3 className="font-heading text-xl font-bold text-foreground mb-2">{service.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
