'use client';

import React from "react";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CrystalAuraNotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="text-center p-12 glass-card rounded-[2.5rem] max-w-lg relative overflow-hidden bg-white/[0.02] border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10" />
        <ShoppingBag className="w-16 h-16 text-muted-foreground/20 mx-auto mb-8" />
        
        <p className="text-primary text-[10px] tracking-[0.3em] uppercase mb-4 font-sans font-black">Sacred Void</p>
        <h1 className="font-serif text-5xl md:text-7xl text-foreground mb-8 font-semibold leading-none">
          404 <span className="text-gold-gradient">Lost</span>
        </h1>
        
        <p className="text-muted-foreground font-light mb-10 text-lg leading-relaxed italic">
          "The treasure you seek has returned to the earth, or the path has been veiled."
        </p>
        
        <Link href="/crystalaura">
          <Button className="bg-gold-gradient text-white px-10 py-7 rounded-2xl font-sans tracking-[0.2em] font-black uppercase text-[10px] hover:opacity-90 shadow-xl shadow-primary/20 transition-all">
            <ArrowLeft className="w-4 h-4 mr-3" />
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
