'use client'
import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LayoutGrid, Rocket, Shield, Zap, Check, ArrowRight, ArrowUpRight, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

export const GravityHero = ({ imgSrc }) => {
    return (
        <section className="relative pt-32 pb-20 overflow-hidden bg-background">
            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-8">
                        Ship your mission <br /> <span className="text-[#0495ff]">10x faster</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                        The ultimate SaaS mission control for high-performance agent deployment and multi-tenant workspace management. Built for scale.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/register">
                            <Button size="lg" className="bg-[#0495ff] hover:bg-[#0495ff]/90 text-white font-bold h-14 px-10 rounded-full text-lg shadow-lg shadow-blue-500/10">
                                Get Started <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Button size="lg" variant="outline" className="h-14 px-10 rounded-full text-lg border-border hover:bg-accent transition-all">
                            Live Demo
                        </Button>
                    </div>
                </div>

                <div className="relative max-w-6xl mx-auto">
                    <div className="absolute inset-x-0 -top-40 -bottom-40 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 blur-3xl pointer-events-none" />
                    <div className=" border-border rounded-xl border-2">
                        <div className="shimmer-container rounded-lg border border-border bg-card shadow-2xl shadow-primary/5 p-3 overflow-hidden">
                            <img
                                src={imgSrc}
                                alt="AI Dashboard Preview"
                                className="w-full h-auto rounded-[1.8rem] shadow-inner"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export const GravityFeatures = () => {
    const features = [
        {
            title: "Multi-Tenant Hub",
            desc: "One engine to power all your branches. Manage unique sites from a single unified hub.",
            icon: LayoutGrid,
        },
        {
            title: "Swarm Orchestrator",
            desc: "Deploy prioritized model chains with resilient telemetry and automated failover.",
            icon: Rocket,
        },
        {
            title: "KonnectX Bridge",
            desc: "Native integration for WhatsApp, Social Media, and E-commerce automation.",
            icon: Zap,
        },
        {
            title: "Enterprise Security",
            desc: "Role-based access control and encrypted credential management for every mission.",
            icon: Shield,
        },
        {
            title: "Global Scale",
            desc: "Global mission deployment with high-performance low-latency architecture.",
            icon: Globe,
        },
        {
            title: "Custom Missions",
            desc: "Build and deploy custom agent behaviors tailored to your specific frontend needs.",
            icon: Check,
        }
    ]

    return (
        <section id="features" className="py-24 bg-background border-t border-border">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Powerful foundations.</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">Everything you need to orchestrate complex missions from a single mission control center.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {features.map((f, i) => (
                        <div key={i} className=" border-border rounded-xl borde">
                            <div className="shimmer-container h-full p-8 rounded-xl border border-border bg-card transition-all duration-500">
                                <div className="mb-6 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-[#0495ff]">
                                    <f.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-3">{f.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const GravityPricing = () => {
    const tiers = [
        {
            name: "Founder",
            price: "599",
            desc: "Perfect for single branch missions.",
            features: ["1 Workspace", "3 Agents", "KonnectX Bridge", "Basic Telemetry"]
        },
        {
            name: "Agent Hub",
            price: "999",
            featured: true,
            desc: "Our most popular mission engine.",
            features: ["5 Workspaces", "10 Agents", "Advanced Swarm Logic", "24/7 Monitoring"]
        },
        {
            name: "Enterprise",
            price: "1,499",
            desc: "For massive multi-tenant scale.",
            features: ["Unlimited Workspaces", "Custom Agents", "Priority Node Support", "White-label Frontend"]
        }
    ]

    return (
        <section id="pricing" className="py-24 bg-accent/30 border-t border-border">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Straightforward pricing.</h2>
                    <p className="text-muted-foreground text-lg">No hidden mission costs. Pick a plan that fits your scale.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {tiers.map((tier, i) => (
                        <div key={i} className={cn(
                            "relative p-10 rounded-[2.5rem] border bg-card transition-all duration-300",
                            tier.featured ? "border-[#0495ff] shadow-2xl shadow-blue-500/10 scale-105 z-10" : "border-border shadow-md"
                        )}>
                            {tier.featured && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0495ff] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                                    Best Value
                                </div>
                            )}
                            <h3 className="text-2xl font-bold text-foreground mb-2">{tier.name}</h3>
                            <p className="text-muted-foreground mb-8 text-sm">{tier.desc}</p>
                            <div className="mb-10">
                                <span className="text-5xl font-bold text-foreground">
                                    ₹{tier.price}
                                </span>
                                <span className="text-muted-foreground font-medium ml-2">/month</span>
                            </div>
                            <ul className="space-y-4 mb-10">
                                {tier.features.map((f, j) => (
                                    <li key={j} className="flex items-center gap-3 text-sm text-foreground/80 font-medium">
                                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[#0495ff]">
                                            <Check className="w-3 h-3" />
                                        </div>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <Button className={cn(
                                "w-full h-12 rounded-full font-bold transition-all",
                                tier.featured ? "bg-[#0495ff] hover:bg-[#0495ff]/90 text-white" : "bg-accent hover:bg-accent/80 text-foreground"
                            )}>
                                {tier.price === "Custom" ? "Contact Support" : "Get Started Now"}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
