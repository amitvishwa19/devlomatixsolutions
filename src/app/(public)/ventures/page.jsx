'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    HeartPulse, 
    MessageSquare, 
    Sun, 
    Users, 
    ExternalLink, 
    Mail, 
    ArrowRight,
    Zap,
    Briefcase,
    Gem,
    Activity,
    ShieldCheck,
    Cpu,
    Globe,
    BarChart3,
    Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from 'sonner';

const ventures = [
    {
        name: "Curexa",
        website: "https://curexa.devlomatix.com",
        email: "curexa@devlomatix.com",
        description: "Healthcare technology platform focused on hospital management systems, patient engagement tools, and AI-powered clinic workflow management.",
        icon: HeartPulse,
        color: "emerald",
        tag: "Healthcare Tech",
        metrics: [
            { label: "Hospitals", value: "200+" },
            { label: "Patients", value: "50k+" }
        ],
        features: ["Hospital ERP", "AI Diagnosis", "Telemedicine"],
        tech: ["React", "Python", "AWS"]
    },
    {
        name: "KonnectX",
        website: "https://konnectx.devlomatix.com",
        email: "konnectx@devlomatix.com",
        description: "WhatsApp marketing and communication platform offering bulk messaging, chatbot automation, and CRM integrations.",
        icon: MessageSquare,
        color: "blue",
        tag: "Marketing Automation",
        metrics: [
            { label: "Messages", value: "5M+" },
            { label: "Active Brands", value: "10k+" }
        ],
        features: ["Bulk Sending", "Chatbot Builder", "Lead CRM"],
        tech: ["Node.js", "Redis", "CloudAPI"]
    },
    {
        name: "SolarBright",
        website: "https://solarbright.devlomatix.com",
        email: "solarbright@devlomatix.com",
        description: "Renewable energy brand offering solar panel solutions, rooftop installations, and sustainable power systems for businesses.",
        icon: Sun,
        color: "amber",
        tag: "Clean Energy",
        metrics: [
            { label: "MW Generated", value: "15+" },
            { label: "Installations", value: "2k+" }
        ],
        features: ["Rooftop Solar", "Energy Audit", "IoT Monitoring"],
        tech: ["IoT", "Cloud", "Analytics"]
    },
    {
        name: "CrystalAura",
        website: "https://crystalaura.devlomatix.com",
        email: "crystalaura@devlomatix.com",
        description: "Lifestyle and wellness brand focused on crystals, spiritual products, energy healing accessories, and holistic experiences.",
        icon: Gem,
        color: "purple",
        tag: "Lifestyle & Wellness",
        metrics: [
            { label: "Orders", value: "50k+" },
            { label: "Rating", value: "4.9/5" }
        ],
        features: ["Healing Crystals", "Wellness Decor", "Holistic Gear"],
        tech: ["Next.js", "Shopify", "Stripe"]
    },
    {
        name: "HireFlow",
        website: "https://hireflow.devlomatix.com",
        email: "hireflow@devlomatix.com",
        description: "Smart recruitment platform providing hiring automation, applicant tracking, and talent acquisition solutions.",
        icon: Briefcase,
        color: "indigo",
        tag: "HR Tech",
        metrics: [
            { label: "Candidates", value: "100k+" },
            { label: "Time Saved", value: "30%" }
        ],
        features: ["ATS Workflow", "AI Sourcing", "Interview Bot"],
        tech: ["Next.js", "PostgreSQL", "OpenAI"]
    }
];

