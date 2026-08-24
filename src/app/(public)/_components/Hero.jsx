import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";


import heroDashboard from "@/app/(public)/assets/hero-dashboard.jpg";
import ProjectInquiryDialog from "./ProjectInquiryDialog";
import Tagline from "./Tagline";

const Hero = () => {
    const [isProjectInquiryOpen, setIsProjectInquiryOpen] = useState(false);

    return (
        <div className="w-full">
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 w-full">
                {/* Vibrant ambient mesh background */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/8 via-indigo-500/6 to-rose-500/5 dark:bg-[radial-gradient(circle_at_top_right,rgba(253,131,11,0.13),transparent_35%),radial-gradient(circle_at_left_top,rgba(229,26,26,0.15),transparent_30%),linear-gradient(180deg,#0d1318_0%,#060a0d_100%)] pointer-events-none" />

                {/* High-Tech Grid Pattern */}
                <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />

                {/* Vivid Multi-color Floating Orbs */}
                <div className="absolute top-1/4 left-1/4 w-[550px] h-[550px] orb-primary rounded-full blur-[90px] animate-pulse-glow pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] orb-secondary rounded-full blur-[80px] animate-pulse-glow pointer-events-none" style={{ animationDelay: "1.5s" }} />
                <div className="absolute top-1/2 right-1/3 w-[350px] h-[350px] orb-rose rounded-full blur-[85px] animate-pulse-glow pointer-events-none" style={{ animationDelay: "0.8s" }} />
                <div className="absolute bottom-10 left-1/3 w-[320px] h-[320px] orb-tertiary rounded-full blur-[75px] animate-pulse-glow pointer-events-none" style={{ animationDelay: "2.2s" }} />

                {/* Floating Micro-Badges */}
                <motion.div
                    className="absolute top-28 right-16 px-4 py-2 rounded-2xl glass-card hidden xl:flex items-center gap-2.5 shadow-lg border border-amber-500/30 bg-card/90 dark:bg-[#11171d]/90 backdrop-blur-md"
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs shadow-xs font-bold">
                        ⚡
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">High Speed</div>
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Sub-second Latency</div>
                    </div>
                </motion.div>

                <motion.div
                    className="absolute bottom-32 left-12 px-4 py-2 rounded-2xl glass-card hidden xl:flex items-center gap-2.5 shadow-lg border border-red-500/30 bg-card/90 dark:bg-[#11171d]/90 backdrop-blur-md"
                    animate={{ y: [0, -18, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-xs shadow-xs font-bold">
                        ✦
                    </div>
                    <div>
                        <div className="text-xs font-bold text-foreground">AI Automation</div>
                        <div className="text-[10px] text-orange-500 dark:text-orange-400 font-semibold">Smart Workflows</div>
                    </div>
                </motion.div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="text-center lg:text-left">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/25 shadow-xs mb-6">
                                <Sparkles className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-orange-500 dark:text-orange-400">
                                    Digital Sovereignty & Enterprise Workplaces
                                </span>
                            </div>

                            {/* Main Heading */}
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.14] mb-6 text-foreground tracking-tight"
                            >
                                We Build Digital Systems <br />
                                That{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-400 dark:from-red-400 dark:via-orange-400 dark:to-amber-300">
                                    Scale Without Limits.
                                </span>
                            </motion.h1>

                            {/* Subheading */}
                            <motion.p
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed font-normal"
                            >
                                Deliver high-performance cloud architecture, unified SaaS collaboration, and intelligent automation built for the next decade.
                            </motion.p>

                            {/* CTA Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4"
                            >
                                <Button
                                    variant="hero"
                                    size="xl"
                                    onClick={() => setIsProjectInquiryOpen(true)}
                                    className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:brightness-110 text-white font-semibold shadow-lg shadow-red-500/25 hover:shadow-red-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border-0 rounded-full px-8"
                                >
                                    Start Your Project
                                    <ArrowRight className="w-5 h-5 ml-1" />
                                </Button>
                                <Link href="/project" className="zx-btn-pill">
                                    Explore Our Work
                                    <span className="zx-arrow">→</span>
                                </Link>
                            </motion.div>

                            {/* Stats Grid */}
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                className="grid grid-cols-3 gap-6 mt-12 pt-6 border-t border-border/60"
                            >
                                {[
                                    { value: "150+", label: "Platforms Delivered" },
                                    { value: "50k+", label: "Active Users" },
                                    { value: "99.99%", label: "Uptime Reliability" },
                                ].map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        className="text-center lg:text-left"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4, delay: 0.6 + index * 0.1, type: "spring" }}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                    >
                                        <div className="zx-stat-num">
                                            {stat.value}
                                        </div>
                                        <div className="text-xs md:text-sm font-medium text-muted-foreground mt-1">{stat.label}</div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Right Showcase Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative">
                                {/* Flame/Orange ambient glow effect behind image */}
                                <div className="absolute -inset-4 bg-gradient-to-r from-red-500/25 via-orange-500/25 to-amber-500/15 rounded-3xl blur-2xl opacity-60 dark:opacity-50" />

                                <div className="relative rounded-2xl border border-border/80 dark:border-white/15 shadow-2xl overflow-hidden bg-card dark:bg-[#11171d]">
                                    {/* Top decorative gradient bar */}
                                    <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400" />
                                    
                                    <img
                                        src={heroDashboard.src}
                                        alt="Modern tech dashboard with data visualizations"
                                        className="w-full h-auto object-cover"
                                    />
                                </div>

                                {/* Floating card overlay 1: Project Delivered */}
                                <motion.div
                                    className="absolute -bottom-6 -left-6 glass-card p-4 shadow-xl border border-emerald-500/30 bg-card/90 dark:bg-[#11171d]/90 backdrop-blur-md rounded-2xl"
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/25">
                                            <span className="font-bold text-sm">✓</span>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-foreground">Project Delivered</div>
                                            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">100% On-Time Launch</div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Floating card overlay 2: System Live Status */}
                                <motion.div
                                    className="absolute -top-6 -right-4 glass-card px-4 py-3 shadow-xl border border-blue-500/30 bg-card/90 dark:bg-[#11171d]/90 backdrop-blur-md rounded-2xl"
                                    animate={{ y: [0, 8, 0] }}
                                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                        </span>
                                        <span className="text-xs font-bold text-foreground">System Online • 99.99%</span>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Dialog */}
            <ProjectInquiryDialog isOpen={isProjectInquiryOpen} onClose={() => setIsProjectInquiryOpen(false)} />
        </div>
    );
};

export default Hero;
