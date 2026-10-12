'use client';

import React, { useEffect, useRef, useState } from "react";
import { motion, animate } from "framer-motion";
import { MessageCircle, Users, Building2, Globe } from "lucide-react";
import { useLanguage } from "./use-language";

const stats = [
  { icon: MessageCircle, value: 50, suffix: "M+", labelKey: "stats.messages", description: "Across global campaigns monthly" },
  { icon: Users, value: 10, suffix: "K+", labelKey: "stats.businesses", description: "Growing businesses every single day" },
  { icon: Building2, value: 25, suffix: "+", labelKey: "Industries Served", description: "From direct e-commerce to healthcare" },
  { icon: Globe, value: 99.9, suffix: "%", labelKey: "stats.uptime", description: "Enterprise high-availability SLA" },
];

function AnimatedNumber({ value, suffix, inView }) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const isDecimal = value % 1 !== 0;
    const controls = animate(0, value, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(isDecimal ? v.toFixed(1) : Math.floor(v).toString()),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span className="text-3xl sm:text-4xl font-extrabold text-gradient-sun">
      {display}{suffix}
    </span>
  );
}

export function Stats() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="kx-stats" ref={ref} className="relative py-20 sm:py-28 mesh-bg">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary">
            Proven Performance
          </p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl text-foreground">
            Trusted by <span className="text-gradient-sun">Thousands</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Powering mission-critical WhatsApp communication for leading enterprises and fast-growing startups.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.description}
              initial={{ opacity: 0, y: 25, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="glass-card rounded-2xl p-6 sm:p-8 text-center transition-all duration-300 hover:border-primary/30"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div 
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg" 
                style={{ background: "var(--gradient-sun)" }}
              >
                <stat.icon className="h-7 w-7 text-white" />
              </div>
              <AnimatedNumber value={stat.value} suffix={stat.suffix} inView={inView} />
              <p className="mt-2 text-base font-bold text-foreground">
                {stat.labelKey.startsWith("stats.") ? t(stat.labelKey) : stat.labelKey}
              </p>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
