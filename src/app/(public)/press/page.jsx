'use client';
import { motion } from "framer-motion";
import { Navbar } from "../_components/Navbar";
import { Footer } from "../_components/Footer";
import { ExternalLink } from "lucide-react";

const pressItems = [
  { date: "March 2026", title: "KonnectX Raises Series A to Expand WhatsApp Business API Platform", source: "TechCrunch", excerpt: "KonnectX, the WhatsApp Business API platform, has raised funding to accelerate growth across emerging markets." },
  { date: "February 2026", title: "How KonnectX is Democratizing Business Messaging in India", source: "YourStory", excerpt: "A deep dive into how KonnectX is making WhatsApp marketing accessible to businesses of all sizes." },
  { date: "January 2026", title: "Top 10 WhatsApp Business API Providers for 2026", source: "G2 Research", excerpt: "KonnectX featured as a top-rated WhatsApp Business API provider with highest customer satisfaction scores." },
  { date: "December 2025", title: "KonnectX Partners with Shopify for Seamless E-commerce Messaging", source: "Business Wire", excerpt: "New integration enables Shopify merchants to automate order updates and marketing via WhatsApp." },
];

export default function PressPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative overflow-hidden py-24 sm:py-32 mesh-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Newsroom</p>
            <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl lg:text-6xl">
              <span className="text-gradient-sun">Press</span> & Media
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">Latest news, press releases, and media coverage about KonnectX.</p>
          </motion.div>
        </div>
      </section>
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">
          {pressItems.map((item, i) => (
            <motion.article key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }} className="glass-card rounded-xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><span>{item.date}</span><span>·</span><span className="font-medium text-primary">{item.source}</span></div>
              <h3 className="mt-2 text-lg font-bold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.excerpt}</p>
              <button className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"><span>Read More</span><ExternalLink className="h-3 w-3" /></button>
            </motion.article>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
