'use client'
import React from 'react';
import Link from 'next/link';
import { Rocket, Sparkles } from 'lucide-react';
import { AppLogo } from '@/components/global/AppLogo';
import { motion } from "framer-motion";

const AuthLayout = ({ children }) => {
    return (
        <div className="public-theme min-h-screen flex flex-row w-full bg-[#0b1014] text-foreground font-sans overflow-y-auto selection:bg-primary/20 selection:text-primary">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] rounded-full bg-cyan-500/10 blur-[130px] animate-pulse-glow" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[140px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
                <div className="absolute top-[40%] right-[30%] w-[35%] h-[35%] rounded-full bg-teal-500/8 blur-[120px]" />

                {/* Subtle Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.04] dark:opacity-[0.05]"
                    style={{
                        backgroundImage: `linear-gradient(to right, rgba(56, 189, 248, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.4) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            {/* Left Section - Hero Content */}
            <div className="hidden lg:flex flex-col justify-center w-[50%] xl:w-[55%] px-12 xl:px-24 min-h-screen relative z-10">

                {/* Main Hero Text */}
                <div className="max-w-2xl mt-12">

                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/25 shadow-xs mb-6 backdrop-blur-md">
                        <Rocket className="w-4 h-4 text-sky-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                            Unified SaaS Mission Control
                        </span>
                    </div>

                    {/* Main Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.14] mb-6 text-white tracking-tight"
                    >
                        Deploy{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500">
                            Missions From One Hub
                        </span>
                    </motion.h1>

                    <p className="text-slate-400 text-lg mb-12 leading-relaxed max-w-xl">
                        A production-ready foundation for high-performance agent deployment, real-time telemetry, and multi-tenant workspace management.
                    </p>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-cyan-400 transition-colors mb-14 border-b border-white/10 hover:border-cyan-400/50 pb-1"
                    >
                        <span>Explore Ecosystem</span>
                        <span className="text-xs text-cyan-400">→</span>
                    </Link>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10">
                        <div>
                            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300 mb-1">1.2k+</div>
                            <div className="text-xs text-slate-400 font-medium tracking-wide uppercase">Active Missions</div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400 mb-1">5k+</div>
                            <div className="text-xs text-slate-400 font-medium tracking-wide uppercase">Live Agents</div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400 mb-1">24/7</div>
                            <div className="text-xs text-slate-400 font-medium tracking-wide uppercase">Global Nodes</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section - Form Container */}
            <div className="w-full lg:w-[50%] xl:w-[45%] flex items-center justify-center p-6 sm:p-8 relative z-10">
                <div className="w-full max-w-md relative">

                    {/* Glowing Accent behind the form */}
                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-cyan-500/20 via-sky-500/15 to-blue-600/20 blur-2xl opacity-60 pointer-events-none" />

                    {/* Form Card */}
                    <div className="relative bg-card/85 dark:bg-[#0f161a]/90 backdrop-blur-2xl border border-border/80 dark:border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-cyan-950/20">
                        {/* Mobile Logo */}
                        <div className="flex justify-center mb-8">
                            <AppLogo link={'/'} size={100} height={100} width={150} />
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
