'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/app/workspace/_components/DataTable";
import {
    Plus,
    Bot,
    Activity,
    Settings2,
    Trash2,
    Play,
    Pause,
    MoreHorizontal,
    ExternalLink,
    Zap
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { BotModal } from "./_components/BotModal";
import { BotFlowBuilderModal } from "./_components/BotFlowBuilderModal";

export default function ChatbotPage() {
    const router = useRouter();
    const params = useParams();
    const workspaceId = params.workspaceId;

    const [bots, setBots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBot, setEditingBot] = useState(null);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [activeBotId, setActiveBotId] = useState(null);

    const fetchBots = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/wa/bot-flow');
            const json = await res.json();
            if (json.success) {
                setBots(json.data);
            }
        } catch (error) {
            toast.error("Failed to load bots");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBots();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this bot?")) return;

        try {
            const res = await fetch(`/api/wa/bot-flow/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setBots(bots.filter(b => b.id !== id));
                toast.success("Bot deleted");
            }
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const handleToggleStatus = async (bot) => {
        try {
            const res = await fetch(`/api/wa/bot-flow/${bot.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !bot.active }),
            });
            if (res.ok) {
                setBots(bots.map(b => b.id === bot.id ? { ...b, active: !b.active } : b));
                toast.success(`Bot ${!bot.active ? 'activated' : 'paused'}`);
            }
        } catch (error) {
            toast.error("Status update failed");
        }
    };

    const columns = [
        {
            accessorKey: "name",
            header: "Bot Name",
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <div className="font-medium">{row.original.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                            {row.original.description || "No description"}
                        </div>
                    </div>
                </div>
            )
        },
        {
            accessorKey: "active",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={row.original.active ? "success" : "secondary"}>
                    {row.original.active ? "Active" : "Paused"}
                </Badge>
            )
        },
        {
            accessorKey: "steps",
            header: "Steps",
            cell: ({ row }) => (
                <span className="text-sm font-medium">
                    {row.original.steps?.length || 0} nodes
                </span>
            )
        },
        {
            accessorKey: "updatedAt",
            header: "Last Updated",
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {new Date(row.original.updatedAt).toLocaleDateString()}
                </span>
            )
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border">
                        <DropdownMenuItem
                            onClick={() => {
                                setActiveBotId(row.original.id);
                                setIsBuilderOpen(true);
                            }}
                            className="gap-2"
                        >
                            <Settings2 className="h-4 w-4" />
                            Workflow Builder
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                setEditingBot(row.original);
                                setIsModalOpen(true);
                            }}
                            className="gap-2"
                        >
                            <Activity className="h-4 w-4" />
                            Edit Metadata
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleToggleStatus(row.original)}
                            className="gap-2"
                        >
                            {row.original.active ? (
                                <>
                                    <Pause className="h-4 w-4 text-warning" />
                                    Pause Bot
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4 text-success" />
                                    Resume Bot
                                </>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => handleDelete(row.original.id)}
                            className="gap-2 text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ];

    const stats = [
        {
            title: "Total Bots",
            value: bots.length,
            icon: Bot,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            title: "Active Flows",
            value: bots.filter(b => b.active).length,
            icon: Activity,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            title: "Total Executions",
            value: "1.2k+", // Mocked for now
            icon: Zap,
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        }
    ];

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">WhatsApp Chatbot</h1>
                    <p className="text-muted-foreground">Automate conversation flows and customer support.</p>
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
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="glassmorphism bg-white/5 border-white/10 backdrop-blur-md overflow-hidden hover:bg-white/10 transition-colors">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Data Table */}
            <div className="space-y-4">
                <DataTable
                    columns={columns}
                    data={bots}
                    searchPlaceholder="Search bots..."
                    enableRowSelection={false}
                />
            </div>

            {/* Modals */}
            <BotModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingBot(null);
                }}
                onSave={(newBot) => {
                    if (editingBot) {
                        setBots(bots.map(b => b.id === newBot.id ? newBot : b));
                    } else {
                        setBots([newBot, ...bots]);
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
