'use client';

import React from "react";
import { Gem, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FooterSection = () => {
  return (
    <footer className="relative border-t border-white/10 pt-20 pb-8 px-6 overflow-hidden">
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto">
        {/* Newsletter CTA */}
        <div className="glass-card rounded-2xl p-10 md:p-14 mb-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <div className="relative z-10">
            <h3 className="font-serif text-3xl md:text-4xl text-foreground mb-3">
              Join the <span className="text-gold-gradient">Crystal Circle</span>
            </h3>
            <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto font-light">
              Get exclusive offers, new arrivals, and spiritual guidance delivered to your inbox.
            </p>
            <div className="flex gap-3 max-w-md mx-auto">
              <Input
                placeholder="Enter your email"
                className="bg-background/50 border-white/10 text-foreground placeholder:text-muted-foreground/50 rounded-xl"
              />
              <Button className="bg-gold-gradient text-white px-6 rounded-xl hover:opacity-90 transition-opacity shrink-0">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-14">
          <div className="md:col-span-1">
            <Link href="/crystalaura" className="flex items-center gap-2.5 mb-5 group">
              <Gem className="w-6 h-6 text-primary group-hover:rotate-12 transition-transform" />
              <span className="font-serif text-2xl shimmer-text font-semibold">Crystal Aura</span>
            </Link>
            <p className="text-muted-foreground text-sm font-light leading-relaxed">
              Your trusted source for authentic healing crystals, gemstones, and
              spiritual products.
            </p>
          </div>

          <div>
            <h4 className="font-sans text-xs tracking-[0.2em] uppercase text-foreground mb-5">Shop</h4>
            <ul className="space-y-3 text-muted-foreground text-sm font-light">
              <li><Link href="/crystalaura/shop" className="hover:text-primary transition-colors duration-300">All Products</Link></li>
              <li><Link href="/crystalaura/crystals" className="hover:text-primary transition-colors duration-300">Crystal Guide</Link></li>
              <li><Link href="/crystalaura/vastu" className="hover:text-primary transition-colors duration-300">Vastu Stones</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans text-xs tracking-[0.2em] uppercase text-foreground mb-5">Company</h4>
            <ul className="space-y-3 text-muted-foreground text-sm font-light">
              <li><Link href="/crystalaura/about" className="hover:text-primary transition-colors duration-300">About Us</Link></li>
              <li><Link href="/crystalaura/contact" className="hover:text-primary transition-colors duration-300">Contact</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors duration-300">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans text-xs tracking-[0.2em] uppercase text-foreground mb-5">Connect</h4>
            <ul className="space-y-3 text-muted-foreground text-sm font-light">
              <li>📧 hello@crystalaura.com</li>
              <li>📱 +91 98765 43210</li>
              <li>📍 Mumbai, India</li>
            </ul>
          </div>
        </div>

        <div className="section-divider w-full mb-6" />
        <p className="text-center text-muted-foreground/40 text-[10px] uppercase tracking-widest font-light">
          © 2026 Crystal Aura. All rights reserved. Crystals for wellness, not medical advice.
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