const colorVariants = {
    emerald: {
        card: "from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/30 hover:border-emerald-500/60 shadow-xs hover:shadow-xl hover:shadow-emerald-500/15 bg-card",
        icon: "from-emerald-500 to-teal-600 shadow-emerald-500/25",
        bar: "from-emerald-500 via-teal-500 to-cyan-400",
        tag: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    },
    blue: {
        card: "from-blue-500/10 via-sky-500/5 to-transparent border-blue-500/30 hover:border-blue-500/60 shadow-xs hover:shadow-xl hover:shadow-blue-500/15 bg-card",
        icon: "from-blue-500 to-sky-600 shadow-blue-500/25",
        bar: "from-blue-500 via-sky-500 to-indigo-400",
        tag: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
    },
    amber: {
        card: "from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/30 hover:border-amber-500/60 shadow-xs hover:shadow-xl hover:shadow-amber-500/15 bg-card",
        icon: "from-amber-500 to-orange-600 shadow-amber-500/25",
        bar: "from-amber-500 via-orange-500 to-yellow-400",
        tag: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    },
    purple: {
        card: "from-purple-500/10 via-pink-500/5 to-transparent border-purple-500/30 hover:border-purple-500/60 shadow-xs hover:shadow-xl hover:shadow-purple-500/15 bg-card",
        icon: "from-purple-500 to-pink-600 shadow-purple-500/25",
        bar: "from-purple-500 via-pink-500 to-rose-400",
        tag: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25",
    },
    indigo: {
        card: "from-indigo-500/10 via-violet-500/5 to-transparent border-indigo-500/30 hover:border-indigo-500/60 shadow-xs hover:shadow-xl hover:shadow-indigo-500/15 bg-card",
        icon: "from-indigo-500 to-violet-600 shadow-indigo-500/25",
        bar: "from-indigo-500 via-violet-500 to-blue-400",
        tag: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25",
    },
};

