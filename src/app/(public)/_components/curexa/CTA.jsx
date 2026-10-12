'use client';

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, HeartPulse } from "lucide-react";
import { toast } from "sonner";

export function CTA() {
  const handleScheduleDemo = () => {
    toast.success("Demo request received! A Curexa clinical implementation engineer will reach out within 2 hours.");
  };

  const handleStartTrial = () => {
    toast.success("Starting your 14-day free trial! We are setting up your sandbox clinic environment.");
  };

  return (
    <section id="cx-cta" className="py-20 lg:py-28">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl p-10 md:p-16 text-center text-white bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
              <HeartPulse className="w-7 h-7 text-white" />
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
              Modernize Your Hospital Operations Today
            </h2>

            <p className="text-base text-white/90 leading-relaxed mb-8">
              Join 500+ leading clinics and healthcare facilities powered by Curexa.
              Zero setup fees, free data migration, and a full 14-day trial period.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
              <Button
                size="lg"
                onClick={handleScheduleDemo}
                className="bg-white text-emerald-900 hover:bg-white/95 font-bold h-12 px-8 rounded-xl shadow-xl cursor-pointer"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Doctor Walkthrough
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleStartTrial}
                className="border-white/40 text-white hover:bg-white/15 bg-white/10 font-bold h-12 px-8 rounded-xl cursor-pointer backdrop-blur-md"
              >
                Start 14-Day Free Trial <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
