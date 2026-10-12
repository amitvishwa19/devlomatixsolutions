'use client';

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Zap } from "lucide-react";
import { toast } from "sonner";

const plans = [
  {
    name: "Lite",
    price: "₹7,194",
    period: "/Half Yearly",
    desc: "Zero markup on Meta conversation charges",
    features: [
      "3 Team Users included",
      "Shared Team Inbox",
      "Agent Transfer & Assignment",
      "Conversation Labels & Tags",
      "Contact Notes & Follow-up Reminders",
      "Unlimited Rich Media Templates",
      "Unlimited Marketing Campaigns",
      "Campaign Retargeting",
      "Basic Chat Automation (Welcome, OOO)",
      "Mobile App for Team Inbox",
    ],
    cta: "Select Lite Plan",
    popular: false,
  },
  {
    name: "Professional",
    price: "₹11,994",
    period: "/Half Yearly",
    desc: "Zero markup on Meta conversation charges",
    badge: "Most Popular For Scaling",
    features: [
      "5 Team Users included",
      "Everything in Lite Plan",
      "Drag-and-Drop Chatbot Builder",
      "Automated Follow-Up Sequences",
      "Carousel & Interactive Form Templates",
      "Campaign Auto-Pause on Spam Filter",
      "Round Robin Intelligent Chat Assignment",
      "Lead Management & Conversion CRM",
      "REST Template Sending API",
      "Shopify & WooCommerce Integrations",
      "Guided Meta Verification & FB Approval",
    ],
    cta: "Select Professional",
    popular: true,
  },
  {
    name: "Enterprise / Premium",
    price: "₹17,994",
    period: "/Half Yearly",
    desc: "Zero markup on Meta conversation charges",
    badge: "Complete Omnichannel Suite",
    features: [
      "10 Team Users included",
      "Everything in Professional Plan",
      "Unlimited Active Chatbot Flows",
      "Direct Product Catalog & Native Checkout",
      "Priority Lead Scoring & Distribution",
      "Full Webhook Event Streaming & REST API",
      "Agent Performance & Response Analytics",
      "1-on-1 Strategy Consultation with Experts",
      "Guaranteed 2-Hour SLA Dedicated Support",
      "Dedicated Onboarding & Account Manager",
    ],
    cta: "Select Premium Plan",
    popular: false,
  },
];

export function Pricing() {
  const handleSelectPlan = (planName) => {
    toast.success(`You selected ${planName} plan! Our onboarding team will assist you.`);
    const ctaSection = document.getElementById("kx-cta");
    if (ctaSection) {
      ctaSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="kx-pricing" className="relative py-20 sm:py-28 mesh-bg">
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
            Straightforward Investment
          </p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl text-foreground">
            Simple, <span className="text-gradient-sun">Transparent Pricing</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            No hidden markups. You pay Meta standard conversation rates directly with transparent platform software tiers.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 25, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`relative flex flex-col rounded-3xl p-7 sm:p-8 transition-all duration-300 ${
                plan.popular
                  ? "glass-card ring-2 ring-primary/60 shadow-2xl scale-[1.02]"
                  : "glass-card hover:border-primary/30"
              }`}
              style={{ boxShadow: plan.popular ? "var(--shadow-glow)" : "var(--shadow-card)" }}
            >
              {plan.popular && (
                <div 
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-extrabold text-white shadow-md flex items-center gap-1.5"
                  style={{ background: "var(--gradient-sun)" }}
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Most Popular
                </div>
              )}

              <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-extrabold text-gradient-sun">{plan.price}</span>
                <span className="text-xs sm:text-sm text-muted-foreground font-medium">{plan.period}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{plan.desc}</p>

              {plan.badge && (
                <div className="mt-4 flex items-center gap-2">
                  <span 
                    className="rounded-lg px-2.5 py-1 text-[11px] font-bold text-white" 
                    style={{ background: "var(--gradient-sun)" }}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              <ul className="mt-6 flex-1 space-y-3 pt-4 border-t border-border/40">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-4">
                <Button
                  onClick={() => handleSelectPlan(plan.name)}
                  className="w-full font-bold h-11 text-sm rounded-xl cursor-pointer"
                  variant={plan.popular ? "default" : "outline"}
                  style={plan.popular ? { background: "var(--gradient-sun)", color: "#fff" } : undefined}
                >
                  {plan.cta}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