export default function VenturesPage() {
    return (
        <TooltipProvider>
            <div className="w-full min-h-screen bg-background relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-40">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] orb-primary rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] orb-secondary rounded-full blur-[120px]" />
                    <div className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] orb-rose rounded-full blur-[120px]" />
                </div>

                <main className="container mx-auto px-6 pt-32 pb-24">
                    {/* Header */}
                    <div className="max-w-4xl mb-24">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <Badge variant="outline" className="bg-red-500/10 text-[#ffd4c5] border-red-500/30 font-bold px-3 py-1 text-[10px] uppercase tracking-[0.2em]">
                                    Active Ecosystem
                                </Badge>
                                <div className="h-px flex-1 bg-gradient-to-r from-orange-500/30 to-transparent" />
                            </div>
                            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-8 leading-[1.1]">
                                Engineering Digital Workplaces <br />
                                Across{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-400 dark:from-red-400 dark:via-orange-400 dark:to-amber-300">
                                    Every Industry Sector.
                                </span>
                            </h1>
                            <p className="text-xl text-muted-foreground font-normal leading-relaxed max-w-2xl">
                                Our ventures leverage unified digital architecture to disrupt traditional markets through artificial intelligence, sustainability, and human-centric product design.
                            </p>
                        </motion.div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {ventures.map((venture, index) => {
                            const variant = colorVariants[venture.color] || colorVariants.blue;
                            return (
                                <motion.div
                                    key={venture.name}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <div className={`group relative h-full flex flex-col rounded-3xl border bg-gradient-to-br transition-all duration-500 p-8 overflow-hidden ${variant.card}`}>
                                        {/* Top gradient accent */}
                                        <div className={`h-1.5 w-full bg-gradient-to-r ${variant.bar} absolute top-0 left-0 opacity-80 group-hover:opacity-100 transition-opacity`} />

                                        {/* Icon & Label */}
                                        <div className="flex items-start justify-between mb-8">
                                            <div className={`p-4 rounded-2xl bg-gradient-to-br ${variant.icon} text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-md`}>
                                                <venture.icon className="w-8 h-8" />
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${variant.tag}`}>
                                                    {venture.tag}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 space-y-6">
                                            <div>
                                                <h3 className="text-3xl font-bold text-foreground mb-3 tracking-tight group-hover:text-primary transition-colors">
                                                    {venture.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                                    {venture.description}
                                                </p>
                                            </div>

                                            {/* Core Features */}
                                            <div className="flex flex-wrap gap-2 py-2">
                                                {venture.features.map(feature => (
                                                    <Badge key={feature} variant="outline" className="rounded-md border-border/60 text-[9px] font-bold bg-background/60 backdrop-blur-sm px-2 py-0.5">
                                                        {feature}
                                                    </Badge>
                                                ))}
                                            </div>

                                            {/* Metrics Grid */}
                                            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-secondary/40 border border-border/50 backdrop-blur-md">
                                                {venture.metrics.map(metric => (
                                                    <div key={metric.label}>
                                                        <p className="text-xl font-bold text-foreground">{metric.value}</p>
                                                        <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">{metric.label}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Actions & Tech */}
                                        <div className="pt-8 mt-8 border-t border-border/10">
                                            <div className="flex items-center justify-between gap-4 mb-6">
                                                <div className="flex gap-2">
                                                    {venture.tech.map(t => (
                                                        <Tooltip key={t}>
                                                            <TooltipTrigger asChild>
                                                                <div className="w-7 h-7 rounded-md border border-border/40 bg-background/50 flex items-center justify-center cursor-help hover:border-primary/40 transition-colors">
                                                                    <span className="text-[8px] font-bold text-muted-foreground group-hover:text-primary transition-colors">
                                                                        {t.substring(0, 2).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="text-[10px] font-bold uppercase tracking-wider">{t}</TooltipContent>
                                                        </Tooltip>
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        onClick={() => toast.info(`Initializing ${venture.name} demo...`)}
                                                        className="p-2 rounded-full bg-background border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all hover:scale-110"
                                                    >
                                                        <Play className="w-3.5 h-3.5 fill-current" />
                                                    </button>
                                                    <a 
                                                        href={`mailto:${venture.email}`}
                                                        className="p-2 rounded-full bg-background border border-border/50 text-muted-foreground hover:text-indigo-500 hover:border-indigo-500/30 transition-all hover:scale-110"
                                                    >
                                                        <Mail className="w-3.5 h-3.5" />
                                                    </a>
                                                </div>
                                            </div>

                                            <Button 
                                                asChild
                                                className="w-full rounded-xl font-bold h-12 bg-foreground text-background hover:bg-primary transition-all duration-300 group/btn shadow-lg"
                                            >
                                                <a href={venture.website} target="_blank" rel="noopener noreferrer">
                                                    Go to Platform
                                                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Partnership Placeholder */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            <div className="h-full rounded-3xl border border-dashed border-border/60 bg-muted/5 p-8 flex flex-col items-center justify-center text-center group hover:bg-primary/[0.01] hover:border-primary/30 transition-all duration-500">
                                <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center border border-border/50 mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 shadow-xl">
                                    <Zap className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-4">Incubate Your Vision</h3>
                                <p className="text-sm text-muted-foreground font-medium max-w-[220px] leading-relaxed opacity-70">
                                    Join the Devlomatix launchpad and turn your disruptive idea into a global venture.
                                </p>
                                <Button variant="ghost" className="mt-10 text-primary font-bold text-xs gap-3 hover:bg-primary/10 rounded-xl px-6">
                                    Apply for Partnership
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </main>

                {/* Footer Section */}
                <div className="mt-12 border-t border-border/50 bg-muted/[0.01]">
                    <div className="container mx-auto px-6 py-32 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-10">
                            <Globe className="w-10 h-10 text-primary animate-pulse" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">Scale Without Boundaries.</h2>
                        <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto font-medium opacity-80 leading-relaxed">
                            Every venture powered by Devlomatix shares our global infrastructure, security protocols, and engineering standards.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6">
                            <Button className="rounded-full px-10 h-14 font-bold bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 text-base">
                                Become a Venture Partner
                            </Button>
                            <Button variant="outline" className="rounded-full px-10 h-14 font-bold border-border/50 hover:bg-background text-base bg-transparent">
                                Infrastructure Specs
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
