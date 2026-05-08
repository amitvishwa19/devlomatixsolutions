'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Bot,
    Activity,
    Settings2,
    Trash2,
    Play,
    Pause,
    MoreHorizontal,
    Zap,
    Plus,
    Search,
    Filter,
    Loader2,
    BarChart3,
    Clock,
    MessageSquare,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useAction } from "@/hooks/use-action";
import { getBots } from "./_actions/get-bots";
import { deleteBot } from "./_actions/delete-bot";
import { toggleBotStatus } from "./_actions/toggle-bot-status";
import { toast } from "sonner";
import { BotModal } from "./_components/BotModal";
import { BotFlowBuilderModal } from "./_components/BotFlowBuilderModal";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatbotPage() {
    const params = useParams();
    const workspaceId = params.workspaceId;

    const [bots, setBots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBot, setEditingBot] = useState(null);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [activeBotId, setActiveBotId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const { execute: executeGetBots } = useAction(getBots, {
        onSuccess: (data) => {
            setBots(data.bots || []);
            setLoading(false);
        },
        onError: (err) => {
            toast.error(err || "Failed to load bots");
            setLoading(false);
        }
    });

    const fetchBots = () => {
        setLoading(true);
        executeGetBots({ workspaceId });
    };

    useEffect(() => {
        fetchBots();
    }, [workspaceId]);

    const { execute: executeDeleteBot } = useAction(deleteBot, {
        onSuccess: () => {
            toast.success("Bot deleted");
            fetchBots();
        },
        onError: (err) => toast.error(err || "Delete failed")
    });

    const handleDelete = (id) => {
        if (!confirm("Are you sure you want to delete this bot?")) return;
        executeDeleteBot({ workspaceId, id });
    };

    const { execute: executeToggleStatus } = useAction(toggleBotStatus, {
        onSuccess: (data) => {
            toast.success(`Bot ${data.bot.active ? 'activated' : 'paused'}`);
            fetchBots();
        },
        onError: (err) => toast.error(err || "Status update failed")
    });

    const handleToggleStatus = (bot) => {
        executeToggleStatus({ workspaceId, id: bot.id, active: !bot.active });
    };

    const filteredBots = bots.filter(bot => {
        const matchesSearch = bot.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bot.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && bot.active) ||
            (statusFilter === 'paused' && !bot.active);
        return matchesSearch && matchesStatus;
    });

    const stats = [
        {
            title: "Total Bots",
            value: bots.length,
            icon: Bot,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            title: "Active Flows",
            value: bots.filter(b => b.active).length,
            icon: Activity,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
        },
        {
            title: "Total Executions",
            value: "0",
            icon: Zap,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20"
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen  p-6">
                <div className=" mx-auto space-y-6">
                    {/* Header Skeleton */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-12 w-12 rounded-xl bg-white/5" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-48 bg-white/5" />
                                <Skeleton className="h-4 w-64 bg-white/5" />
                            </div>
                        </div>
                        <Skeleton className="h-10 w-32 rounded-xl bg-white/5" />
                    </div>

                    {/* Stats Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[0, 1, 2].map((i) => (
                            <Skeleton key={i} className="h-24 rounded-xl bg-white/5" />
                        ))}
                    </div>

                    {/* Filters Skeleton */}
                    <div className="flex gap-4">
                        <Skeleton className="h-10 flex-1 max-w-md rounded-xl bg-white/5" />
                        <div className="flex gap-2">
                            <Skeleton className="h-10 w-16 rounded-xl bg-white/5" />
                            <Skeleton className="h-10 w-20 rounded-xl bg-white/5" />
                            <Skeleton className="h-10 w-20 rounded-xl bg-white/5" />
                        </div>
                    </div>

                    {/* Bot List Skeleton */}
                    <div className="space-y-3">
                        {[0, 1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-24 rounded-xl bg-white/5" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen  p-6">
            <div className=" mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                                <Bot className="h-6 w-6 text-primary" />
                            </div>
                            WhatsApp Chatbot
                        </h1>
                        <p className="text-sm text-zinc-500 mt-1">Automate conversation flows and customer support</p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditingBot(null);
                            setIsModalOpen(true);
                        }}
                        className="bg-primary hover:bg-primary/90 text-white gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        New Chatbot
                    </Button>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className={`${stat.bg} border ${stat.border} backdrop-blur-xl`}>
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${stat.bg} border ${stat.border}`}>
                                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-400">{stat.title}</p>
                                        <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col md:flex-row gap-4"
                >
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                            placeholder="Search chatbots..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-white/5 border-white/10 text-white"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'active', 'paused'].map((filter) => (
                            <Button
                                key={filter}
                                variant={statusFilter === filter ? "default" : "outline"}
                                size="sm"
                                onClick={() => setStatusFilter(filter)}
                                className={`text-xs font-semibold capitalize ${statusFilter === filter
                                    ? "bg-primary text-white"
                                    : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                                    }`}
                            >
                                {filter}
                            </Button>
                        ))}
                    </div>
                </motion.div>

                {/* Bot List */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-3"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredBots.length === 0 ? (
                            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                                <CardContent className="p-12 flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <Bot className="h-8 w-8 text-zinc-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">
                                        {searchQuery || statusFilter !== 'all'
                                            ? "No bots found"
                                            : "No chatbots yet"}
                                    </h3>
                                    <p className="text-sm text-zinc-500 text-center max-w-md mb-4">
                                        {searchQuery || statusFilter !== 'all'
                                            ? "Try adjusting your search or filters"
                                            : "Create your first chatbot to start automating WhatsApp conversations"}
                                    </p>
                                    {!searchQuery && statusFilter === 'all' && (
                                        <Button
                                            onClick={() => setIsModalOpen(true)}
                                            className="bg-primary hover:bg-primary/90"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Chatbot
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            filteredBots.map((bot, index) => (
                                <motion.div
                                    key={bot.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors overflow-hidden">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 shrink-0">
                                                        <Bot className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-3">
                                                            <h3 className="text-sm font-bold text-white truncate">{bot.name}</h3>
                                                            <Badge
                                                                variant={bot.active ? "default" : "secondary"}
                                                                className={`text-[10px] font-semibold shrink-0 ${bot.active
                                                                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                                                    : "bg-white/10 text-zinc-400 border-white/10"
                                                                    }`}
                                                            >
                                                                {bot.active ? "Active" : "Paused"}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-zinc-500 truncate mt-1">
                                                            {bot.description || "No description"}
                                                        </p>
                                                        <div className="flex items-center gap-4 mt-2 text-[10px] text-zinc-600">
                                                            <span className="flex items-center gap-1">
                                                                <MessageSquare className="w-3 h-3" />
                                                                {Array.isArray(bot.nodes) ? bot.nodes.length : 0} nodes
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                Updated {new Date(bot.updatedAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleToggleStatus(bot)}
                                                        className={`h-9 w-9 rounded-xl ${bot.active
                                                            ? "text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                                                            : "text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                                                            }`}
                                                    >
                                                        {bot.active ? (
                                                            <Pause className="h-4 w-4" />
                                                        ) : (
                                                            <Play className="h-4 w-4" />
                                                        )}
                                                    </Button>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md text-zinc-400 hover:text-white">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-card border">
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setActiveBotId(bot.id);
                                                                    setIsBuilderOpen(true);
                                                                }}
                                                                className="text-xs gap-2"
                                                            >
                                                                <Settings2 className="h-4 w-4" />
                                                                Workflow Builder
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setEditingBot(bot);
                                                                    setIsModalOpen(true);
                                                                }}
                                                                className="text-xs gap-2"
                                                            >
                                                                <Activity className="h-4 w-4" />
                                                                Edit Metadata
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-white/10" />
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(bot.id)}
                                                                className="text-xs gap-2 text-rose-500 focus:text-rose-500"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Modals */}
            <BotModal
                isOpen={isModalOpen}
                workspaceId={workspaceId}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingBot(null);
                }}
                onSave={(savedBot) => {
                    fetchBots();
                    if (!editingBot) {
                        setEditingBot(savedBot);
                        setActiveBotId(savedBot.id);
                        setIsBuilderOpen(true);
                    }
                }}
                bot={editingBot}
            />

            <BotFlowBuilderModal
                isOpen={isBuilderOpen}
                onClose={() => {
                    setIsBuilderOpen(false);
                    setActiveBotId(null);
                }}
                flowId={activeBotId}
            />
        </div>
    );
}
