'use client';

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
    question: "How often should I clean my solar panels?",
    answer: "In India, we recommend cleaning every 15-30 days during dry/dusty seasons and once after major dust storms or the monsoon. Regular cleaning ensures output doesn't drop by 25-30%.",
  },
  {
    question: "Do you use chemicals for cleaning?",
    answer: "We primarily use demineralized (DM) water which is highly effective and safe. For stubborn stains or scaling, we use eco-friendly, panel-safe biodegradable solutions that won't damage the tempered glass or anti-reflective coating.",
  },
  {
    question: "Is it safe to clean panels with tap water?",
    answer: "No. Tap water often contains minerals (hard water) that leave white deposits or 'scaling' on the glass. This scaling is harder to remove than dust and permanently reduces efficiency. We always use purified water.",
  },
  {
    question: "Will cleaning my panels void the warranty?",
    answer: "Our cleaning methods follow the guidelines provided by major panel manufacturers like Tata Power, Adani, and Waaree. We use soft brushes and avoid high-pressure washers, ensuring your warranty remains intact.",
  },
  {
    question: "What is included in the AMC Plan?",
    answer: "The AMC includes scheduled cleanings (monthly/bi-monthly), a performance health check, a detailed monthly report, and a dedicated account manager for all your solar maintenance needs.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-28 relative overflow-hidden bg-background">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-[0.2em] mb-4">
            <span className="w-8 h-px bg-primary" />
            Support
            <span className="w-8 h-px bg-primary" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <AccordionItem value={`item-${i}`} className="border border-border bg-card rounded-xl px-2 overflow-hidden hover:border-primary/30 transition-colors">
                  <AccordionTrigger className="hover:no-underline py-5 px-4 text-left font-heading font-bold text-foreground hover:text-primary transition-colors">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      {faq.question}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-12 pb-6 text-muted-foreground leading-relaxed font-light">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
