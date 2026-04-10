'use client';
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";

const stats = [
  { value: "10M+", label: "Messages Sent" },
  { value: "5,000+", label: "Businesses" },
  { value: "99.9%", label: "Uptime" },
  { value: "150+", label: "Countries" },
];

export function Hero() {
  const heroDashboard = "/hero-dashboard.png";

  return (
    <section className="relative overflow-hidden bg-background mesh-bg">
      {/* Glow orbs */}
      <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-primary/3 blur-[100px]" />

      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }} />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
              <MessageCircle className="h-3.5 w-3.5" />
              Official WhatsApp Business API Partner
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-foreground">Grow Your Business on </span>
              <span className="text-gradient-sun">WhatsApp Business API Platform</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Send bulk campaigns, automate conversations with no-code chatbots,
              and convert leads — all from a single powerful platform.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/pricing">
                <Button size="lg" className="gap-2 text-base font-semibold w-full" style={{ background: "var(--gradient-sun)" }}>
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="gap-2 text-base border-border hover:bg-muted w-full">
                  Book a Demo
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:gap-6">
              {["No credit card required", "7-day free trial", "Cancel anytime"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right column — dashboard image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative mx-auto w-full max-w-lg lg:mx-0"
          >
            <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl" />
            <img
              src={heroDashboard}
              alt="KonnectX WhatsApp Business API Dashboard"
              className="relative w-full rounded-2xl"
              style={{ boxShadow: "var(--shadow-glow)" }}
            />
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 grid grid-cols-2 gap-6 glass-card rounded-2xl p-8 sm:grid-cols-4 lg:mt-24"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold text-gradient-sun">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
