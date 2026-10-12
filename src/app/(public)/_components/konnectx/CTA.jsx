'use client';

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "./use-language";

export function CTA() {
  const { t } = useLanguage();

  const handleStartTrial = () => {
    toast.success("Thank you for your interest! A KonnectX specialist will connect with you shortly.");
  };

  const handleBookDemo = () => {
    toast.info("Opening chatbot demo... Try asking questions in the bottom-right corner!");
  };

  return (
    <section id="kx-cta" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16 sm:py-20 border border-white/20 shadow-2xl"
          style={{
            background: "var(--gradient-sun)",
            boxShadow: "var(--shadow-glow-lg)",
          }}
        >
          {/* Decorative Circles */}
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-black/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-lg">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>

            <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl tracking-tight">
              {t("cta.title")}
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-base sm:text-lg text-white/90 leading-relaxed font-normal">
              {t("cta.subtitle")}
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                onClick={handleStartTrial}
                className="gap-2 text-base font-bold bg-white text-teal-900 hover:bg-white/90 shadow-xl cursor-pointer w-full sm:w-auto"
              >
                Start 7-Day Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleBookDemo}
                className="gap-2 border-white/40 text-base text-white hover:bg-white/20 hover:text-white bg-white/10 cursor-pointer w-full sm:w-auto backdrop-blur-sm"
              >
                <Sparkles className="h-4 w-4" />
                Book Live Walkthrough
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
