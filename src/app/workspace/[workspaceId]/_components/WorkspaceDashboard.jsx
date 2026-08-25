"use client";

import React, { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Share2,
    MessageCircle,
    FileText,
    Settings,
    Plus,
    ArrowRight,
    Zap,
    Users,
    ShieldCheck,
    Activity,
    Bot,
    FolderKanban,
    Sparkles,
    CheckCircle2,
    Clock,
    Server,
    ExternalLink,
    Send,
    Database,
    Shield,
    Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/navigation";
import { useRouter } from "next/navigation";
import { useSettings } from "@/providers/WorkspaceProvider";
import { motion } from "framer-motion";

export default function WorkspaceDashboard({ workspaceId }) {
    const router = useRouter();
    const { settings } = useSettings();
    const workspaceName = settings?.general?.name || settings?.branding?.appName || 'Devlomatix Workspace';

    // Real-time simulated telemetry / stats
    const [stats, setStats] = useState({
        aiTokens: "1.42M",
        waCampaigns: "24",
        storageUsed: "4.2 GB",
        teamMembers: "12",
        activeLeads: "1,280",
        uptime: "99.98%"
    });

    const quickActions = [
        { label: "New AI Chat", icon: Bot, href: `/workspace/${workspaceId}/flowgenix`, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
        { label: "WhatsApp Campaign", icon: MessageCircle, href: `/workspace/${workspaceId}/konnectx`, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
        { label: "Publish Social Post", icon: Share2, href: `/workspace/${workspaceId}/article`, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
        { label: "Add CRM Lead", icon: Users, href: `/workspace/${workspaceId}/contact`, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
    ];

    const modules = [
        {
            title: "FlowGenix AI Studio",
            description: "Omni-route LLM inference, multimodal vision, prompt engineering & telemetry.",
            icon: Bot,
            href: `/workspace/${workspaceId}/flowgenix`,
            badge: "Multi-Model",
            stats: [
                { label: "Tokens Processed", value: stats.aiTokens },
                { label: "Latency", value: "~280ms" }
            ],
            color: "text-purple-500"
        },
        {
            title: "WhatsApp Cloud Manager",
            description: "Direct customer engagement, interactive bot templates and automated campaigns.",
            icon: MessageCircle,
            href: `/workspace/${workspaceId}/konnectx`,
            badge: "Meta API",
            stats: [
                { label: "Status", value: "Connected" },
                { label: "Campaigns", value: stats.waCampaigns }
            ],
            color: "text-emerald-500"
        },
        {
            title: "Digital Assets Vault",
            description: "Secure multi-tenant cloud storage for media, brand PDFs, and assets.",
            icon: FolderKanban,
            href: `/workspace/${workspaceId}/document`,
            badge: "AES-256",
            stats: [
                { label: "Storage", value: stats.storageUsed },
                { label: "Files", value: "248 items" }
            ],
            color: "text-blue-500"
        },
        {
            title: "Social Media Hub",
            description: "Schedule, preview and publish rich content across Meta, X, and LinkedIn.",
            icon: Share2,
            href: `/workspace/${workspaceId}/article`,
            badge: "Multi-Channel",
            stats: [
                { label: "Active Posts", value: "14 scheduled" },
                { label: "Engagement", value: "+28.4%" }
            ],
            color: "text-sky-500"
        },
        {
            title: "Contacts & CRM Vault",
            description: "Centralized customer intelligence, lead qualification, and classification.",
            icon: Users,
            href: `/workspace/${workspaceId}/contact`,
            badge: "CRM Vault",
            stats: [
                { label: "Active Contacts", value: stats.activeLeads },
                { label: "Tags", value: "18 segments" }
            ],
            color: "text-amber-500"
        },
        {
            title: "System & Governance",
            description: "Configure workspace branding, developer webhooks, API keys, and RBAC.",
            icon: Settings,
            href: `/workspace/${workspaceId}/system/setting`,
            badge: "Enterprise",
            stats: [
                { label: "Team", value: `${stats.teamMembers} Members` },
                { label: "Security", value: "MFA Active" }
            ],
            color: "text-rose-500"
        }
    ];

    const recentActivity = [
        { title: "FlowGenix Prompt Generated", meta: "Claude 3.5 Sonnet • 1,420 tokens", time: "2 mins ago", icon: Bot, color: "text-purple-500" },
        { title: "WhatsApp Broadcast Delivered", meta: "Campaign 'Summer VIP' sent to 450 contacts", time: "24 mins ago", icon: MessageCircle, color: "text-emerald-500" },
        { title: "Social Article Published", meta: "Cross-posted to LinkedIn & X", time: "1 hour ago", icon: Share2, color: "text-blue-500" },
        { title: "System Snapshot Created", meta: "Configuration backup exported", time: "3 hours ago", icon: Database, color: "text-amber-500" },
    ];

    const servicesHealth = [
        { name: "OpenAI GPT-4o / Omni", status: "Operational", latency: "240ms" },
        { name: "Google Gemini 2.0 Flash", status: "Operational", latency: "180ms" },
        { name: "Anthropic Claude 3.5", status: "Operational", latency: "310ms" },
        { name: "Meta WhatsApp Cloud API", status: "Operational", latency: "95ms" },
        { name: "Supabase Realtime Engine", status: "Operational", latency: "42ms" },
    ];

    return (
        <div className="space-y-5 pb-10">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative p-5 md:p-6 rounded-xl overflow-hidden bg-card border border-border/60 shadow-sm"
            >
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-2xl">
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold tracking-wider uppercase border border-primary/20">
                                <Zap size={11} className="fill-primary" /> Command Hub
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                                ID: {workspaceId}
                            </span>
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                            {workspaceName}
                        </h1>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Control your multi-model AI workflows, direct customer messaging, media storage, and organization governance from one unified command dashboard.
                        </p>
                    </div>

                    {/* Quick Action Launchpad Buttons */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {quickActions.map((action, idx) => (
                            <Button
                                key={idx}
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(action.href)}
                                className={`h-8 text-xs font-semibold gap-1.5 rounded-sm border border-border/60  cursor-pointer shadow-2xs transition-all`}
                            >
                                <action.icon className="w-3.5 h-3.5" />
                                <span>{action.label}</span>
                            </Button>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {modules.map((m, idx) => (
                    <motion.div
                        key={m.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.04 }}
                    >
                        <div
                            onClick={() => router.push(m.href)}
                            className="p-4 rounded-xl bg-card border border-border/60 hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between h-full group"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`p-2 rounded-lg bg-secondary/40 border border-border/60 ${m.color} group-hover:scale-105 transition-transform`}>
                                        <m.icon size={18} />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Badge variant="secondary" className="text-[9px] font-mono px-1.5 py-0 bg-secondary/50 border border-border/60">
                                            {m.badge}
                                        </Badge>
                                        <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                                    </div>
                                </div>

                                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                                    {m.title}
                                </h3>
                                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                                    {m.description}
                                </p>
                            </div>

                            <div className="pt-2.5 border-t border-border/60 flex items-center justify-between text-xs">
                                {m.stats.map((stat, i) => (
                                    <div key={i} className="flex flex-col">
                                        <span className="text-[10px] text-muted-foreground">{stat.label}</span>
                                        <span className="text-xs font-bold text-foreground">{stat.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Bottom Section: Activity Stream & System Health */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
                {/* Real-time Activity Stream */}
                <Card className="lg:col-span-2 bg-card border-border/60 shadow-xs">
                    <CardHeader className="p-3.5 pb-2 border-b border-border/60 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2">
                                <Activity size={15} className="text-primary" /> Live Activity Feed
                            </CardTitle>
                            <CardDescription className="text-[10px] text-muted-foreground">
                                Real-time events and operations across your workspace
                            </CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/workspace/${workspaceId}/system/setting`)}
                            className="h-7 text-[10px] font-semibold text-primary hover:text-primary hover:bg-primary/10"
                        >
                            View Telemetry
                        </Button>
                    </CardHeader>
                    <CardContent className="p-3 space-y-2">
                        {recentActivity.map((act, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-2 px-2.5 rounded-lg bg-secondary/20 hover:bg-secondary/40 border border-border/60 transition-colors"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className={`p-1.5 rounded-md bg-card border border-border/60 ${act.color} shrink-0`}>
                                        <act.icon size={13} />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-xs font-semibold text-foreground block truncate">{act.title}</span>
                                        <span className="text-[10px] text-muted-foreground block truncate">{act.meta}</span>
                                    </div>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-mono shrink-0 ml-2">
                                    {act.time}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Multi-Service Health Status Matrix */}
                <Card className="bg-card border-border/60 shadow-xs">
                    <CardHeader className="p-3.5 pb-2 border-b border-border/60">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2">
                                <ShieldCheck size={15} className="text-emerald-500" /> Service Status
                            </CardTitle>
                            <Badge variant="outline" className="text-[9px] font-mono text-emerald-500 border-emerald-500/30 bg-emerald-500/10">
                                99.98% UPTIME
                            </Badge>
                        </div>
                        <CardDescription className="text-[10px] text-muted-foreground">
                            Connected APIs & Cloud dispatchers
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 space-y-1.5">
                        {servicesHealth.map((svc) => (
                            <div key={svc.name} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 border border-border/60 text-xs">
                                <span className="font-medium text-foreground text-[11px] truncate max-w-[150px]">{svc.name}</span>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[9px] text-muted-foreground font-mono">{svc.latency}</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}