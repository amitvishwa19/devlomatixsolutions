'use client';
import { motion } from "framer-motion";
import { Navbar } from "../_components/Navbar";
import { Footer } from "../_components/Footer";
import { Search, BookOpen, MessageCircle, Settings, CreditCard, Shield } from "lucide-react";

const categories = [
  { icon: BookOpen, title: "Getting Started", count: 12, desc: "Account setup, onboarding, and first steps with KonnectX." },
  { icon: MessageCircle, title: "Messaging", count: 18, desc: "Sending messages, templates, media, and broadcast campaigns." },
  { icon: Settings, title: "Integrations", count: 9, desc: "Connect KonnectX with your CRM, e-commerce, and tools." },
  { icon: CreditCard, title: "Billing & Plans", count: 7, desc: "Subscription management, invoices, and payment methods." },
  { icon: Shield, title: "Security & Compliance", count: 6, desc: "Data privacy, GDPR compliance, and account security." },
  { icon: Search, title: "Troubleshooting", count: 14, desc: "Common issues, error codes, and how to resolve them." },
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative overflow-hidden py-24 sm:py-32 mesh-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Support</p>
            <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl lg:text-6xl">
              Help <span className="text-gradient-sun">Center</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">Find answers, guides, and resources to get the most out of KonnectX.</p>
          </motion.div>
        </div>
      </section>
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, i) => (
              <motion.div key={cat.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }} className="glass-card rounded-xl p-6 cursor-pointer transition-all hover:ring-2 hover:ring-primary/30" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><cat.icon className="h-6 w-6" /></div>
                <h3 className="mt-4 text-lg font-bold text-foreground">{cat.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{cat.desc}</p>
                <span className="mt-3 inline-block text-xs font-medium text-primary">{cat.count} articles</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
