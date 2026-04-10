'use client';
import { motion } from "framer-motion";
import { Navbar } from "../_components/Navbar";
import { Footer } from "../_components/Footer";
import { CTA } from "../_components/CTA";
import { TrendingUp, ArrowRight } from "lucide-react";

const studies = [
  { company: "FreshMart", industry: "E-commerce", result: "3x increase in repeat purchases", desc: "FreshMart used KonnectX to automate order updates and personalized product recommendations, driving a 3x boost in customer retention.", metrics: ["300% more repeat orders", "45% open rate on campaigns", "2min avg response time"] },
  { company: "HealthFirst Clinic", industry: "Healthcare", result: "60% fewer no-shows", desc: "Automated appointment reminders and follow-ups via WhatsApp reduced missed appointments by 60% and improved patient satisfaction.", metrics: ["60% reduction in no-shows", "92% patient satisfaction", "15hrs/week saved"] },
  { company: "StyleHub", industry: "Fashion Retail", result: "₹25L in recovered carts", desc: "StyleHub's abandoned cart recovery campaigns via WhatsApp recovered ₹25 lakhs in revenue within the first quarter.", metrics: ["₹25L recovered revenue", "28% cart recovery rate", "4.8x ROI on campaigns"] },
  { company: "EduLearn Academy", industry: "Education", result: "85% engagement rate", desc: "Course updates, assignment reminders, and parent communication all automated through KonnectX WhatsApp API.", metrics: ["85% message engagement", "50% fewer support calls", "98% delivery rate"] },
];

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative overflow-hidden py-24 sm:py-32 mesh-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Success Stories</p>
            <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl lg:text-6xl">
              Case <span className="text-gradient-sun">Studies</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">Real results from businesses that transformed their customer communication with KonnectX.</p>
          </motion.div>
        </div>
      </section>
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          {studies.map((s, i) => (
            <motion.div key={s.company} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className="glass-card rounded-xl p-8" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex flex-wrap items-center gap-2 text-xs"><span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">{s.industry}</span></div>
              <h3 className="mt-3 text-xl font-bold text-foreground">{s.company} — {s.result}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {s.metrics.map((m) => (<span key={m} className="inline-flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-foreground"><TrendingUp className="h-3 w-3 text-primary" />{m}</span>))}
              </div>
              <button className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"><span>Read Full Story</span><ArrowRight className="h-3 w-3" /></button>
            </motion.div>
          ))}
        </div>
      </section>
      <CTA />
      <Footer />
    </div>
  );
}
