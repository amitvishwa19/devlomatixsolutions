'use client';

import React from "react";
import { useRouter } from "next/navigation";
import {
    MessageSquare,
    Send,
    Workflow,
    Bot,
    Zap,
    Users,
    FileSpreadsheet,
    ArrowRight,
    Sparkles,
    ShieldAlert,
    Sliders,
    Layers
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function KonnectSuiteLaunchpad({ workspaceId, isConnected = false }) {
    const router = useRouter();

    const modules = [
        {
            title: "Live Inbox & 2-Way Chats",
            description: "Direct real-time customer messaging, media viewer, chat history synchronized with your physical phone.",
            icon: MessageSquare,
            href: `/workspace/${workspaceId}/konnectx-legacy/chats`,
            badge: "Live Phone Sync",
            accent: "text-emerald-500",
            bgAccent: "bg-emerald-500/10 border-emerald-500/20",
            hoverBorder: "hover:border-emerald-500/40"
        },
        {
            title: "Message Templates",
            description: "Create rich reusable WhatsApp templates with media headers, dynamic variables, and interactive buttons.",
            icon: Zap,
            href: `/workspace/${workspaceId}/konnectx-legacy/template`,
            badge: "Instant Approval",
            accent: "text-amber-400",
            bgAccent: "bg-amber-500/10 border-amber-500/20",
            hoverBorder: "hover:border-amber-500/40"
        },
        {
            title: "Broadcast Campaigns",
            description: "Targeted high-volume WhatsApp broadcasts without Meta template approval. Includes smart anti-ban throttler.",
            icon: Send,
            href: `/workspace/${workspaceId}/konnectx-legacy/campaigns`,
            badge: "No Meta Approval",
            accent: "text-blue-500",
            bgAccent: "bg-blue-500/10 border-blue-500/20",
            hoverBorder: "hover:border-blue-500/40"
        },
        {
            title: "Quick Bulk CSV Blaster",
            description: "Upload recipient spreadsheets, merge custom tags like {name}, and dispatch personalized broadcasts in minutes.",
            icon: Zap,
            href: `/workspace/${workspaceId}/konnectx-legacy/bulk-sender`,
            badge: "CSV Blaster",
            accent: "text-indigo-500",
            bgAccent: "bg-indigo-500/10 border-indigo-500/20",
            hoverBorder: "hover:border-indigo-500/40"
        },
        {
            title: "AI Chatbots & Auto-Replies",
            description: "Conversational NLP agents powered by FlowGenix AI with fallback, keyword triggers, and 24/7 auto-responders.",
            icon: Bot,
            href: `/workspace/${workspaceId}/konnectx-legacy/chatbot`,
            badge: "FlowGenix AI",
            accent: "text-amber-500",
            bgAccent: "bg-amber-500/10 border-amber-500/20",
            hoverBorder: "hover:border-amber-500/40"
        },
        {
            title: "Audience & Contacts Vault",
            description: "Subscriber phonebook synchronized from your WhatsApp contacts, custom labels, and segmentation lists.",
            icon: Users,
            href: `/workspace/${workspaceId}/konnectx-legacy/contacts`,
            badge: "Contacts Vault",
            accent: "text-teal-500",
            bgAccent: "bg-teal-500/10 border-teal-500/20",
            hoverBorder: "hover:border-teal-500/40"
        },
        {
            title: "Interactive Flows & Menus",
            description: "Numbered and interactive decision trees for lead qualification, FAQ routing, and booking confirmations.",
            icon: Workflow,
            href: `/workspace/${workspaceId}/konnectx-legacy/flows`,
            badge: "Interactive Menus",
            accent: "text-purple-500",
            bgAccent: "bg-purple-500/10 border-purple-500/20",
            hoverBorder: "hover:border-purple-500/40"
        },
        {
            title: "Delivery Reports & Telemetry",
            description: "Audit logs, timestamped sent/delivered/read receipts, failure diagnostics, and exportable CSV reports.",
            icon: FileSpreadsheet,
            href: `/workspace/${workspaceId}/konnectx-legacy/reports`,
            badge: "Audit Telemetry",
            accent: "text-sky-500",
            bgAccent: "bg-sky-500/10 border-sky-500/20",
            hoverBorder: "hover:border-sky-500/40"
        },
        {
            title: "Anti-Ban & Device Settings",
            description: "Configure humanized typing simulation, randomized jitter delays, batch sizes, and multi-device connection.",
            icon: Sliders,
            href: `/workspace/${workspaceId}/konnectx-legacy/settings`,
            badge: "Anti-Ban Protection",
            accent: "text-rose-500",
            bgAccent: "bg-rose-500/10 border-rose-500/20",
            hoverBorder: "hover:border-rose-500/40"
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Layers size={18} className="text-emerald-400" />
                        Konnect Automation Suite
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Legacy Multi-Device WhatsApp tools. Freeform messaging with zero Meta conversation fees.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {modules.map((mod, i) => (
                    <motion.div
                        key={mod.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                    >
                        <Card
                            onClick={() => router.push(mod.href)}
                            className={`border-border/40 bg-card/40 backdrop-blur-xl rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between h-full ${mod.hoverBorder}`}
                        >
                            <CardContent className="p-0 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className={`p-2.5 rounded-xl border shrink-0 ${mod.bgAccent} ${mod.accent} group-hover:scale-105 transition-transform shadow-xs`}>
                                        <mod.icon size={20} />
                                    </div>
                                    <Badge variant="outline" className={`text-[10px] font-bold border ${mod.bgAccent} ${mod.accent}`}>
                                        {mod.badge}
                                    </Badge>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                                        <span>{mod.title}</span>
                                        <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary" />
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                        {mod.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
