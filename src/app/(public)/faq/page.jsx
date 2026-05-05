"use client"
import { useState } from "react";
import { motion } from "framer-motion";
import { faqItems } from "../_data/products";
import SEO from "../_components/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="pt-20">
      <SEO title="Frequently Asked Questions" description="Answers to questions about crystal authenticity, shipping, returns, cleansing and consultations at CrystalAura." path="/faq" />
      <section className="py-16 text-center">
        <p className="text-gold text-sm mb-2">✦ Common Questions ✦</p>
        <h1 className="font-serif text-5xl md:text-7xl mb-4">Frequently <span className="text-gold">Asked</span></h1>
        <p className="text-muted-foreground max-w-xl mx-auto">Everything you need to know about our crystals, shipping, and services.</p>
        <div className="w-20 h-1 bg-gold mx-auto mt-6 rounded-full" />
      </section>
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <Accordion type="single" collapsible>
          {faqItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card className="mb-3">
                <AccordionItem value={`item-${i}`}>
                  <AccordionTrigger className="px-5 hover:no-underline">
                    <span className="font-medium">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-5">
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                    </CardContent>
                  </AccordionContent>
                </AccordionItem>
              </Card>
            </motion.div>
          ))}
        </Accordion>
      </section>
    </div>
  );
};

export default FAQPage;