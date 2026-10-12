'use client';

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 text-white shadow-2xl shadow-amber-500/25 text-center overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-orange-400/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              Elevate Your Real Estate Yield
            </span>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-white leading-tight">
              Unlock Maximum Asset Value with PropX Cloud
            </h2>

            <p className="text-sm sm:text-base text-amber-100 font-normal mb-8 leading-relaxed">
              Start your 14-day free trial today. Onboard your first building in minutes with automated tenant notifications.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => toast.success("PropX Portfolio trial activated! Welcome to the modern property cloud.")}
                className="bg-white text-amber-900 hover:bg-amber-50 font-extrabold h-12 px-8 rounded-xl shadow-xl cursor-pointer text-sm"
              >
                Claim Free 14-Day Pilot
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => toast.info("Connecting with a PropX commercial real estate solutions engineer.")}
                className="border-white/30 text-white hover:bg-white/10 font-bold h-12 px-6 rounded-xl cursor-pointer text-sm bg-transparent"
              >
                Book Guided Portfolio Tour
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
