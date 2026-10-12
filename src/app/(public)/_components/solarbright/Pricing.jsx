'use client';

import React from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const plans = [
  {
    name: "Basic Clean",
    price: "₹18",
    period: "per panel",
    description: "Perfect for one-time or emergency cleaning needs",
    features: [
      "Professional demineralized wet cleaning",
      "Surface dirt & bird dropping removal",
      "Visual crack and hotspot inspection",
      "Same-day or next-day visit",
    ],
    popular: false,
    cta: "Select Basic",
  },
  {
    name: "Standard Clean",
    price: "₹16",
    period: "per panel",
    description: "Ideal for regular bi-monthly residential maintenance",
    features: [
      "All Basic Clean features included",
      "Eco-friendly anti-static coating",
      "Inverter generation output verification",
      "Before & after photo documentation",
      "Priority seasonal scheduling",
    ],
    popular: true,
    cta: "Select Standard",
  },
  {
    name: "AMC Annual Plan",
    price: "₹14",
    period: "per panel",
    description: "Lowest per-panel price with year-round peace of mind",
    features: [
      "All Standard Clean features included",
      "Lowest guaranteed per-panel rate",
      "Scheduled cleanings up to 12x/year",
      "Free emergency post-storm visits",
      "Weekly energy generation dashboard",
      "Dedicated solar engineer account manager",
    ],
    popular: false,
    cta: "Select AMC Plan",
  },
];

export function Pricing() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSelectPlan = (name) => {
    toast.success(`Selected ${name}. Let's schedule your site inspection!`);
    scrollTo("sb-contact");
  };

  return (
    <section id="sb-pricing" className="py-20 lg:py-28 relative overflow-hidden bg-background">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="container mx-auto px-4 md:px-8 pt-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-amber-500 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            <span className="w-6 h-px bg-amber-500" />
            Simple Pricing
            <span className="w-6 h-px bg-amber-500" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Clear, Transparent Investment
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            No hidden service fees or extra charges. Direct per-panel pricing tailored to your scale.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-7 max-w-5xl mx-auto items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl p-7 flex flex-col justify-between transition-all ${
                plan.popular
                  ? "border-2 border-amber-500 bg-card shadow-xl shadow-amber-500/10 lg:scale-105"
                  : "border border-border/70 bg-card hover:border-amber-500/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-amber-500 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="font-heading text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>

                <div className="my-6">
                  <span className="font-heading text-5xl font-extrabold text-amber-500">{plan.price}</span>
                  <span className="text-xs ml-2 text-muted-foreground uppercase tracking-wider">{plan.period}</span>
                </div>

                <ul className="space-y-3 pt-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-xs text-foreground/90">
                      <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => handleSelectPlan(plan.name)}
                className={`w-full rounded-xl h-11 text-xs font-bold uppercase tracking-wider cursor-pointer ${
                  plan.popular
                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20"
                    : "border-border hover:bg-muted"
                }`}
                variant={plan.popular ? "default" : "outline"}
              >
                <span>{plan.cta}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Pricing;
