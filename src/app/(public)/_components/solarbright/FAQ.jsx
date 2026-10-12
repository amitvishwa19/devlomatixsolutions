'use client';

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How frequently should solar panels be cleaned in India?",
    answer: "Given atmospheric dust, smog, and vehicle emissions across Indian cities, we recommend cleaning every 15 to 30 days during dry months, and promptly after dust storms or the end of monsoon season. Regular service sustains peak output without letting stubborn scale bake on.",
  },
  {
    question: "Why should tap or ground water NOT be used on panels?",
    answer: "Tap and borewell water in India typically contains high TDS (hard water minerals like calcium and magnesium). As tap water evaporates under direct sunlight, it leaves persistent white limescale that permanently degrades light absorption and is notoriously difficult to scrape off.",
  },
  {
    question: "Do you use harsh chemicals or acid detergents?",
    answer: "Never. We use purified 0-TDS demineralized (DM) water that acts as a natural solvent without any chemical residue. For industrial grease or bird droppings, we apply specialized pH-neutral biodegradable cleansers certified safe for anti-reflective glass.",
  },
  {
    question: "Will professional cleaning affect or void my manufacturer warranty?",
    answer: "No. Our cleaning protocols comply strictly with OEM maintenance guidelines published by Tier-1 manufacturers including Tata Power Solar, Adani Solar, and Waaree. We use soft-bristled non-abrasive brushes and refrain from thermal-shock washing.",
  },
  {
    question: "What is covered under the Annual Maintenance Contract (AMC)?",
    answer: "The AMC includes scheduled periodic cleanings (bi-monthly or monthly), comprehensive inverter generation diagnostics, before/after photo reports, priority scheduling following seasonal storms, and a dedicated solar technical manager.",
  },
];

export function FAQ() {
  return (
    <section id="sb-faq" className="py-20 lg:py-28 relative overflow-hidden bg-background">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="container mx-auto px-4 md:px-8 pt-16 max-w-3xl">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-amber-500 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            <span className="w-6 h-px bg-amber-500" />
            Clear Answers
            <span className="w-6 h-px bg-amber-500" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            Everything you need to know about professional solar array maintenance.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3.5">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              <AccordionItem
                value={`sb-faq-${i}`}
                className="border border-border/70 bg-card rounded-2xl px-6 hover:border-amber-500/30 transition-colors"
              >
                <AccordionTrigger className="hover:no-underline py-5 text-left font-heading font-bold text-sm sm:text-base text-foreground hover:text-amber-500 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-8 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export default FAQ;
