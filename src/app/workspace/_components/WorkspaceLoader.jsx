'use client'
import { Sparkles, Gem, GemIcon, Shapes, Hexagon, CircleDot, Box, Sparkle } from 'lucide-react'
import '../../(public)/_styles/crystals.css';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export default function WorkspaceLoader({ redirectTo, setup = false, onSetupComplete }) {
    const router = useRouter();
    const [setupRequire, setSetupRequire] = useState(setup)

    useEffect(() => {
        if (redirectTo) {
            router.push(redirectTo);
        }
    }, [router, redirectTo]);


    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="fixed inset-0 bg-[#0a0a0a] pointer-events-none -z-10" />
            <div className="fixed inset-0 noise-overlay pointer-events-none opacity-20 -z-10" />

            {/* Ambient Glows */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#D4AF37]/5 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#D4AF37]/5 blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-[#8854A1]/10 blur-[150px]" />

                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(to right, #D4AF37 1px, transparent 1px), linear-gradient(to bottom, #D4AF37 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            <div className='flex flex-1 h-screen items-center justify-center'>
                <div className="flex flex-col items-center justify-center space-y-8 px-4">


                    {/* Logo and Icons Animation */}
                    <div className="relative">
                        <div className="flex items-center justify-center space-x-4">
                            <div className="animate-pulse">
                                <Gem className="h-12 w-12 text-[#D4AF37]" strokeWidth={2.5} />
                            </div>
                            <div className="animate-pulse delay-100">
                                <Hexagon className="h-12 w-12 text-[#8854A1]" strokeWidth={2.5} />
                            </div>
                            <div className="animate-pulse delay-200">
                                <Shapes className="h-12 w-12 text-[#D4AF37]" strokeWidth={2.5} />
                            </div>
                            <div className="animate-pulse delay-300">
                                <CircleDot className="h-12 w-12 text-[#8854A1]" strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>

                    {/* App Title */}
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold text-white max-w-4xl mx-auto font-serif">
                            Crystal <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#8854A1] italic">Aura</span> & Sacred Stones
                        </h1>
                        <div className='flex items-center justify-center'>
                            <div className='w-[80%] md:w-[60%]'>
                                <p className="text-xs font-medium text-slate-400 leading-relaxed">
                                    Discover authentic gemstones, crystal bracelets, healing spheres, and spiritual pyramids — handpicked to align your energy and elevate your spirit.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Motto Section */}
                    <div className="max-w-2xl text-center space-y-4">
                        <div className="flex items-center justify-center space-x-6">
                            <div className="h-1 w-12 bg-[#D4AF37] rounded-full" />
                            <Sparkle className="h-5 w-5 text-[#D4AF37] animate-ping delay-200" fill="currentColor" />
                            <div className="h-1 w-12 bg-[#D4AF37] rounded-full" />
                        </div>

                        <p className="text-lg leading-relaxed text-slate-300">
                            Healing Energy & Spiritual Wellness
                        </p>

                        <div className="grid grid-cols-2 gap-4 pt-4 max-w-md mx-auto">
                            <div className="flex items-center space-x-2 text-sm">
                                <GemIcon className="h-4 w-4 text-[#D4AF37] animate-pulse delay-100" />
                                <span className="text-slate-300">Authentic Gems</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <Sparkles className="h-4 w-4 text-[#8854A1] animate-pulse delay-200" />
                                <span className="text-slate-300">Healing Energy</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <Box className="h-4 w-4 text-[#D4AF37] animate-pulse delay-300" />
                                <span className="text-slate-300">Curated Collection</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <Hexagon className="h-4 w-4 text-[#8854A1] animate-pulse delay-400" />
                                <span className="text-slate-300">Spiritual Wellness</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


// style = {{ backgroundImage: `url(${string.orgCoverImage.default.src}) `, backgroundSize:'cover', backgroundRepeat:"no-repeat", opacity: 0.2 }}