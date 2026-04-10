'use client';
import { motion, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, Users, Building2, Globe } from "lucide-react";

const stats = [
  { icon: MessageCircle, value: 50, suffix: "M+", label: "Messages Delivered", description: "Across all campaigns monthly" },
  { icon: Users, value: 10, suffix: "K+", label: "Businesses Trust Us", description: "Growing every single day" },
  { icon: Building2, value: 25, suffix: "+", label: "Industries Served", description: "From e-commerce to healthcare" },
  { icon: Globe, value: 99.9, suffix: "%", label: "Uptime Guarantee", description: "Enterprise-grade reliability" },
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
    <span className="text-4xl font-extrabold text-gradient-sun sm:text-5xl">
      {display}{suffix}
    </span>
  );
}

export function Stats() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative py-20 sm:py-28 mesh-bg">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            By The Numbers
          </p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl">
            Trusted by <span className="text-gradient-sun">Thousands</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powering WhatsApp communication for businesses across the globe.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass-card rounded-2xl p-8 text-center"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: "var(--gradient-sun)" }}>
                <stat.icon className="h-7 w-7 text-primary-foreground" />
              </div>
              <AnimatedNumber value={stat.value} suffix={stat.suffix} inView={inView} />
              <p className="mt-2 text-base font-semibold text-foreground">{stat.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
