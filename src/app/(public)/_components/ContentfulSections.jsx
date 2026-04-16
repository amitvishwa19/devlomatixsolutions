'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Zap, Shield, Rocket, CheckCircle2, Layout, Workflow, BarChart3 } from 'lucide-react'

// Contentful-style Hero Section - Theme Aware
export const ContentfulHero = ({ imgSrc }) => {
    return (
        <section className="relative pt-32 pb-24 overflow-hidden bg-background">
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 text-left"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase mb-6 border border-primary/20">
                            <Sparkles className="w-3 h-3" />
                            Next-Gen Autonomous Clusters
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground leading-[1.1] mb-8 tracking-tight">
                            Intelligence that scales. <br/>
                            <span className="text-primary">Workforces that deliver.</span>
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium leading-relaxed mb-10 max-w-xl">
                            Devlomatix Swarm Platform helps you personalize, optimize, and orchestrate standout AI-driven workforces at scale. Effortlessly.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/register">
                                <Button size="lg" className="h-14 px-8 rounded-full bg-foreground text-background hover:bg-foreground/90 font-bold text-base shadow-xl shadow-foreground/10 transition-all">
                                    Start your mission for free
                                </Button>
                            </Link>
                            <Button variant="outline" size="lg" className="h-14 px-8 rounded-full border-2 border-border bg-transparent hover:bg-accent text-foreground font-bold text-base">
                                Talk to Sales
                            </Button>
                        </div>
                        <p className="mt-8 text-xs text-muted-foreground flex items-center gap-6">
                           <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card required</span>
                           <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Enterprise-ready clusters</span>
                        </p>
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex-1 relative"
                    >
                        <div className="relative rounded-[2rem] overflow-hidden border border-border shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-card">
                            <Image 
                                src={imgSrc} 
                                alt="Dashboard Preview" 
                                width={1200} 
                                height={800} 
                                className="w-full h-auto object-cover opacity-90 dark:opacity-80"
                            />
                        </div>
                        {/* Abstract background shapes */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -z-10" />
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-400/10 blur-[100px] rounded-full -z-10" />
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

// Minimalist Logo Cloud - Theme Aware
export const TrustedByCloud = () => {
    return (
        <section className="py-20 bg-background border-y border-border">
            <div className="container mx-auto px-6">
                <p className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-12">
                    Trusted by 100+ mission-critical engineering teams globally
                </p>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale contrast-125 dark:invert dark:opacity-30">
                     <div className="text-2xl font-black tracking-tighter italic text-foreground">OPENROUTER</div>
                     <div className="text-2xl font-black tracking-tighter italic text-foreground">GOOGLE AI</div>
                     <div className="text-2xl font-black tracking-tighter italic text-foreground">KONNECTX</div>
                     <div className="text-2xl font-black tracking-tighter italic text-foreground">SWARM v2</div>
                     <div className="text-2xl font-black tracking-tighter italic text-foreground">ANTHROPIC</div>
                </div>
            </div>
        </section>
    )
}

// Unified Platform / Big Value Prop section - Theme Aware
export const UnifiedPlatformSection = () => {
    return (
        <section className="py-32 bg-accent/5">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center mb-24">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight">The Composable Intelligence Platform.</h2>
                    <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                        Build or integrate anything. Orchestrate everything. Reach for new milestones with the platform built to scale with your ambition.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-12">
                    {[
                        { icon: Layout, title: 'Design Missions', desc: 'Visual architect tools to define complex swarm objectives and model fallbacks.' },
                        { icon: Workflow, title: 'Deploy Swarms', desc: 'Instant deployment across mission-critical clusters with automated governance.' },
                        { icon: BarChart3, title: 'Scale Results', desc: 'High-density telemetry and AI-driven analytics to optimize every operation.' }
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col gap-6 p-8 rounded-3xl bg-card border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <item.icon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                            <p className="text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                            <Link href="/register" className="text-primary font-bold text-sm flex items-center gap-2 group">
                                Learn more <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// CTA Section - Theme Aware
export const ContentfulCTA = () => {
    return (
        <section className="py-32 bg-background">
            <div className="container mx-auto px-6">
                <div className="relative p-12 md:p-24 rounded-[3rem] bg-card overflow-hidden text-center border border-border">
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight text-foreground">Start your mission today.</h2>
                        <p className="text-xl text-muted-foreground mb-12 font-medium">
                            Join over 1,200 founders orchestrating their workspaces with Devlomatix.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/register">
                                <Button size="lg" className="h-14 px-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg shadow-2xl transition-all hover:scale-105">
                                    Try for free
                                </Button>
                            </Link>
                            <Button variant="outline" size="lg" className="h-14 px-12 rounded-full border-2 border-border bg-transparent hover:bg-accent text-foreground font-bold text-lg">
                                Talk to Sales
                            </Button>
                        </div>
                    </div>
                    {/* Artistic gradient background */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,var(--color-primary),transparent_100%)] opacity-5" />
                    <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_50%,#6366f1,transparent_100%)] opacity-5" />
                </div>
            </div>
        </section>
    )
}
