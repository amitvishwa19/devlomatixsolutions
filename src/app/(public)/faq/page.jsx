"use client"
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { faqItems } from "../_data/products";
import SEO from "../_components/SEO";

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
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.05 }} className="glass-card rounded-xl overflow-hidden">
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                <span className="font-medium">{item.question}</span>
                <ChevronDown className={`w-5 h-5 text-gold flex-shrink-0 transition-transform ${openIndex === i ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                    <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{item.answer}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default FAQPage;