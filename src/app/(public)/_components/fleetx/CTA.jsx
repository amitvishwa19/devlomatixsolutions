'use client';

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-sky-600 via-cyan-600 to-sky-700 text-white shadow-2xl shadow-sky-500/25 text-center overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-cyan-400/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              Ready for Zero-Loss Dispatch?
            </span>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-white leading-tight">
              Transform Your Fleet Operations in Under 24 Hours
            </h2>

            <p className="text-sm sm:text-base text-sky-100 font-normal mb-8 leading-relaxed">
              Join leading transport networks and logistics operators achieving 32% lower fuel bills and automated customer tracking.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => toast.success("FleetX Dispatch Trial activated! Welcome aboard.")}
                className="bg-white text-sky-900 hover:bg-sky-50 font-extrabold h-12 px-8 rounded-xl shadow-xl cursor-pointer text-sm"
              >
                Claim Free 14-Day Pilot
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => toast.info("Contacting FleetX logistics engineering specialist.")}
                className="border-white/30 text-white hover:bg-white/10 font-bold h-12 px-6 rounded-xl cursor-pointer text-sm bg-transparent"
              >
                Schedule Hardware Walkthrough
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
