'use client';

import React from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What is the official WhatsApp Business API?",
    a: "The WhatsApp Business API is Meta's enterprise infrastructure designed for businesses to communicate programmatically at scale. Unlike the free mobile app, the API enables automated broadcasts, no-code chatbots, multiple simultaneous agent seats, and seamless CRM integrations without device limitations.",
  },
  {
    q: "Do I need a brand-new phone number for KonnectX?",
    a: "You can either use your existing business phone number (provided it is disconnected from standard WhatsApp mobile app) or register a new virtual number. Our onboarding team handles the number activation and verification directly on Meta Business Manager.",
  },
  {
    q: "How does WhatsApp pricing work?",
    a: "WhatsApp operates on a 24-hour conversation billing window set directly by Meta. Rates depend on whether the conversation is Marketing, Utility, Authentication, or Service. KonnectX offers 100% transparent software plans with zero markups on Meta's official charges.",
  },
  {
    q: "Can KonnectX help my brand obtain the Official Green Tick?",
    a: "Yes! As an authorized solution partner, we assist qualified businesses through Meta's Green Tick verification process. You need a verified Meta Business Manager and proof of brand notability.",
  },
  {
    q: "How long does account activation take?",
    a: "Standard setup and Meta Business verification generally complete within 24 to 48 hours. Once verified, you can immediately begin launching campaigns and configuring your chatbot journeys.",
  },
  {
    q: "Is there a free trial period?",
    a: "Yes, we provide a 7-day no-obligation free trial on our Lite and Professional tiers so your team can test template campaigns and chatbot logic before going live.",
  },
];

export function FAQ() {
  return (
    <section id="kx-faq" className="relative py-20 sm:py-28">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="mx-auto max-w-3xl px-4 pt-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary">
            Helpful Answers
          </p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl text-foreground">
            Frequently Asked <span className="text-gradient-sun">Questions</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Everything you need to know about getting started with the WhatsApp Business API.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mt-12"
        >
          <Accordion type="single" collapsible className="space-y-3.5">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="glass-card rounded-2xl px-6 border border-border/50 transition-colors hover:border-primary/40"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <AccordionTrigger className="text-left text-sm sm:text-base font-bold text-foreground hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
