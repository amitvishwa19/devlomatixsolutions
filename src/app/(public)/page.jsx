'use client'
import React from 'react'
import { useEffect, useRef } from "react";
import { Activity, Heart, Users, Shield, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import NetworkBackground from '@/components/global/NetworkBackground';
import Link from 'next/link';

export default function NotFound() {

    const features = [
        { icon: Shield, label: "Secure & Compliant" },
        { icon: Activity, label: "Real-time Monitoring" },
        { icon: Users, label: "Patient-Centric" },
        { icon: Heart, label: "Compassionate Care" },
    ];


    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden w-full">
            <NetworkBackground />

            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />

            <div className="relative z-10 text-center max-w-4xl mx-auto">
                <div className="flex justify-center items-center gap-6 mb-10 animate-fade-in">
                    {[Activity, Heart, Users, Shield].map((Icon, i) => (
                        <div key={i} className="icon-glow animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                            <Icon className="w-10 h-10 text-primary stroke-[1.5]" />
                        </div>
                    ))}
                </div>

                <h1 className="text-7xl md:text-9xl font-bold text-primary mb-4 tracking-tight animate-fade-in [animation-delay:0.2s] opacity-0 [animation-fill-mode:forwards]">
                    404
                </h1>

                <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-6 leading-tight animate-fade-in [animation-delay:0.3s] opacity-0 [animation-fill-mode:forwards]">
                    Page Not Found. Redirecting Care.
                </h2>

                <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in [animation-delay:0.4s] opacity-0 [animation-fill-mode:forwards]">
                    Smart systems. Seamless care. The page you're looking for doesn't exist,
                    but our platform continues connecting people, processes, and data —
                    ensuring every detail of patient care is perfectly organized.
                </p>

                <div className="flex justify-center gap-3 mb-8 animate-fade-in [animation-delay:0.5s] opacity-0 [animation-fill-mode:forwards]">
                    <div className="w-16 h-1 bg-primary rounded-full" />
                    <div className="w-16 h-1 bg-primary rounded-full" />
                </div>

                <p className="text-muted-foreground text-sm md:text-base mb-10 max-w-xl mx-auto animate-fade-in [animation-delay:0.6s] opacity-0 [animation-fill-mode:forwards]">
                    Empowering healthcare providers with intelligent solutions for
                    patient care, resource management, and operational excellence
                </p>

                <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-12 max-w-lg mx-auto animate-fade-in [animation-delay:0.7s] opacity-0 [animation-fill-mode:forwards]">
                    {features.map(({ icon: Icon, label }, i) => (
                        <div key={i} className="flex items-center gap-3 text-muted-foreground">
                            <Icon className="w-5 h-5 text-primary" />
                            <span className="text-sm">{label}</span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in [animation-delay:0.8s] opacity-0 [animation-fill-mode:forwards]">
                    <Button
                        asChild
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[180px]"
                    >
                        <Link href="/" className="flex items-center gap-2">
                            <Home className="w-4 h-4" />
                            Go Home
                        </Link>
                    </Button>


                </div>
            </div>
        </div>
    )
}
