'use client'
import React from 'react';
import Link from 'next/link';
import { Rocket } from 'lucide-react';
import { AppLogo } from '@/components/global/AppLogo';

const AuthLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-row w-full bg-[#0B0F19] text-white overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#00F0FF]/5 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#00F0FF]/5 blur-[120px]" />

                {/* Subtle Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(to right, #00F0FF 1px, transparent 1px), linear-gradient(to bottom, #00F0FF 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            {/* Left Section - Hero Content */}
            <div className="hidden lg:flex flex-col justify-center w-[50%] xl:w-[55%] px-12 xl:px-24 min-h-screen relative z-10">
                {/* Header/Logo (Top Left) */}
                <div className="absolute top-8 left-12 xl:left-24">
                    <AppLogo link={'/'} size={100} height={100} width={150} />
                </div>

                {/* Main Hero Text */}
                <div className="max-w-2xl mt-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00F0FF]/10 text-[#00F0FF] text-sm font-medium mb-8 border border-[#00F0FF]/20">
                        <Rocket className="w-4 h-4 fill-current" />
                        <span>Unified SaaS Mission Control</span>
                    </div>

                    <h1 className="text-5xl xl:text-6xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
                        Deploy <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#7B2CBF]">Missions</span><br />
                        From One Hub
                    </h1>

                    <p className="text-slate-400 text-lg mb-16 leading-relaxed max-w-xl">
                        A production-ready foundation for high-performance agent deployment, real-time telemetry, and multi-tenant workspace management.
                    </p>

                    <Link href="#" className="inline-block text-sm font-bold text-white hover:text-[#00F0FF] transition-colors mb-16 border-b border-white/20 hover:border-[#00F0FF]/50 pb-1">
                        Explore Ecosystem
                    </Link>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10">
                        <div>
                            <div className="text-3xl font-bold text-[#00F0FF] mb-1">1.2k+</div>
                            <div className="text-xs text-slate-400 font-medium tracking-wide uppercase">Active Missions</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-[#00F0FF] mb-1">5k+</div>
                            <div className="text-xs text-slate-400 font-medium tracking-wide uppercase">Live Agents</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-[#00F0FF] mb-1">24/7</div>
                            <div className="text-xs text-slate-400 font-medium tracking-wide uppercase">Global Nodes</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section - Form Container */}
            <div className="w-full lg:w-[50%] xl:w-[45%] flex items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-md relative">
                    {/* Glowing Accent behind the form */}
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#00F0FF]/20 to-[#7B2CBF]/20 blur-xl opacity-50 pointer-events-none" />

                    {/* Form Card */}
                    <div className="relative bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                        {/* Mobile Logo */}
                        <div className="flex lg:hidden justify-center mb-8">
                            <AppLogo link={'/'} />
                        </div>

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
