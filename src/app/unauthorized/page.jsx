'use client'
import React from 'react';
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AppLogo } from "@/components/global/AppLogo";

const Unauthorized = () => {
    const router = useRouter();

    const handleGoBack = () => {
        router.push("/");
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B0F19] text-white">

            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#00F0FF]/5 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#00F0FF]/5 blur-[120px]" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(to right, #00F0FF 1px, transparent 1px), linear-gradient(to bottom, #00F0FF 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>
            {/* Ambient Background Glows - Mirroring AuthLayout */}
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

            {/* Header/Logo */}
            <div className="absolute top-8 left-8 relative z-20">
                <AppLogo link={'/'} size={40} height={40} width={120} />
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="backdrop-blur-xl bg-[#0f172a]/80 rounded-[2rem] p-10 shadow-3xl border border-white/10 relative overflow-hidden">
                    {/* Glowing Accent */}
                    <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-[#00F0FF]/10 to-[#7B2CBF]/10 blur-xl opacity-50 pointer-events-none" />

                    <div className="relative z-10 text-center space-y-8">
                        {/* Icon */}
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/20 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                            <Lock className="h-10 w-10 text-[#00F0FF]" />
                        </div>

                        {/* Title group */}
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black tracking-widest uppercase border border-red-500/20">
                                <ShieldAlert className="w-3 h-3" />
                                Restricted Access
                            </div>
                            <h1 className="text-3xl font-extrabold text-white tracking-tight">
                                Access Denied
                            </h1>
                            <p className="text-slate-400 text-sm leading-relaxed px-2">
                                Your current authorization level does not permit access to this sector of the Mission Control.
                            </p>
                        </div>

                        {/* Status block */}
                        <div className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                            <span>Error Code:</span>
                            <span className="text-[#00F0FF] font-bold">403_RESTRICTED</span>
                        </div>

                        {/* Action buttons */}
                        <div className="space-y-3">
                            <Button
                                size="lg"
                                className="w-full gap-2 bg-gradient-to-r from-[#00F0FF] to-[#00D0FF] text-[#0f172a] hover:from-[#00D0FF] hover:to-[#00B0FF] font-black shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all ease-out h-12 rounded-xl"
                                onClick={handleGoBack}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Return to Command
                            </Button>
                        </div>

                        {/* Support Info */}
                        <div className="pt-4 border-t border-white/5">
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                                Contact Fleet Commander at{" "}
                                <span className="text-slate-300">support@devlomatix.com</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] z-20">
                © {new Date().getFullYear()} Devlomatix Mission Control • All Systems Nominal
            </div>
        </div>
    );
};

export default Unauthorized;
