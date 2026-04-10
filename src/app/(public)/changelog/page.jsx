'use client';
import { motion } from "framer-motion";
import { Navbar } from "../_components/Navbar";
import { Footer } from "../_components/Footer";
import { Sparkles, Bug, Zap } from "lucide-react";

const entries = [
  { date: "April 2, 2026", version: "v3.4.0", type: "feature", title: "AI-Powered Message Suggestions", desc: "Smart reply suggestions powered by AI to help agents respond faster and more accurately." },
  { date: "March 18, 2026", version: "v3.3.2", type: "fix", title: "Webhook Delivery Improvements", desc: "Fixed intermittent delays in webhook event delivery. Improved retry logic for failed deliveries." },
  { date: "March 5, 2026", version: "v3.3.0", type: "feature", title: "Advanced Campaign Segmentation", desc: "Create hyper-targeted campaigns with advanced audience segmentation based on behavior, location, and engagement history." },
  { date: "February 20, 2026", version: "v3.2.1", type: "improvement", title: "Dashboard Performance Boost", desc: "50% faster dashboard loading times with optimized data fetching and caching." },
  { date: "February 8, 2026", version: "v3.2.0", type: "feature", title: "Multi-Language Template Builder", desc: "Create and manage message templates in 40+ languages with built-in translation suggestions." },
  { date: "January 22, 2026", version: "v3.1.0", type: "feature", title: "Shopify Integration", desc: "Native Shopify integration for order notifications, abandoned cart recovery, and customer support." },
];

const typeConfig = {
  feature: { icon: Sparkles, label: "New Feature", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  fix: { icon: Bug, label: "Bug Fix", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  improvement: { icon: Zap, label: "Improvement", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative overflow-hidden py-24 sm:py-32 mesh-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">What's New</p>
            <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl lg:text-6xl">
              <span className="text-gradient-sun">Changelog</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">Stay up to date with the latest features, improvements, and fixes.</p>
          </motion.div>
        </div>
      </section>
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="relative space-y-8 before:absolute before:left-4 before:top-0 before:h-full before:w-px before:bg-border sm:before:left-6">
            {entries.map((e, i) => {
              const cfg = typeConfig[e.type];
              return (
                <motion.div key={e.version} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }} className="relative pl-12 sm:pl-16">
                  <div className="absolute left-2 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary sm:left-4 sm:h-5 sm:w-5"><div className="h-2 w-2 rounded-full bg-primary-foreground" /></div>
                  <div className="glass-card rounded-xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{e.date}</span><span>·</span><span className="font-mono">{e.version}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}><cfg.icon className="h-3 w-3" />{cfg.label}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-foreground">{e.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{e.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
