'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KonnectXModal } from '../_components/konnectx';
import { CurexaModal } from '../_components/curexa';
import { SolarBrightModal } from '../_components/solarbright';
import { HireFlowModal } from '../_components/hireflow';
import { CrystalAuraModal } from '../_components/crystalaura';
import { VenturePartnershipDialog } from '../_components/VenturePartnershipDialog';
import { 
    HeartPulse, 
    MessageSquare, 
    Sun, 
    Mail, 
    ArrowRight,
    Zap,
    Briefcase,
    Gem,
    Globe,
    Play,
    Search,
    Shield,
    Cpu,
    Database,
    Sparkles,
    CheckCircle2,
    SlidersHorizontal,
    TrendingUp,
    ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from 'sonner';

const ventures = [
    {
        name: "Curexa",
        slug: "curexa",
        website: "https://curexa.devlomatix.com",
        email: "curexa@devlomatix.com",
        description: "Comprehensive healthcare ecosystem offering digital hospital management, EHR integration, AI-driven diagnostics, and seamless doctor-patient telehealth portals.",
        icon: HeartPulse,
        color: "emerald",
        tag: "Healthcare Tech",
        category: "Healthcare",
        metrics: [
            { label: "Hospitals", value: "200+" },
            { label: "Patients", value: "50k+" }
        ],
        features: ["Hospital ERP", "AI Diagnosis", "Telemedicine"],
        tech: ["React", "Python", "AWS"],
        sla: "99.99%",
        status: "Live & Operational"
    },
    {
        name: "KonnectX",
        slug: "konnectx",
        website: "https://konnectx.devlomatix.com",
        email: "konnectx@devlomatix.com",
        description: "Official WhatsApp Cloud API & conversational marketing platform delivering multi-agent team inboxes, smart chatbot builders, and automated CRM broadcasting.",
        icon: MessageSquare,
        color: "blue",
        tag: "Marketing Automation",
        category: "Marketing & Telecom",
        metrics: [
            { label: "Messages", value: "5M+" },
            { label: "Active Brands", value: "10k+" }
        ],
        features: ["Bulk Sending", "Chatbot Builder", "Lead CRM"],
        tech: ["Node.js", "Redis", "CloudAPI"],
        sla: "99.98%",
        status: "Live & Operational"
    },
    {
        name: "SolarBright",
        slug: "solarbright",
        website: "https://solarbright.devlomatix.com",
        email: "solarbright@devlomatix.com",
        description: "Next-generation clean energy venture providing commercial rooftop solar installations, battery storage microgrids, and real-time IoT smart energy telemetry.",
        icon: Sun,
        color: "amber",
        tag: "Clean Energy",
        category: "Clean Energy",
        metrics: [
            { label: "MW Generated", value: "15+" },
            { label: "Installations", value: "2k+" }
        ],
        features: ["Rooftop Solar", "Energy Audit", "IoT Monitoring"],
        tech: ["IoT", "Cloud", "Analytics"],
        sla: "99.95%",
        status: "Live & Operational"
    },
    {
        name: "CrystalAura",
        slug: "crystalaura",
        website: "https://crystalaura.devlomatix.com",
        email: "crystalaura@devlomatix.com",
        description: "Holistic wellness brand delivering 100% natural certified minerals, Ganga-consecrated chakra bracelets, healing spheres, and Vedic spatial Vastu stones.",
        icon: Gem,
        color: "purple",
        tag: "Lifestyle & Wellness",
        category: "Wellness & E-Com",
        metrics: [
            { label: "Orders", value: "50k+" },
            { label: "Rating", value: "4.9/5" }
        ],
        features: ["Healing Crystals", "Wellness Decor", "Vastu Stones"],
        tech: ["Next.js", "Shopify", "Stripe"],
        sla: "99.99%",
        status: "Live & Operational"
    },
    {
        name: "HireFlow",
        slug: "hireflow",
        website: "https://hireflow.devlomatix.com",
        email: "hireflow@devlomatix.com",
        description: "Intelligent recruitment ATS built with AI candidate scoring, multi-stage drag-and-drop Kanban pipelines, automated email cadences, and compliance auditing.",
        icon: Briefcase,
        color: "indigo",
        tag: "HR Tech",
        category: "HR & Recruitment",
        metrics: [
            { label: "Candidates", value: "100k+" },
            { label: "Time Saved", value: "40%" }
        ],
        features: ["ATS Workflow", "AI Sourcing", "Interview Bot"],
        tech: ["Next.js", "PostgreSQL", "OpenAI"],
        sla: "99.99%",
        status: "Live & Operational"
    }
];

const categories = [
    "All Sectors",
    "Healthcare",
    "Marketing & Telecom",
    "Clean Energy",
    "HR & Recruitment",
    "Wellness & E-Com"
];

const aggregateMetrics = [
    { label: "Active Ventures", value: "5", change: "+100% YoY", icon: Globe },
    { label: "Active End Users", value: "150k+", change: "Global Reach", icon: TrendingUp },
    { label: "Monthly Operations", value: "5M+", change: "High Throughput", icon: Zap },
    { label: "Clean Energy Monitored", value: "15+ MW", change: "Carbon Offset", icon: Sun },
    { label: "Platform Uptime SLA", value: "99.99%", change: "Enterprise Tier", icon: Shield },
];

const colorVariants = {
    emerald: {
        card: "from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/30 hover:border-emerald-500/60 shadow-xs hover:shadow-xl hover:shadow-emerald-500/15 bg-card",
        icon: "from-emerald-500 to-teal-600 shadow-emerald-500/25",
        bar: "from-emerald-500 via-teal-500 to-cyan-400",
        tag: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
        btn: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20",
    },
    blue: {
        card: "from-blue-500/10 via-sky-500/5 to-transparent border-blue-500/30 hover:border-blue-500/60 shadow-xs hover:shadow-xl hover:shadow-blue-500/15 bg-card",
        icon: "from-blue-500 to-sky-600 shadow-blue-500/25",
        bar: "from-blue-500 via-sky-500 to-indigo-400",
        tag: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
        btn: "bg-primary hover:bg-primary/90 text-white shadow-primary/20",
    },
    amber: {
        card: "from-teal-500/10 via-cyan-500/5 to-transparent border-teal-500/30 hover:border-teal-500/60 shadow-xs hover:shadow-xl hover:shadow-teal-500/15 bg-card",
        icon: "from-teal-500 to-cyan-600 shadow-teal-500/25",
        bar: "from-teal-500 via-cyan-500 to-emerald-400",
        tag: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/25",
        btn: "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20",
    },
    purple: {
        card: "from-purple-500/10 via-pink-500/5 to-transparent border-purple-500/30 hover:border-purple-500/60 shadow-xs hover:shadow-xl hover:shadow-purple-500/15 bg-card",
        icon: "from-purple-500 to-pink-600 shadow-purple-500/25",
        bar: "from-purple-500 via-pink-500 to-rose-400",
        tag: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25",
        btn: "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20",
    },
    indigo: {
        card: "from-indigo-500/10 via-violet-500/5 to-transparent border-indigo-500/30 hover:border-indigo-500/60 shadow-xs hover:shadow-xl hover:shadow-indigo-500/15 bg-card",
        icon: "from-indigo-500 to-violet-600 shadow-indigo-500/25",
        bar: "from-indigo-500 via-violet-500 to-blue-400",
        tag: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25",
        btn: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20",
    },
};

export default function VenturesPage() {
    const [isKonnectXOpen, setIsKonnectXOpen] = useState(false);
    const [isCurexaOpen, setIsCurexaOpen] = useState(false);
    const [isSolarBrightOpen, setIsSolarBrightOpen] = useState(false);
    const [isHireFlowOpen, setIsHireFlowOpen] = useState(false);
    const [isCrystalAuraOpen, setIsCrystalAuraOpen] = useState(false);
    const [isPartnershipOpen, setIsPartnershipOpen] = useState(false);

    const [activeCategory, setActiveCategory] = useState("All Sectors");
    const [searchQuery, setSearchQuery] = useState("");

    // Hash sync for deep-linking
    useEffect(() => {
        const handleHash = () => {
            const hash = window.location.hash.replace("#", "").toLowerCase();
            if (hash === "konnectx") setIsKonnectXOpen(true);
            else if (hash === "curexa") setIsCurexaOpen(true);
            else if (hash === "solarbright") setIsSolarBrightOpen(true);
            else if (hash === "hireflow") setIsHireFlowOpen(true);
            else if (hash === "crystalaura") setIsCrystalAuraOpen(true);
        };

        handleHash();
        window.addEventListener("hashchange", handleHash);
        return () => window.removeEventListener("hashchange", handleHash);
    }, []);

    const openVenture = (name) => {
        const venture = ventures.find(v => v.name === name);
        if (venture) {
            window.history.replaceState(null, '', `#${venture.slug}`);
        }

        if (name === "KonnectX") setIsKonnectXOpen(true);
        else if (name === "Curexa") setIsCurexaOpen(true);
        else if (name === "SolarBright") setIsSolarBrightOpen(true);
        else if (name === "HireFlow") setIsHireFlowOpen(true);
        else if (name === "CrystalAura") setIsCrystalAuraOpen(true);
        else toast.info(`Initializing ${name} demo...`);
    };

    const handleCloseModal = (setter) => {
        setter(false);
        if (typeof window !== "undefined") {
            window.history.replaceState(null, '', window.location.pathname);
        }
    };

    // Filtered ventures
    const filteredVentures = useMemo(() => {
        return ventures.filter((v) => {
            const matchesCategory =
                activeCategory === "All Sectors" ||
                v.category === activeCategory ||
                v.tag.toLowerCase().includes(activeCategory.toLowerCase());

            const q = searchQuery.trim().toLowerCase();
            const matchesSearch =
                !q ||
                v.name.toLowerCase().includes(q) ||
                v.description.toLowerCase().includes(q) ||
                v.tag.toLowerCase().includes(q) ||
                v.features.some(f => f.toLowerCase().includes(q)) ||
                v.tech.some(t => t.toLowerCase().includes(q));

            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, searchQuery]);

    return (
        <TooltipProvider>
            <div className="w-full min-h-screen bg-background relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-40">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] orb-primary rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] orb-secondary rounded-full blur-[120px]" />
                    <div className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] orb-rose rounded-full blur-[120px]" />
                </div>

                <main className="container mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-24">
                    {/* Header */}
                    <div className="max-w-4xl mb-12 sm:mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-semibold px-3 py-1 text-[11px] uppercase tracking-wider">
                                    Active Ecosystem Portfolio
                                </Badge>
                                <div className="h-px flex-1 bg-gradient-to-r from-primary/25 to-transparent" />
                            </div>

                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.12]">
                                Engineering Digital Workplaces <br className="hidden sm:inline" />
                                Across{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-indigo-500">
                                    Every Industry Sector.
                                </span>
                            </h1>

                            <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed max-w-2xl">
                                Our ventures leverage unified digital architecture to disrupt traditional markets through artificial intelligence, sustainability, and human-centric product design. Click any card to launch its live 1-page platform preview.
                            </p>
                        </motion.div>
                    </div>

                    {/* Ecosystem Aggregate Metrics Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="mb-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 p-4 sm:p-6 rounded-3xl bg-secondary/30 border border-border/50 backdrop-blur-xl shadow-lg"
                    >
                        {aggregateMetrics.map((m) => {
                            const Icon = m.icon;
                            return (
                                <div key={m.label} className="p-3 sm:p-4 rounded-2xl bg-background/50 border border-border/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider line-clamp-1">
                                            {m.label}
                                        </span>
                                        <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                                    </div>
                                    <div className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                                        {m.value}
                                    </div>
                                    <div className="text-[11px] font-medium text-emerald-500 mt-0.5">
                                        {m.change}
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>

                    {/* Search & Sector Filters Bar */}
                    <div className="mb-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                        {/* Sector Filter Pills */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                        activeCategory === cat
                                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                            : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/70 border border-border/40"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full md:w-72 shrink-0">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, tech, or feature..."
                                className="w-full pl-9 pr-4 py-2 rounded-xl bg-background/80 border border-border/60 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary backdrop-blur-md"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Grid */}
                    {filteredVentures.length === 0 ? (
                        <div className="p-12 text-center rounded-3xl border border-dashed border-border/60 bg-muted/5 max-w-md mx-auto my-12">
                            <SlidersHorizontal className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                            <h3 className="text-base font-bold text-foreground">No matching ventures found</h3>
                            <p className="text-xs text-muted-foreground mt-1 mb-4">
                                Try searching for another keyword or reset the sector filter.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setActiveCategory("All Sectors"); setSearchQuery(""); }}
                            >
                                Reset All Filters
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredVentures.map((venture, index) => {
                                const variant = colorVariants[venture.color] || colorVariants.blue;
                                return (
                                    <motion.div
                                        key={venture.name}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.08 }}
                                    >
                                        <div 
                                            onClick={() => openVenture(venture.name)}
                                            className={`group relative h-full flex flex-col rounded-3xl border bg-gradient-to-br transition-all duration-500 p-8 overflow-hidden cursor-pointer ${variant.card}`}
                                        >
                                            {/* Top gradient accent */}
                                            <div className={`h-1.5 w-full bg-gradient-to-r ${variant.bar} absolute top-0 left-0 opacity-80 group-hover:opacity-100 transition-opacity`} />

                                            {/* Top operational badge */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-background/80 border border-border/50 text-[10px] font-semibold text-muted-foreground">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span>{venture.status}</span>
                                                </div>
                                                <span className="text-[10px] font-mono font-semibold text-muted-foreground/80">
                                                    SLA: {venture.sla}
                                                </span>
                                            </div>

                                            {/* Icon & Label */}
                                            <div className="flex items-start justify-between mb-6">
                                                <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${variant.icon} text-white group-hover:scale-105 group-hover:rotate-2 transition-all duration-500 shadow-md`}>
                                                    <venture.icon className="w-7 h-7" />
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${variant.tag}`}>
                                                        {venture.tag}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 space-y-6">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-foreground mb-2.5 tracking-tight group-hover:text-primary transition-colors flex items-center justify-between">
                                                        <span>{venture.name}</span>
                                                        <Sparkles className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground font-normal leading-relaxed">
                                                        {venture.description}
                                                    </p>
                                                </div>

                                                {/* Core Features */}
                                                <div className="flex flex-wrap gap-2 py-1">
                                                    {venture.features.map(feature => (
                                                        <Badge key={feature} variant="outline" className="rounded-md border-border/70 text-[10px] font-medium bg-background/80 backdrop-blur-sm px-2.5 py-0.5 text-foreground/80">
                                                            {feature}
                                                        </Badge>
                                                    ))}
                                                </div>

                                                {/* Metrics Grid */}
                                                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-secondary/30 border border-border/40 backdrop-blur-md">
                                                    {venture.metrics.map(metric => (
                                                        <div key={metric.label}>
                                                            <p className="text-lg font-bold text-foreground tracking-tight">{metric.value}</p>
                                                            <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">{metric.label}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Actions & Tech */}
                                            <div className="pt-6 mt-6 border-t border-border/20">
                                                <div className="flex items-center justify-between gap-4 mb-5">
                                                    <div className="flex gap-2">
                                                        {venture.tech.map(t => (
                                                            <Tooltip key={t}>
                                                                <TooltipTrigger asChild>
                                                                    <div 
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="w-7 h-7 rounded-md border border-border/40 bg-background/60 flex items-center justify-center cursor-help hover:border-primary/40 transition-colors"
                                                                    >
                                                                        <span className="text-[9px] font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                                                                            {t.substring(0, 2).toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="text-[10px] font-semibold uppercase tracking-wider">{t}</TooltipContent>
                                                            </Tooltip>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-2.5">
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openVenture(venture.name);
                                                            }}
                                                            className="p-2 rounded-full bg-background border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all hover:scale-105 cursor-pointer"
                                                            title="Launch Platform Preview"
                                                        >
                                                            <Play className="w-3.5 h-3.5 fill-current" />
                                                        </button>
                                                        <a 
                                                            href={`mailto:${venture.email}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="p-2 rounded-full bg-background border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all hover:scale-105 cursor-pointer"
                                                            title={`Email ${venture.name} team`}
                                                        >
                                                            <Mail className="w-3.5 h-3.5" />
                                                        </a>
                                                    </div>
                                                </div>

                                                <Button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openVenture(venture.name);
                                                    }}
                                                    className={`w-full rounded-xl font-bold h-11 transition-all duration-300 group/btn shadow-md cursor-pointer ${variant.btn}`}
                                                >
                                                    Explore Platform
                                                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {/* Partnership Incubator Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <div 
                                    onClick={() => setIsPartnershipOpen(true)}
                                    className="h-full rounded-3xl border border-dashed border-border/80 bg-muted/5 p-8 flex flex-col items-center justify-center text-center group hover:bg-primary/[0.02] hover:border-primary/40 transition-all duration-500 cursor-pointer"
                                >
                                    <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center border border-border/50 mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 shadow-xl">
                                        <Zap className="w-8 h-8 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2">Incubate Your Vision</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-[240px] leading-relaxed opacity-80">
                                        Join the Devlomatix launchpad and turn your disruptive market idea into a global enterprise venture.
                                    </p>
                                    <Button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsPartnershipOpen(true);
                                        }}
                                        variant="outline" 
                                        className="mt-8 text-primary font-bold text-xs gap-2 rounded-xl px-6 border-primary/30 hover:bg-primary/10"
                                    >
                                        Apply for Partnership
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Shared Multi-Venture Core Architecture */}
                    <section className="mt-24 pt-16 border-t border-border/40">
                        <div className="max-w-3xl mb-12">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-semibold px-3 py-1 text-[11px] uppercase tracking-wider mb-3">
                                Unified Foundation
                            </Badge>
                            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                                The Devlomatix Core Architecture Engine
                            </h2>
                            <p className="text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed">
                                Every venture in our ecosystem shares standardized compliance, distributed cloud topologies, and proprietary intelligence pipelines.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/30 transition-all">
                                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <h3 className="text-base font-bold text-foreground mb-1.5">Zero-Trust Security</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Shared HIPAA, GDPR, and SOC-2 Type II compliance baselines with KMS hardware-level encryption at rest and in transit.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/30 transition-all">
                                <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4">
                                    <Cpu className="h-5 w-5" />
                                </div>
                                <h3 className="text-base font-bold text-foreground mb-1.5">Global Edge Cloud</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Ultra-low latency edge CDN distribution, Redis microservice event brokers, and 99.99% multi-region failover SLA.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/30 transition-all">
                                <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <h3 className="text-base font-bold text-foreground mb-1.5">Agentic AI Pipeline</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Proprietary fine-tuned embeddings, conversational agent frameworks, and specialized medical/recruiting semantic models.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/30 transition-all">
                                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                                    <Database className="h-5 w-5" />
                                </div>
                                <h3 className="text-base font-bold text-foreground mb-1.5">Unified Commerce</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Multi-currency payment pipelines, automated usage-based metering, and consolidated real-time revenue telemetry.
                                </p>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer Section */}
                <div className="mt-12 border-t border-border/50 bg-muted/[0.01]">
                    <div className="container mx-auto px-6 py-24 sm:py-32 flex flex-col items-center text-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mb-8 sm:mb-10">
                            <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-pulse" />
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6 tracking-tight">Scale Without Boundaries.</h2>
                        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-12 max-w-xl mx-auto font-medium opacity-80 leading-relaxed">
                            Every venture powered by Devlomatix shares our global infrastructure, security protocols, and engineering standards.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                            <Button 
                                onClick={() => setIsPartnershipOpen(true)}
                                className="rounded-full px-8 sm:px-10 h-12 sm:h-14 font-bold bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 text-sm sm:text-base cursor-pointer"
                            >
                                Become a Venture Partner
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => toast.info("Devlomatix ISO/SOC-2 architecture whitepaper is available upon request.")}
                                className="rounded-full px-8 sm:px-10 h-12 sm:h-14 font-bold border-border/50 hover:bg-background text-sm sm:text-base bg-transparent cursor-pointer"
                            >
                                Infrastructure Specs
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 1. KonnectX 1-Page Website Modal */}
                <KonnectXModal 
                    isOpen={isKonnectXOpen} 
                    onClose={() => handleCloseModal(setIsKonnectXOpen)} 
                />

                {/* 2. Curexa 1-Page Website Modal */}
                <CurexaModal 
                    isOpen={isCurexaOpen} 
                    onClose={() => handleCloseModal(setIsCurexaOpen)} 
                />

                {/* 3. SolarBright 1-Page Website Modal */}
                <SolarBrightModal 
                    isOpen={isSolarBrightOpen} 
                    onClose={() => handleCloseModal(setIsSolarBrightOpen)} 
                />

                {/* 4. HireFlow 1-Page Website Modal */}
                <HireFlowModal 
                    isOpen={isHireFlowOpen} 
                    onClose={() => handleCloseModal(setIsHireFlowOpen)} 
                />

                {/* 5. CrystalAura 1-Page Website Modal */}
                <CrystalAuraModal 
                    isOpen={isCrystalAuraOpen} 
                    onClose={() => handleCloseModal(setIsCrystalAuraOpen)} 
                />

                {/* Venture Partnership / Incubation Dialog */}
                <VenturePartnershipDialog
                    isOpen={isPartnershipOpen}
                    onClose={() => setIsPartnershipOpen(false)}
                />
            </div>
        </TooltipProvider>
    );
}
