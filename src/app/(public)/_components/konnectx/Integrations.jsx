'use client';

import React from "react";
import { motion } from "framer-motion";

const integrations = [
  "Shopify", "WooCommerce", "Salesforce", "HubSpot",
  "Zoho CRM", "Razorpay", "Stripe", "Google Sheets",
  "Zapier", "Freshdesk", "Zendesk", "Slack",
];

export function Integrations() {
  return (
    <section id="kx-integrations" className="relative overflow-hidden py-20 sm:py-28">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary">
            Ecosystem Connectivity
          </p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl text-foreground">
            Connect With Your{" "}
            <span className="text-gradient-sun">Favorite Tools</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Seamlessly synchronize leads, triggers, orders, and tickets across 50+ business applications.
          </p>
        </motion.div>

        {/* Marquee Banner */}
        <div className="relative mt-14 overflow-hidden py-4">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 sm:w-36 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 sm:w-36 bg-gradient-to-l from-background to-transparent" />

          <div className="flex animate-kx-marquee gap-5">
            {[...integrations, ...integrations].map((name, i) => (
              <div
                key={`${name}-${i}`}
                className="flex h-16 min-w-[170px] items-center justify-center glass-card rounded-2xl px-6 border border-border/40 transition-all hover:border-primary/50"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <span className="text-sm font-bold text-foreground tracking-tight">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
