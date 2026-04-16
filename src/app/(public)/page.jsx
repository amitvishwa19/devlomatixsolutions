'use client'
import React from 'react'
import { GravityHero, GravityFeatures, GravityPricing } from './_components/GravitySections'
import PageTransition from './_components/PageTransition'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowUpRight } from 'lucide-react'

export default function HomePage() {
    return (
        <PageTransition>
            <main className="bg-background min-h-screen">
                {/* Hero section with Dashboard Preview */}
                <GravityHero imgSrc="/assets/branding/dashboard-preview.png" />
                
                {/* Social Proof Placeholder (Minimalist) */}
                <section className="py-12 border-y border-border bg-accent/5">
                    <div className="container mx-auto px-6 text-center">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.3em] mb-8">Powering the next generation of mission-critical workspaces</p>
                        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale saturate-0">
                             <div className="text-2xl font-black tracking-tighter italic">OPENROUTER</div>
                             <div className="text-2xl font-black tracking-tighter italic">GOOGLE AI</div>
                             <div className="text-2xl font-black tracking-tighter italic">KONNECTX</div>
                             <div className="text-2xl font-black tracking-tighter italic">SWARM v2</div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <GravityFeatures />

                {/* Pricing Section */}
                <GravityPricing />

                {/* Final CTA */}
                <section className="py-24 bg-background">
                    <div className="container mx-auto px-6 text-center">
                        <div className="max-w-3xl mx-auto p-12 rounded-[3rem] border border-border bg-accent/10">
                            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Start your mission today.</h2>
                            <p className="text-xl text-muted-foreground mb-10">Join 1,200+ founders orchestrating their workspaces with Devlomatix.</p>
                            <Link href="/register">
                                <Button size="lg" className="bg-[#0495ff] hover:bg-[#0495ff]/90 text-white font-bold h-14 px-12 rounded-full text-lg shadow-xl shadow-blue-500/10">
                                    Get Started Now <ArrowUpRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </PageTransition>
    )
}
