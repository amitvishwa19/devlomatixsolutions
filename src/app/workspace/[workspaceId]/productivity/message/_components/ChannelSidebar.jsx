'use client';

import {
    Hash,
    Mic,
    Video,
    Settings,
    UserPlus,
    ChevronDown,
    Plus,
    Search,
    MessageSquare
} from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const mockChannels = [
    { id: '1', name: 'general', type: 'TEXT' },
    { id: '2', name: 'announcements', type: 'TEXT' },
    { id: '3', name: 'Daily Standup', type: 'AUDIO' },
    { id: '4', name: 'Project Demo', type: 'VIDEO' },
];

export const ChannelSidebar = () => {
    return (
        <div className="flex flex-col h-full text-primary w-full border-r bg-card">
            {/* Workspace Header */}
            <div className="w-full text-md font-black px-3 flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b">
                <div className="flex items-center gap-x-2">
                    <div className="bg-primary/10 p-1.5 rounded-lg">
                        <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                    <span>Team Chat</span>
                </div>
            </div>

            <ScrollArea className="flex-1 px-3">
                <div className="mt-4">
                    <ChannelSearch />
                </div>

                <div className="space-y-[2px] mt-4">
                    <div className="flex items-center justify-between px-2 py-2">
                        <p className="text-xs uppercase font-black text-zinc-500 dark:text-zinc-400">Channels</p>
                        <button className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition">
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                    {mockChannels.filter(c => c.type === 'TEXT').map(channel => (
                        <ChannelItem key={channel.id} channel={channel} />
                    ))}
                </div>

                <div className="space-y-[2px] mt-4">
                    <div className="flex items-center justify-between px-2 py-2">
                        <p className="text-xs uppercase font-black text-zinc-500 dark:text-zinc-400">Voice & Video</p>
                    </div>
                    {mockChannels.filter(c => c.type !== 'TEXT').map(channel => (
                        <ChannelItem key={channel.id} channel={channel} />
                    ))}
                </div>
            </ScrollArea>


        </div>
    );
};

const ChannelSearch = () => {
    return (
        <button className="group px-2 py-2 rounded-md flex items-center gap-x-2 w-full bg-zinc-700/10 dark:bg-black/20 hover:bg-zinc-700/20 dark:hover:bg-black/30 transition">
            <Search className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <p className="font-bold text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition">
                Search
            </p>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border/10 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto">
                ⌘K
            </kbd>
        </button>
    );
};

const ChannelItem = ({ channel }) => {
    const Icon = channel.type === 'TEXT' ? Hash : channel.type === 'AUDIO' ? Mic : Video;
    return (
        <button className="group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-0.5">
            <Icon className="flex-shrink-0 w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <p className="line-clamp-1 font-bold text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition">
                {channel.name}
            </p>
            <div className="ml-auto flex items-center gap-x-2">
                <Settings className="hidden group-hover:block w-3.5 h-3.5 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition" />
            </div>
        </button>
    );
};
