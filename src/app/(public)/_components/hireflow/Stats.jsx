'use client';

import React from "react";
import { motion } from "framer-motion";

const stats = [
  { value: "10,000+", label: "Companies Trust Us" },
  { value: "2M+", label: "Candidates Processed" },
  { value: "40%", label: "Faster Time-to-Hire" },
  { value: "98%", label: "Customer Satisfaction" },
];

export function Stats() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-border/70 shadow-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="space-y-1.5"
              >
                <div className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-300">
                  {stat.value}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wider">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Stats;
