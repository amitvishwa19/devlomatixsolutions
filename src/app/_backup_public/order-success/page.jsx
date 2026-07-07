'use client';

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Package, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CrystalAuraOrderSuccessPage() {
  const orderId = `CA-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-transparent pt-12 pb-24 px-6 overflow-hidden flex items-center justify-center">
      <div className="max-w-xl w-full text-center">
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mb-10"
        >
          <div className="w-24 h-24 bg-gold-gradient rounded-full mx-auto flex items-center justify-center shadow-2xl shadow-primary/20">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="text-primary text-[10px] tracking-[0.3em] uppercase mb-4 font-sans font-black">Sacred Confirmation</p>
          <h1 className="font-serif text-5xl md:text-7xl text-foreground mb-6">
            Order <span className="text-gold-gradient font-bold">Confirmed!</span>
          </h1>
          <p className="text-muted-foreground font-light mb-8 text-lg leading-relaxed">
            Thank you for your purchase. Your sacred treasures are being prepared with love and will arrive soon.
          </p>

          <div className="glass-card rounded-3xl p-8 mb-10 text-center border-white/5 bg-white/[0.02] shadow-xl">
             <p className="text-muted-foreground/40 text-[9px] uppercase tracking-widest font-black mb-1">Confirmation Details</p>
             <p className="text-foreground font-mono text-lg tracking-widest uppercase">{orderId}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex flex-col items-center hover:bg-white/5 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Package className="w-5 h-5 text-primary" />
                </div>
                <p className="text-muted-foreground/60 text-[10px] uppercase font-black tracking-widest mb-1">Est. Delivery</p>
                <p className="text-foreground text-sm font-bold uppercase tracking-widest">3-5 Business Days</p>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex flex-col items-center hover:bg-white/5 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Heart className="w-5 h-5 text-primary" />
                </div>
                <p className="text-muted-foreground/60 text-[10px] uppercase font-black tracking-widest mb-1">Status</p>
                <p className="text-foreground text-sm font-bold uppercase tracking-widest">Energetic Prep</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/crystalaura/shop">
              <Button className="w-full sm:w-auto bg-gold-gradient text-white font-sans tracking-[0.2em] font-black uppercase text-[10px] px-10 py-7 rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/20">
                Continue Shopping <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/crystalaura">
              <Button variant="outline" className="w-full sm:w-auto border-white/10 text-muted-foreground font-sans tracking-[0.2em] font-black uppercase text-[10px] px-10 py-7 rounded-2xl hover:bg-white/5 hover:border-white/20 transition-all">
                Back to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
