'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from '@/components/ui/command';
import {
    LayoutDashboard,
    Bot,
    MessageSquare,
    Share2,
    FolderKanban,
    Users,
    Settings,
    Shield,
    FileText,
    Zap,
    Download,
    SunMoon,
    Code,
    Sparkles,
    CreditCard,
    Cpu,
    Key,
    Tag,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { SETTINGS_SEARCH_INDEX } from '../[workspaceId]/system/_lib/settings-search-index';

export default function WorkspaceCommandPalette({ open, setOpen }) {
    const router = useRouter();
    const params = useParams();
    const { theme, setTheme } = useTheme();
    const workspaceId = params?.workspaceId || 'default';

    useEffect(() => {
        const down = (e) => {
            if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [setOpen]);

    const runCommand = (command) => {
        setOpen(false);
        command();
    };

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <div className="border-b border-border/50 px-3 py-2 bg-card">
                <CommandInput
                    placeholder="Type a command, search modules, or find settings..."
                    className="text-xs"
                />
            </div>
            <CommandList className="max-h-[380px] p-2 bg-card text-foreground">
                <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
                    No results found in workspace.
                </CommandEmpty>

                {/* Workspace Navigation */}
                <CommandGroup heading="Workspace Navigation">
                    <CommandItem
                        onSelect={() => runCommand(() => router.push(`/workspace/${workspaceId}`))}
                        className="flex items-center gap-2 text-xs py-2 cursor-pointer"
                    >
                        <LayoutDashboard className="w-4 h-4 text-primary" />
                        <span>Command Dashboard</span>
                        <CommandShortcut>↵</CommandShortcut>
                    </CommandItem>

                    <CommandItem
                        onSelect={() => runCommand(() => router.push(`/workspace/${workspaceId}/flowgenix`))}
                        className="flex items-center gap-2 text-xs py-2 cursor-pointer"
                    >
                        <Bot className="w-4 h-4 text-purple-500" />
                        <span>FlowGenix AI Studio & Chat</span>
                        <CommandShortcut>AI</CommandShortcut>
                    </CommandItem>

                    <CommandItem
                        onSelect={() => runCommand(() => router.push(`/workspace/${workspaceId}/konnectx`))}
                        className="flex items-center gap-2 text-xs py-2 cursor-pointer"
                    >
                        <MessageSquare className="w-4 h-4 text-emerald-500" />
                        <span>WhatsApp Manager & Campaigns</span>
                        <CommandShortcut>WA</CommandShortcut>
                    </CommandItem>

                    <CommandItem
                        onSelect={() => runCommand(() => router.push(`/workspace/${workspaceId}/article`))}
                        className="flex items-center gap-2 text-xs py-2 cursor-pointer"
                    >
                        <Share2 className="w-4 h-4 text-blue-500" />
                        <span>Social Hub & Article Publisher</span>
                    </CommandItem>

                    <CommandItem
                        onSelect={() => runCommand(() => router.push(`/workspace/${workspaceId}/document`))}
                        className="flex items-center gap-2 text-xs py-2 cursor-pointer"
                    >
                        <FolderKanban className="w-4 h-4 text-amber-500" />
                        <span>Digital Assets & Media Library</span>
                    </CommandItem>

                    <CommandItem
                        onSelect={() => runCommand(() => router.push(`/workspace/${workspaceId}/contact`))}
                        className="flex items-center gap-2 text-xs py-2 cursor-pointer"
                    >
                        <Users className="w-4 h-4 text-indigo-500" />
                        <span>Contacts & CRM Vault</span>
                    </CommandItem>

                    <CommandItem
                        onSelect={() => runCommand(() => router.push(`/workspace/${workspaceId}/system/setting`))}
                        className="flex items-center gap-2 text-xs py-2 cursor-pointer"
                    >
                        <Settings className="w-4 h-4 text-rose-500" />
                        <span>Workspace Settings</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator className="my-1 border-border/40" />

                {/* Quick Actions */}
                <CommandGroup heading="Quick Actions">
                    <CommandItem
                        onSelect={() => runCommand(() => {
                            router.push(`/workspace/${workspaceId}/flowgenix`);
                            toast.info("Navigated to FlowGenix AI Studio");
                        })}
                        className="flex items-center gap-2 text-xs py-2 cursor-pointer"
                    >
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>New FlowGenix Prompt</span>
                    </CommandItem>

                    <CommandItem
                        onSelect={() => runCommand(() => {
                            router.push(`/workspace/${workspaceId}/article`);
                            toast.info("Create a new social post");
                        })}
                        className="flex items-center gap-2 text-xs py-2 cursor-pointer"
                    >
                        <FileText className="w-4 h-4 text-sky-400" />
                        <span>Create Social Post</span>
                    </CommandItem>

                    <CommandItem
                        onSelect={() => runCommand(() => {
                            setTheme(theme === 'dark' ? 'light' : 'dark');
                            toast.success(`Theme switched to ${theme === 'dark' ? 'Light' : 'Dark'} mode`);
                        })}
                        className="flex items-center gap-2 text-xs py-2 cursor-pointer"
                    >
                        <SunMoon className="w-4 h-4 text-primary" />
                        <span>Toggle Color Theme</span>
                        <CommandShortcut>Theme</CommandShortcut>
                    </CommandItem>

                    <CommandItem
                        onSelect={() => runCommand(() => {
                            router.push(`/workspace/${workspaceId}/system/setting`);
                            toast.info("Export backup from Advanced Settings");
                        })}
                        className="flex items-center gap-2 text-xs py-2 cursor-pointer"
                    >
                        <Download className="w-4 h-4 text-emerald-400" />
                        <span>Export Workspace JSON Backup</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator className="my-1 border-border/40" />

                {/* Deep Settings Search */}
                <CommandGroup heading="Settings Deep Search">
                    {SETTINGS_SEARCH_INDEX.slice(0, 10).map((item, idx) => (
                        <CommandItem
                            key={idx}
                            onSelect={() => runCommand(() => {
                                router.push(`/workspace/${workspaceId}/system/setting`);
                            })}
                            className="flex items-center justify-between text-xs py-1.5 cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="font-medium">{item.title}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground uppercase font-mono">
                                {item.tabId}
                            </span>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
