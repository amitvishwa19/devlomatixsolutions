'use client';
import { motion } from "framer-motion";
import { Navbar } from "../_components/Navbar";
import { Footer } from "../_components/Footer";
import { CTA } from "../_components/CTA";
import { Users, MessageSquare, Calendar, Trophy } from "lucide-react";

const highlights = [
  { icon: Users, value: "5,000+", label: "Community Members", desc: "Business owners, developers, and marketers sharing knowledge." },
  { icon: MessageSquare, value: "500+", label: "Monthly Discussions", desc: "Active conversations about WhatsApp marketing strategies." },
  { icon: Calendar, value: "Weekly", label: "Live Events", desc: "Webinars, AMAs, and workshops with industry experts." },
  { icon: Trophy, value: "100+", label: "Success Stories", desc: "Real case studies from community members worldwide." },
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative overflow-hidden py-24 sm:py-32 mesh-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Community</p>
            <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl lg:text-6xl">Join the <span className="text-gradient-sun">KonnectX</span> Community</h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">Connect with thousands of businesses using WhatsApp to grow. Share strategies, get help, and learn together.</p>
          </motion.div>
        </div>
      </section>
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((h, i) => (
              <motion.div key={h.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className="glass-card rounded-xl p-6 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><h.icon className="h-6 w-6" /></div>
                <p className="mt-4 text-2xl font-extrabold text-gradient-sun">{h.value}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{h.label}</p>
                <p className="mt-2 text-xs text-muted-foreground">{h.desc}</p>
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
