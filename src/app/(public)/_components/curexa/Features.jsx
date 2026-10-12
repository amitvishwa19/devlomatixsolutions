'use client';

import React from "react";
import { motion } from "framer-motion";
import { Shield, Clock, Users, Award, HeartPulse, Smartphone } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "100% Data Security",
    desc: "End-to-end encrypted medical records with automated multi-zone cloud replication and strict HIPAA compliance."
  },
  {
    icon: Clock,
    title: "Always Available",
    desc: "Cloud-native infrastructure ensuring zero downtime for emergency departments, ICU admissions, and midnight shifts."
  },
  {
    icon: Users,
    title: "Multi-Role Collaboration",
    desc: "Seamless synchronization between consulting doctors, resident nurses, pharmacists, and billing cashiers."
  },
  {
    icon: Award,
    title: "NABH Ready Templates",
    desc: "Built-in clinical documentation, consent forms, and audit trails conforming directly to NABH accreditation guidelines."
  },
  {
    icon: Smartphone,
    title: "Mobile App for Doctors",
    desc: "Doctors can view scheduled appointments, examine past lab reports, and sign off prescriptions from any smartphone."
  },
  {
    icon: HeartPulse,
    title: "Smart Clinical Alerts",
    desc: "Intelligent prompts alerting practitioners to patient drug allergies, dosage conflicts, and abnormal vital signs."
  }
];

export function Features() {
  return (
    <section id="cx-features" className="py-20 lg:py-28">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
            Why Healthcare Leaders Choose Curexa
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Engineered for Zero Downtime &{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 font-extrabold">
              Complete Patient Safety
            </span>
          </h2>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            Healthcare operations can never pause. Our platform is built with high availability and clinical accuracy at its core.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="glass-card rounded-2xl p-7 border border-border/60 hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
