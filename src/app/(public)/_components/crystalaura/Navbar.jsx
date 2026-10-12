"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ShoppingBag, Menu, X, ArrowRight, ShieldCheck } from "lucide-react";

const navLinks = [
    { label: "Collections", href: "#ca-collections" },
    { label: "Crystal of the Day", href: "#ca-crystal-of-day" },
    { label: "Chakra Map", href: "#ca-chakra-map" },
    { label: "Energy Quiz", href: "#ca-quiz" },
    { label: "Bracelet Matcher", href: "#ca-calculator" },
    { label: "Bestsellers", href: "#ca-bestsellers" },
    { label: "Vastu Guide", href: "#ca-vastu" },
    { label: "FAQ", href: "#ca-faq" },
];

export default function Navbar({ onClose, cartCount = 0, onOpenCart }) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleAnchorClick = (e, href) => {
        e.preventDefault();
        setMobileMenuOpen(false);
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <header
            className={`sticky top-0 z-40 w-full transition-all duration-300 ${
                scrolled
                    ? "bg-[#090614]/95 backdrop-blur-md border-b border-purple-500/20 shadow-xl shadow-purple-950/40 py-3"
                    : "bg-[#090614]/80 backdrop-blur-sm border-b border-purple-500/10 py-4"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                {/* Brand Logo */}
                <a
                    href="#ca-hero"
                    onClick={(e) => handleAnchorClick(e, "#ca-hero")}
                    className="flex items-center gap-2.5 group cursor-pointer"
                >
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 via-purple-600 to-pink-500 p-0.5 flex items-center justify-center shadow-lg shadow-purple-900/40 group-hover:scale-105 transition-transform">
                        <div className="h-full w-full bg-[#0d091a] rounded-[10px] flex items-center justify-center">
                            <span className="text-amber-400 font-bold text-lg select-none">✧</span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                            <span className="text-lg sm:text-xl font-bold tracking-wider font-serif-heading text-slate-100">
                                CRYSTAL
                            </span>
                            <span className="text-lg sm:text-xl font-bold tracking-wider font-serif-heading text-gold-shimmer">
                                AURA
                            </span>
                        </div>
                        <span className="text-[10px] tracking-widest uppercase font-semibold text-purple-300/80 -mt-1">
                            Sacred Minerals &amp; Crystals
                        </span>
                    </div>
                </a>

                {/* Desktop Nav Links */}
                <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
                    {navLinks.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            onClick={(e) => handleAnchorClick(e, item.href)}
                            className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-amber-300 hover:bg-purple-900/20 rounded-lg transition-all"
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                {/* Action Buttons */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                    {/* Cart Trigger */}
                    <button
                        type="button"
                        onClick={onOpenCart}
                        className="relative p-2 rounded-xl ca-glass-card hover:border-amber-400/50 text-slate-200 hover:text-amber-300 transition-all cursor-pointer"
                        title="Sacred Cart"
                        aria-label="View Cart"
                    >
                        <ShoppingBag className="h-4 w-4" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 h-4 min-w-[16px] px-1 rounded-full bg-amber-500 text-[10px] font-bold text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/40">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    {/* Quiz CTA */}
                    <a
                        href="#ca-quiz"
                        onClick={(e) => handleAnchorClick(e, "#ca-quiz")}
                        className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl btn-gold-gradient text-xs font-bold font-serif-heading shadow-md shadow-amber-500/20 whitespace-nowrap cursor-pointer"
                    >
                        <Sparkles className="h-3.5 w-3.5 text-slate-900" />
                        <span className="text-slate-950">Energy Quiz</span>
                    </a>

                    {/* Close Modal Button */}
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-xl ca-glass-card hover:border-rose-500/50 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-all cursor-pointer"
                            title="Close preview"
                            aria-label="Close"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 rounded-xl ca-glass-card text-slate-200 hover:text-purple-300 transition-all"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-[#0e0920] border-b border-purple-500/20 px-4 py-4 space-y-2 animate-in slide-in-from-top-3">
                    {navLinks.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            onClick={(e) => handleAnchorClick(e, item.href)}
                            className="block px-3 py-2 text-sm font-medium text-slate-200 hover:text-amber-300 hover:bg-purple-900/30 rounded-lg transition-colors"
                        >
                            {item.label}
                        </a>
                    ))}
                    <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between">
                        <span className="text-xs text-purple-300 flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                            100% Certified Natural Crystals
                        </span>
                        <a
                            href="#ca-quiz"
                            onClick={(e) => handleAnchorClick(e, "#ca-quiz")}
                            className="inline-flex items-center gap-1 text-xs font-bold text-amber-300"
                        >
                            Start Energy Quiz <ArrowRight className="h-3 w-3" />
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
}
