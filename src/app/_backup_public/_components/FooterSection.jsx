'use client';

import React from "react";
import Link from "next/link";

// Inline SVG Icon components to completely bypass Next.js Turbopack lucide-react caching bugs
const MailIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);

const FooterSection = () => {
  return (
    <footer className="bg-[#090710]/80 border-t border-white/5 mt-auto relative overflow-hidden">
      {/* Background radial accent glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary/5 blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link className="flex items-center gap-2 group" href="/">
              <span className="text-primary-foreground text-gold-gradient text-xl font-bold">✧</span>
              <span className="font-serif text-2xl font-semibold text-foreground tracking-widest">
                CRYSTAL<span className="text-primary-foreground text-gold-gradient font-black">AURA</span>
              </span>
            </Link>
            <p className="text-muted-foreground/80 text-sm leading-relaxed font-light">
              Hand-selected architectural minerals, crystal bracelets, healing spheres, and spiritual pyramids — ethically sourced to align your environment and elevate your personal vibrations.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 font-sans">
            <h4 className="text-primary text-[10px] tracking-[0.25em] font-black uppercase">Quick Links</h4>
            <ul className="space-y-3 text-xs tracking-wider text-muted-foreground uppercase font-bold">
              <li><Link className="hover:text-primary transition-colors" href="/shop">Shop Collection</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/crystals">Crystal Guide</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/vastu">Vastu Stones</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/blog">Our Blog</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/about">About Our Story</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-4 font-sans">
            <h4 className="text-primary text-[10px] tracking-[0.25em] font-black uppercase">Support Portal</h4>
            <ul className="space-y-3 text-xs tracking-wider text-muted-foreground uppercase font-bold">
              <li><Link className="hover:text-primary transition-colors" href="/faq">Help &amp; FAQ</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Shipping Information</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Returns &amp; Exchanges</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Stay Connected (Newsletter) */}
          <div className="space-y-4 font-sans">
            <h4 className="text-primary text-[10px] tracking-[0.25em] font-black uppercase">Stay Connected</h4>
            <p className="text-xs text-muted-foreground/80 leading-relaxed font-light">
              Subscribe for crystal guide updates, cosmic insights, and exclusive spiritual collection offers.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-white/5 border border-white/15 rounded-full px-5 py-3 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
              />
              <button className="bg-gold-gradient text-white p-3.5 rounded-full hover:opacity-90 transition-opacity shrink-0 flex items-center justify-center border border-primary/20 hover:shadow-lg hover:shadow-primary/10 active:scale-95">
                <MailIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Giant Text */}
        <div className="mt-20 text-center select-none pointer-events-none overflow-hidden">
          <p className="text-[12vw] font-serif font-black tracking-tighter opacity-[0.03] shimmer-text animate-pulse leading-none">
            CRYSTAL AURA
          </p>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/5 mt-8 pt-8 text-center text-[10px] font-sans tracking-widest text-muted-foreground/40 uppercase font-bold">
          <p>© 2026 Crystal Aura. All rights reserved. Crafted with ✧ and sacred intention.</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
