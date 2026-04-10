'use client';
import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "../_components/Navbar";
import { Footer } from "../_components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users } from "lucide-react";

const upcoming = [
  { title: "WhatsApp Marketing Masterclass 2026", date: "April 25, 2026", time: "2:00 PM IST", speakers: "Raj Patel, Head of Growth", spots: 120 },
  { title: "Building AI Chatbots for WhatsApp", date: "May 8, 2026", time: "3:00 PM IST", speakers: "Priya Sharma, AI Lead", spots: 85 },
];

const past = [
  { title: "E-commerce on WhatsApp: From Zero to ₹1Cr", date: "March 15, 2026", attendees: 340 },
  { title: "GDPR & WhatsApp: Compliance Made Simple", date: "February 28, 2026", attendees: 210 },
  { title: "Abandoned Cart Recovery Strategies", date: "February 12, 2026", attendees: 285 },
];

export default function WebinarsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative overflow-hidden py-24 sm:py-32 mesh-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Learn & Grow</p>
            <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl lg:text-6xl"><span className="text-gradient-sun">Webinars</span></h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">Live sessions and recordings from WhatsApp marketing experts. Learn strategies that drive real results.</p>
          </motion.div>
        </div>
      </section>
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-foreground">Upcoming Webinars</h2>
          <div className="mt-8 space-y-4">
            {upcoming.map((w, i) => (
              <motion.div key={w.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className="glass-card rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ boxShadow: "var(--shadow-card)" }}>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{w.title}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{w.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{w.time}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{w.spots} spots left</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Speaker: {w.speakers}</p>
                </div>
                <Button size="sm" style={{ background: "var(--gradient-sun)" }} asChild><Link href="/contact">Register</Link></Button>
              </motion.div>
            ))}
          </div>

          <h2 className="mt-16 text-2xl font-extrabold text-foreground">Past Recordings</h2>
          <div className="mt-8 space-y-4">
            {past.map((w, i) => (
              <motion.div key={w.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }} className="glass-card rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ boxShadow: "var(--shadow-card)" }}>
                <div>
                  <h3 className="font-bold text-foreground">{w.title}</h3>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{w.date}</span><span>·</span><span>{w.attendees} attendees</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">Watch Recording</Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
