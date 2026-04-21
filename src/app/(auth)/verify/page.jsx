'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner'
import Link from 'next/link'
import { ShieldCheck, Loader2, Rocket, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useAction } from '@/hooks/use-action';
import { verifyToken } from '@/app/(auth)/_action/verify_token';
import NetworkBackground from '@/components/global/NetworkBackground';
import { AppLogo } from "@/components/global/AppLogo";

export default function Verify() {
    const [token, setToken] = useState(null);
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const router = useRouter()

    const { execute, isLoading } = useAction(verifyToken, {
        onSuccess: (data) => {
            setStatus('success');
            toast.success('Email verified! You can now access the Mission Control.');
        },
        onError: (error) => {
            setStatus('error');
            toast.error('Invalid or expired activation link.');
        }
    })

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        
        if (urlToken) {
            setToken(urlToken);
            execute({ token: urlToken });
        } else {
            setStatus('error');
        }
    }, [execute])

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B0F19] text-white font-sans">
            <NetworkBackground />

            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none">
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

            {/* Header/Logo */}
            <div className="absolute top-8 left-8 relative z-20">
                <AppLogo link={'/'} size={40} height={40} width={120} />
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-md mx-4">
                <div className="backdrop-blur-xl bg-[#0f172a]/80 rounded-[2.5rem] p-10 shadow-3xl border border-white/10 relative overflow-hidden transition-all duration-500">
                    {/* Glowing Accent */}
                    <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-br from-[#00F0FF]/10 to-[#7B2CBF]/10 blur-xl opacity-50 pointer-events-none" />

                    <div className="relative z-10 text-center space-y-8">
                        
                        {/* Status Icon */}
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-[#00F0FF]/10 border border-[#00F0FF]/20 shadow-[0_0_30px_rgba(0,240,240,0.15)] transition-all duration-500">
                            {status === 'verifying' && <Loader2 className="h-12 w-12 text-[#00F0FF] animate-spin" />}
                            {status === 'success' && <CheckCircle2 className="h-12 w-12 text-emerald-400 animate-in zoom-in duration-500" />}
                            {status === 'error' && <AlertCircle className="h-12 w-12 text-rose-500 animate-in shake duration-500" />}
                        </div>

                        {/* Text Group */}
                        <div className="space-y-4">
                            {status === 'verifying' && (
                                <>
                                    <h1 className="text-3xl font-black text-white tracking-tight">Verifying Link</h1>
                                    <p className="text-slate-400 text-sm leading-relaxed px-4">
                                        Synchronizing with Mission Control. Please wait while we authenticate your sector signal.
                                    </p>
                                </>
                            )}
                            
                            {status === 'success' && (
                                <>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black tracking-widest uppercase border border-emerald-500/20">
                                        <ShieldCheck className="w-3 h-3" />
                                        Identity Verified
                                    </div>
                                    <h1 className="text-3xl font-black text-white tracking-tight">Access Granted</h1>
                                    <p className="text-slate-400 text-sm leading-relaxed px-4">
                                        Your authentication protocol is now complete. System clearance has been updated to ACTIVE status.
                                    </p>
                                </>
                            )}

                            {status === 'error' && (
                                <>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-black tracking-widest uppercase border border-rose-500/20">
                                        <AlertCircle className="w-3 h-3" />
                                        Protocol Failure
                                    </div>
                                    <h1 className="text-3xl font-black text-white tracking-tight">Link Invalid</h1>
                                    <p className="text-slate-400 text-sm leading-relaxed px-4">
                                        The provided verification token is either expired or corrupted. Request a new link to continue.
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4 pt-4">
                            {status === 'success' ? (
                                <Button
                                    asChild
                                    size="lg"
                                    className="w-full gap-2 bg-gradient-to-r from-[#00F0FF] to-[#00D0FF] text-[#0f172a] hover:from-[#00D0FF] hover:to-[#00B0FF] font-black shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all h-14 rounded-2xl"
                                >
                                    <Link href="/">
                                        Enter Command Center
                                        <Rocket className="h-5 w-5" />
                                    </Link>
                                </Button>
                            ) : (
                                <Button
                                    asChild
                                    variant="outline"
                                    size="lg"
                                    className="w-full gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold h-14 rounded-2xl"
                                >
                                    <Link href="/">
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to Start
                                    </Link>
                                </Button>
                            )}
                        </div>

                        {/* Footer Status */}
                        <div className="pt-6 border-t border-white/5">
                            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-black">
                                <span className={status === 'success' ? 'text-[#00F0FF]' : 'text-slate-700'}>●</span>
                                AUTH_SUBSYSTEM_{status.toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Footer */}
            <div className="absolute bottom-8 text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em] z-20">
                Devlomatix Mission Control • Security Grade AAA
            </div>
        </div>
    );
}
