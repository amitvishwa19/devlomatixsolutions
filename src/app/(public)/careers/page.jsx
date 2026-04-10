'use client';
import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "../_components/Navbar";
import { Footer } from "../_components/Footer";
import { CTA } from "../_components/CTA";
import { MapPin, Clock, ArrowRight } from "lucide-react";

const openings = [
  { title: "Senior Backend Engineer", team: "Engineering", location: "Remote / Vadodara", type: "Full-time" },
  { title: "Product Designer", team: "Design", location: "Remote", type: "Full-time" },
  { title: "DevOps Engineer", team: "Engineering", location: "Vadodara, Gujarat", type: "Full-time" },
  { title: "Customer Success Manager", team: "Customer Success", location: "Remote / India", type: "Full-time" },
  { title: "Technical Writer", team: "Product", location: "Remote", type: "Part-time" },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative overflow-hidden py-24 sm:py-32 mesh-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Join Our Team</p>
            <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl lg:text-6xl">Build the Future of <span className="text-gradient-sun">Messaging</span></h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">We're a passionate team on a mission to transform how businesses communicate. Come build something meaningful.</p>
          </motion.div>
        </div>
      </section>
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-foreground">Open Positions</h2>
          <div className="mt-8 space-y-4">
            {openings.map((job, i) => (
              <motion.div key={job.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}>
                <Link href="/contact" className="group flex items-center justify-between glass-card rounded-xl p-6 transition-all hover:ring-2 hover:ring-primary/30" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div>
                    <span className="text-xs font-medium text-primary">{job.team}</span>
                    <h3 className="mt-1 text-lg font-bold text-foreground">{job.title}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.type}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
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
