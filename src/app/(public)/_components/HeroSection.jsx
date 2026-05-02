'use client';

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const HeroSection = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background image with parallax feel */}
            <div className="absolute inset-0">
                <img
                    src="/crystalaura/hero-crystals.jpg"
                    alt="Collection of healing crystals and gemstones"
                    className="w-full h-full object-cover opacity-30 scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
            </div>

            {/* Ambient glow orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-[120px]"
                />
                <motion.div
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/15 blur-[100px]"
                />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary/20 bg-primary/5 mb-8"
                >
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span className="text-primary font-sans text-xs font-medium">
                        Healing Energy & Spiritual Wellness
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="font-serif text-6xl md:text-8xl lg:text-9xl font-semibold leading-[0.9] mb-8"
                >
                    <span className="shimmer-text">Crystal</span>{" "}
                    <span className="text-foreground">Aura</span>
                    <br />
                    <span className="text-foreground/60 italic font-normal text-3xl md:text-5xl lg:text-6xl mt-2 block">
                        & Sacred Stones
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light leading-relaxed"
                >
                    Discover authentic gemstones, crystal bracelets, healing spheres, and
                    spiritual pyramids — handpicked to align your energy and elevate your
                    spirit.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Link href="/crystalaura/shop">
                        <Button size="lg" className="bg-gold-gradient text-white font-medium text-sm px-10 py-7 hover:opacity-90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 group rounded-xl">
                            Explore Collection
                            <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                        </Button>
                    </Link>
                    <Link href="/crystalaura/about">
                        <Button size="lg" variant="outline" className="border-white/10 text-foreground font-medium text-sm px-10 py-7 hover:bg-white/5 hover:border-white/20 transition-all duration-300 rounded-xl">
                            Our Story
                        </Button>
                    </Link>
                </motion.div>

                {/* Trust badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                    className="mt-16 flex items-center justify-center gap-8 text-muted-foreground/40 text-xs font-medium"
                >
                    <span>✦ 100% Authentic</span>
                    <span className="w-1 h-1 rounded-full bg-primary/30" />
                    <span>✦ Free Shipping 999+</span>
                    <span className="w-1 h-1 rounded-full bg-primary/30" />
                    <span>✦ Vastu Guidance</span>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-6 h-10 rounded-full border border-white/10 flex items-start justify-center p-1.5"
                >
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5], height: [6, 10, 6] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-1 rounded-full bg-primary/60"
                    />
                </motion.div>
            </motion.div>
        </section>
    );
};

export default HeroSection;
