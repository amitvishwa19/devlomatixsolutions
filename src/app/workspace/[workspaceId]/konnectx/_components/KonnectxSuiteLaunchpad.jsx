"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
    MessageSquare, Send, Workflow, Bot, Zap, Users, 
    ShoppingCart, FileSpreadsheet, ArrowRight, Sparkles, Layers
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function KonnectxSuiteLaunchpad({ workspaceId }) {
    const router = useRouter();

    const modules = [
        {
            title: "Live Inbox & 2-Way Chats",
            description: "Omnichannel customer messaging, real-time media viewer, contact profiles & AI smart suggestions.",
            icon: MessageSquare,
            href: `/workspace/${workspaceId}/konnectx/chats`,
            badge: "Live 2-Way",
            accent: "text-emerald-500",
            bgAccent: "bg-emerald-500/10 border-emerald-500/20",
            hoverBorder: "hover:border-emerald-500/40"
        },
        {
            title: "Broadcast Campaigns",
            description: "Targeted high-volume WhatsApp broadcasts, rate-limited batch schedules & recipient deliverability logs.",
            icon: Send,
            href: `/workspace/${workspaceId}/konnectx/campaigns`,
            badge: "Broadcast Engine",
            accent: "text-blue-500",
            bgAccent: "bg-blue-500/10 border-blue-500/20",
            hoverBorder: "hover:border-blue-500/40"
        },
        {
            title: "Meta Interactive Flows",
            description: "Native WhatsApp in-chat interactive multi-screen forms for lead capture, surveys, and reservations.",
            icon: Workflow,
            href: `/workspace/${workspaceId}/konnectx/flows`,
            badge: "Interactive Forms",
            accent: "text-purple-500",
            bgAccent: "bg-purple-500/10 border-purple-500/20",
            hoverBorder: "hover:border-purple-500/40"
        },
        {
            title: "AI Chatbots & Auto-Replies",
            description: "Conversational NLP agents powered by Gemini & GPT, keyword rule triggers, and business hour responders.",
            icon: Bot,
            href: `/workspace/${workspaceId}/konnectx/chatbot`,
            badge: "AI Powered",
            accent: "text-amber-500",
            bgAccent: "bg-amber-500/10 border-amber-500/20",
            hoverBorder: "hover:border-amber-500/40"
        },
        {
            title: "Meta Template Studio",
            description: "Rich media headers, variable placeholders, interactive buttons, and one-click Meta Graph sync.",
            icon: Zap,
            href: `/workspace/${workspaceId}/konnectx/template`,
            badge: "Meta Verified",
            accent: "text-indigo-500",
            bgAccent: "bg-indigo-500/10 border-indigo-500/20",
            hoverBorder: "hover:border-indigo-500/40"
        },
        {
            title: "Audience & Contacts Vault",
            description: "Centralized subscriber phone directory, custom tag segmentation, opt-in statuses & bulk CSV imports.",
            icon: Users,
            href: `/workspace/${workspaceId}/konnectx/contacts`,
            badge: "CRM Directory",
            accent: "text-teal-500",
            bgAccent: "bg-teal-500/10 border-teal-500/20",
            hoverBorder: "hover:border-teal-500/40"
        },
        {
            title: "WhatsApp Catalog & Commerce",
            description: "Interactive catalog products, single & multi-item checkout carts, and instant payment alerts.",
            icon: ShoppingBag,
            href: `/workspace/${workspaceId}/konnectx/catalog`,
            badge: "Catalog & Pay",
            accent: "text-rose-500",
            bgAccent: "bg-rose-500/10 border-rose-500/20",
            hoverBorder: "hover:border-rose-500/40"
        },
        {
            title: "Reports & Audit Logs",
            description: "Exportable CSV/JSON message telemetry, error code breakdowns, read timestamps, and delivery audits.",
            icon: FileSpreadsheet,
            href: `/workspace/${workspaceId}/konnectx/reports`,
            badge: "Data Exports",
            accent: "text-sky-500",
            bgAccent: "bg-sky-500/10 border-sky-500/20",
            hoverBorder: "hover:border-sky-500/40"
        }
    ];

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                        <Layers className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground">KonnectX Suite Tools</h3>
                        <p className="text-[11px] text-muted-foreground">Direct access to all WhatsApp Business modules</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {modules.map((m, idx) => (
                    <motion.div
                        key={m.title}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                    >
                        <div
                            onClick={() => router.push(m.href)}
                            className={`p-3.5 rounded-xl bg-card border border-border/70 ${m.hoverBorder} hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between h-full group`}
                        >
                            <div>
                                <div className="flex items-center justify-between mb-2.5">
                                    <div className={`p-2 rounded-lg border ${m.bgAccent} ${m.accent} group-hover:scale-105 transition-transform`}>
                                        <m.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Badge variant="secondary" className="text-[9px] font-mono px-1.5 py-0 bg-secondary/60 border border-border/50">
                                            {m.badge}
                                        </Badge>
                                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                                    </div>
                                </div>

                                <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                                    {m.title}
                                </h4>
                                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                                    {m.description}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
