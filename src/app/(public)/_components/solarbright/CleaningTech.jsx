'use client';

import React from "react";
import { Zap, Bot, Droplets, Wind, Timer, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const NanoCoatingIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-28" fill="none">
    <rect x="20" y="70" width="160" height="30" rx="4" className="fill-amber-500/10 stroke-amber-500/30" strokeWidth="1.5" />
    <motion.path
      d="M20 70 Q60 65 100 70 T180 70"
      className="stroke-amber-400 fill-none"
      strokeWidth="2.5"
      animate={{ d: ["M20 70 Q60 65 100 70 T180 70", "M20 68 Q60 73 100 68 T180 68", "M20 70 Q60 65 100 70 T180 70"] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
    {[40, 80, 120, 160].map((cx, i) => (
      <motion.circle
        key={i}
        cx={cx}
        cy="40"
        r="7"
        className="fill-cyan-400/30 stroke-cyan-400"
        strokeWidth="1.5"
        animate={{ y: [0, 24, 0], scale: [1, 0.85, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
      />
    ))}
  </svg>
);

const RoboticIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-28" fill="none">
    <rect x="15" y="75" width="170" height="25" rx="3" className="fill-muted stroke-border" strokeWidth="1.5" />
    <motion.g animate={{ x: [0, 80, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
      <rect x="40" y="45" width="45" height="30" rx="6" className="fill-amber-500/20 stroke-amber-500" strokeWidth="2" />
      <circle cx="50" cy="75" r="5" className="fill-amber-500" />
      <circle cx="75" cy="75" r="5" className="fill-amber-500" />
      <line x1="50" y1="45" x2="45" y2="35" className="stroke-amber-400" strokeWidth="2" strokeLinecap="round" />
      <circle cx="45" cy="33" r="2.5" className="fill-amber-400" />
    </motion.g>
  </svg>
);

const AirJetIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-28" fill="none">
    <rect x="30" y="80" width="140" height="22" rx="3" className="fill-muted stroke-border" strokeWidth="1.5" />
    {[0, 1, 2].map((i) => (
      <motion.path
        key={i}
        d={`M${50 + i * 40} 25 C${60 + i * 40} 45, ${45 + i * 40} 60, ${55 + i * 40} 80`}
        className="stroke-cyan-400/50 fill-none"
        strokeWidth="2"
        strokeDasharray="6 4"
        animate={{ strokeDashoffset: [0, -20] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear", delay: i * 0.2 }}
      />
    ))}
  </svg>
);

const DIWaterIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-28" fill="none">
    <rect x="25" y="75" width="150" height="25" rx="3" className="fill-muted stroke-border" strokeWidth="1.5" />
    {[50, 90, 130].map((cx, i) => (
      <motion.path
        key={i}
        d={`M${cx} 30 C${cx - 10} 45, ${cx - 12} 60, ${cx} 60 C${cx + 12} 60, ${cx + 10} 45, ${cx} 30 Z`}
        className="fill-cyan-400/25 stroke-cyan-400"
        strokeWidth="1.5"
        animate={{ y: [0, 15, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
      />
    ))}
  </svg>
);

const ScheduleIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-28" fill="none">
    <circle cx="100" cy="60" r="38" className="stroke-amber-500/30 fill-amber-500/5" strokeWidth="2" />
    <circle cx="100" cy="60" r="3" className="fill-amber-500" />
    <motion.line
      x1="100"
      y1="60"
      x2="100"
      y2="35"
      className="stroke-amber-500"
      strokeWidth="2.5"
      strokeLinecap="round"
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      style={{ transformOrigin: "100px 60px" }}
    />
    <motion.line
      x1="100"
      y1="60"
      x2="120"
      y2="60"
      className="stroke-cyan-400"
      strokeWidth="2"
      strokeLinecap="round"
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      style={{ transformOrigin: "100px 60px" }}
    />
  </svg>
);

const AntiStaticIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-28" fill="none">
    <rect x="30" y="65" width="140" height="30" rx="3" className="fill-muted stroke-border" strokeWidth="1.5" />
    <motion.path
      d="M30 65 Q100 15 170 65"
      className="stroke-amber-400/50 fill-amber-500/5"
      strokeWidth="2"
      strokeDasharray="6 4"
      animate={{ strokeDashoffset: [0, -20] }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    />
    {[60, 100, 140].map((x, i) => (
      <motion.circle
        key={i}
        cx={x}
        cy="40"
        r="3"
        className="fill-amber-400"
        animate={{ y: [0, -15, 0], opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
      />
    ))}
  </svg>
);

const methods = [
  {
    icon: Droplets,
    title: "Waterless Nano-Coating",
    description: "Hydrophobic surface barrier repels atmospheric dust & grime, reducing required cleanings by up to 40% with zero water waste.",
    tag: "Eco-Friendly",
    Illustration: NanoCoatingIllustration,
  },
  {
    icon: Bot,
    title: "Robotic Autonomous Cleaning",
    description: "Crawler robots traverse rooftop arrays with soft microfiber rollers. Zero glass scratches, zero water, and zero manual hazards.",
    tag: "Automated",
    Illustration: RoboticIllustration,
  },
  {
    icon: Wind,
    title: "High-Velocity Air Jet",
    description: "Directional air pulses dislodge fine particulates and desert dust without contacting anti-reflective optical coatings.",
    tag: "Non-Contact",
    Illustration: AirJetIllustration,
  },
  {
    icon: Droplets,
    title: "Deionized Pure Water Wash",
    description: "Multi-stage demineralized water leaves zero mineral deposits, limescale or streaks. Soft-brush agitates stubborn spots.",
    tag: "Spot-Free",
    Illustration: DIWaterIllustration,
  },
  {
    icon: Timer,
    title: "Smart Auto-Schedule Cycles",
    description: "IoT telemetry analyzes generation drops and weather alerts to automatically trigger cleaning right when needed.",
    tag: "Predictive",
    Illustration: ScheduleIllustration,
  },
  {
    icon: ShieldCheck,
    title: "Anti-Static Dust Shield",
    description: "Electrostatic neutralizers discharge surface capacitance, keeping glass dust-repellent for weeks after service.",
    tag: "Long-Lasting",
    Illustration: AntiStaticIllustration,
  },
];

export function CleaningTech() {
  return (
    <section id="sb-cleaning-tech" className="py-20 lg:py-28 relative overflow-hidden bg-background">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="container mx-auto px-4 md:px-8 pt-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-3">
            <Zap className="w-4 h-4" />
            Cutting-Edge Robotics & Chemistry
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-foreground mb-4">
            Advanced Cleaning Tech & Methods
          </h2>
          <p className="text-muted-foreground leading-relaxed font-normal text-base">
            We combine robotics, IoT sensors, and demineralized solutions to keep panels producing at peak efficiency without risking cell damage.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {methods.map((method, i) => (
            <motion.div
              key={method.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group relative bg-card border border-border/70 rounded-2xl overflow-hidden hover:border-amber-500/40 hover:shadow-lg transition-all"
            >
              <div className="bg-muted/30 border-b border-border/50 px-4 pt-4 pb-2 group-hover:bg-amber-500/5 transition-colors">
                <method.Illustration />
              </div>

              <div className="p-6 pt-4">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full mb-3">
                  {method.tag}
                </span>

                <h3 className="font-heading font-bold text-foreground text-lg mb-2 flex items-center gap-2">
                  <method.icon className="w-5 h-5 text-amber-500 shrink-0" />
                  {method.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{method.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 bg-card border border-border/70 rounded-full px-6 py-3 shadow-sm">
            <Bot className="w-5 h-5 text-amber-500" />
            <p className="text-xs text-muted-foreground">
              Our automated fleet has cleaned over <span className="font-bold text-foreground">2,00,000+</span> panels with zero glass scratch incidents.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CleaningTech;
