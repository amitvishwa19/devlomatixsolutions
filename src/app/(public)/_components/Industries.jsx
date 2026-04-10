'use client';
import { motion } from "framer-motion";
import {
  ShoppingBag, GraduationCap, Heart, Building2,
  Plane, UtensilsCrossed,
} from "lucide-react";

const industries = [
  {
    icon: ShoppingBag,
    title: "E-Commerce",
    desc: "Recover abandoned carts, send order updates, and drive repeat purchases with personalized offers.",
  },
  {
    icon: GraduationCap,
    title: "Education",
    desc: "Automate admissions, share course updates, and engage students with interactive learning bots.",
  },
  {
    icon: Heart,
    title: "Healthcare",
    desc: "Send appointment reminders, share reports, and provide 24/7 patient support on WhatsApp.",
  },
  {
    icon: Building2,
    title: "Real Estate",
    desc: "Share property listings, schedule site visits, and nurture leads through automated follow-ups.",
  },
  {
    icon: Plane,
    title: "Travel & Hospitality",
    desc: "Send booking confirmations, travel itineraries, and collect feedback — all via WhatsApp.",
  },
  {
    icon: UtensilsCrossed,
    title: "Food & Restaurant",
    desc: "Take orders, send delivery updates, and run promotional campaigns to boost repeat orders.",
  },
];

export function Industries() {
  return (
    <section id="industries" className="relative py-24 sm:py-32 mesh-bg">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Industry Solutions
          </p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl">
            Built for <span className="text-gradient-sun">Every Industry</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Whether you're in retail, healthcare, or education — KonnectX adapts to your unique business needs.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((ind, i) => (
            <motion.div
              key={ind.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20, y: 20 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group flex gap-4 glass-card rounded-xl p-6 transition-all duration-300 hover:border-primary/20"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ind.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{ind.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{ind.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
