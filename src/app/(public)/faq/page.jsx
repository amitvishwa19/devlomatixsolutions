'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { faqItems } from "../_data/products";

// Inline SVG Icon for Chevron Down
const ChevronDownIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="min-h-screen bg-[#06040a] pt-32 pb-24 text-foreground font-sans">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* FAQ Header */}
        <div className="text-center mb-16">
          <span className="text-[10px] font-sans tracking-[0.35em] text-primary uppercase font-bold block mb-3">
            ✦ Common Questions ✦
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-4">
            Frequently <span className="shimmer-text italic font-normal">Asked</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            Everything you need to know about our crystals authenticity, charging guidelines, and delivery parameters.
          </p>
          <div className="w-16 h-[1px] bg-primary/30 mx-auto mt-6" />
        </div>

        {/* Custom Accordion */}
        <div className="flex flex-col gap-4">
          {faqItems.map((item, i) => {
            const isOpen = openIndex === i;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="glass-card rounded-2xl border border-white/5 overflow-hidden transition-all duration-300"
              >
                {/* Accordion Trigger */}
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left font-serif text-sm md:text-base font-bold text-foreground hover:bg-white/5 transition-all duration-300 focus:outline-none"
                >
                  <span>{item.question}</span>
                  <ChevronDownIcon
                    className={`w-4 h-4 text-primary transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Accordion Content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-white/5"
                    >
                      <div className="px-6 py-5 text-xs md:text-sm text-muted-foreground leading-relaxed">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}