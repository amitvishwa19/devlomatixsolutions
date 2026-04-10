'use client';
import { motion } from "framer-motion";
import { Navbar } from "../_components/Navbar";
import { Footer } from "../_components/Footer";
import { CTA } from "../_components/CTA";
import { Users, Target, Zap, Globe } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Customer First",
    desc: "Every feature we build starts with a real customer problem. We obsess over making WhatsApp marketing effortless.",
  },
  {
    icon: Zap,
    title: "Speed & Reliability",
    desc: "99.9% uptime, sub-second message delivery. Your campaigns run when they need to — every single time.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    desc: "We believe great customer experiences come from empowered teams working together seamlessly.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    desc: "From Mumbai to São Paulo, we help businesses connect with customers across 150+ countries.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32 mesh-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              About KonnectX
            </p>
            <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl lg:text-6xl">
              Making WhatsApp Work{" "}
              <span className="text-gradient-sun">For Business</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Founded in 2023, KonnectX is on a mission to help businesses of every size
              harness the power of WhatsApp — the world's most popular messaging platform —
              to engage customers, drive revenue, and deliver exceptional support.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-6 glass-card rounded-2xl p-8 sm:grid-cols-4"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            {[
              { value: "5,000+", label: "Businesses" },
              { value: "10M+", label: "Messages/Month" },
              { value: "150+", label: "Countries" },
              { value: "50+", label: "Team Members" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-extrabold text-gradient-sun">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Our <span className="text-gradient-sun">Values</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The principles that guide everything we build.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex gap-4 glass-card rounded-xl p-6"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <v.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{v.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTA />
      <Footer />
    </div>
  );
}
