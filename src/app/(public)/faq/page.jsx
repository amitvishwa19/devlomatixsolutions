'use client';

import React from "react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Are your crystals genuine and natural?", a: "Yes, all our crystals are 100% natural and ethically sourced from mines across India, Brazil, Madagascar, and Uruguay. Each crystal comes with an authenticity guarantee." },
  { q: "How do I cleanse and charge my crystals?", a: "You can cleanse crystals by placing them under moonlight overnight, using sage or palo santo smoke, or resting them on a selenite plate. Avoid sunlight for amethyst and rose quartz as it can fade their color." },
  { q: "What is your return policy?", a: "We offer a 7-day easy return policy. If you're not satisfied with your purchase, you can return it within 7 days of delivery for a full refund. The product must be in its original condition." },
  { q: "How long does shipping take?", a: "Standard shipping takes 3-5 business days within India. We offer free shipping on orders above ₹999. Express shipping (1-2 days) is available at an additional charge." },
  { q: "Do you ship internationally?", a: "Currently, we ship within India only. We're working on expanding our international shipping options. Please subscribe to our newsletter for updates." },
  { q: "How do I choose the right crystal for me?", a: "Each crystal has unique properties. Amethyst is great for calm and intuition, rose quartz for love, citrine for abundance, and black tourmaline for protection. Visit our Crystal Encyclopedia page for detailed guides, or reach out to us for personalized recommendations." },
  { q: "What are Vastu crystals?", a: "Vastu crystals are specific stones recommended for placement in different areas of your home or office to harmonize energy flow. Pyramids, crystal trees, and salt lamps are popular Vastu remedies." },
  { q: "Can I customize a crystal bracelet?", a: "Yes! We offer custom bracelet services where you can choose your stone combination and wrist size. Contact us through our Contact page with your preferences." },
  { q: "Are your products energetically cleansed?", a: "Yes, every product is cleansed and charged before shipping. We use a combination of sage cleansing, sound healing, and moonlight charging to ensure your crystals arrive with pure, positive energy." },
  { q: "How do I use discount/coupon codes?", a: "During checkout, you'll find a 'Coupon Code' field in the order summary. Enter your code and click Apply. The discount will be reflected in your total. Try codes like CRYSTAL10 for 10% off or SACRED20 for 20% off!" },
];

export default function CrystalAuraFAQPage() {
  return (
    <div className="min-h-screen bg-transparent pt-12 pb-24 px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-primary text-[10px] tracking-[0.3em] uppercase mb-4 font-sans font-black">
            ✦ Common Questions ✦
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-foreground mb-6">
            <span className="text-gold-gradient font-semibold">Frequently</span> Asked
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Everything you need to know about our crystals, shipping, and spiritual services.
          </p>
          <div className="section-divider w-48 mx-auto mt-8" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-[2.5rem] p-4 md:p-8"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-white/[0.02] border-white/5 rounded-2xl px-6 md:px-8 border-b-0">
                <AccordionTrigger className="text-foreground font-serif text-xl md:text-2xl hover:text-primary transition-all py-6 text-left hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-light leading-relaxed text-base md:text-lg pb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-20 text-center"
        >
            <p className="text-muted-foreground/40 text-[10px] uppercase font-black tracking-widest mb-6">Still have questions?</p>
            <div className="flex justify-center gap-4">
               <button className="bg-white/[0.03] border border-white/10 text-foreground px-8 py-5 rounded-2xl font-sans tracking-widest uppercase font-black text-[10px] hover:bg-white/5 transition-all">
                   Email Us
               </button>
               <button className="bg-primary/20 border border-primary/20 text-primary px-8 py-5 rounded-2xl font-sans tracking-widest uppercase font-black text-[10px] hover:bg-primary/30 transition-all">
                   Chat Live
               </button>
            </div>
        </motion.div>
      </div>
    </div>
  );
}
