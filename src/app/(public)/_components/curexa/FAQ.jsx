'use client';

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How difficult is migrating our existing patient data to Curexa?",
    a: "We provide assisted migration. Our engineering team exports your existing patient history, past visits, medicine catalogs, and billing ledgers from any legacy HMS or Excel sheets and imports them into Curexa in under 24 hours."
  },
  {
    q: "Does Curexa require dedicated servers or IT staff in the hospital?",
    a: "No. Curexa is 100% cloud-hosted on HIPAA-compliant architecture. You don't need expensive server rooms, backup tapes, or in-house database engineers. Access Curexa securely from any web browser or tablet."
  },
  {
    q: "Are the 500+ pathology test templates fully customizable?",
    a: "Yes. Every lab template (Hematology, Biochemistry, Microbiology, Serology, Histopathology) comes pre-configured with standard reference ranges, which your pathologists can customize or brand with custom hospital letterheads and digital signatures."
  },
  {
    q: "How does the automated daily cloud backup work?",
    a: "Every night at midnight, Curexa takes automated encrypted snapshots of your entire hospital database and stores redundant copies across multiple geographic regions with one-click disaster recovery."
  },
  {
    q: "Can we support cashless TPA and insurance claim submissions?",
    a: "Yes. Curexa's billing suite includes pre-authorization forms, TPA itemization, claim document attachments, and cashless settlement tracking."
  },
  {
    q: "How long does staff and doctor training take?",
    a: "Most receptionists and nursing staff master Curexa within 2 to 3 hours of guided walkthrough. Doctors typically adapt to the digital prescription builder in under 15 minutes."
  }
];

export function FAQ() {
  return (
    <section id="cx-faq" className="py-20 lg:py-28 bg-background">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="container mx-auto px-4 md:px-8 pt-16 max-w-3xl">
        <div className="text-center mb-14">
          <p className="text-xs uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
            Got Questions?
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 font-extrabold">Questions</span>
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3.5">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`cx-faq-${i}`}
              className="glass-card rounded-2xl px-6 border border-border/60 hover:border-emerald-500/30 transition-colors"
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
      </div>
    </section>
  );
}
