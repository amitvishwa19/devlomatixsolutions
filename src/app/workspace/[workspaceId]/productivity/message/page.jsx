'use client';

import {
    Hash,
    Video,
    Search,
    Bell,
    Pin,
    Users,
    HelpCircle,
    PlusCircle,
    Gift,
    Sticker,
    Smile,
    MessageSquare,
    Menu
} from 'lucide-react';
import { ChannelSidebar } from './_components/ChannelSidebar';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';

const mockMessages = [
    { id: '1', user: 'Amit Vishwakarma', content: 'Hey team, I’ve simplified the layout to focus only on channels as requested!', time: 'Today at 2:30 PM', avatar: null },
    { id: '2', user: 'Internal Bot', content: 'Great! This looks much cleaner for our internal workspace.', time: 'Today at 2:32 PM', avatar: null },
    { id: '3', user: 'Amit Vishwakarma', content: 'Next, we will work on the Supabase Realtime integration.', time: 'Today at 2:35 PM', avatar: null },
];

export default function MessagePage() {
    return (
        <div className="flex flex-1 h-full ">
            {/* Navigation Sidebar (Channels Only) reached via page directly now */}
            <div className="hidden md:flex flex-col h-full w-64 z-20">
                <ChannelSidebar />
            </div>

            {/* Main Chat Area */}
            <div className="flex flex-col flex-1 h-full  ">


                {/* Chat Header */}
                <header className="h-12 border-b bg-card border-neutral-200 dark:border-neutral-800 flex items-center px-4 gap-x-2 shadow-sm">
                    <div className="md:hidden">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Menu className="w-5 h-5 text-zinc-500" />
                        </Button>
                    </div>
                    <Hash className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                    <p className="font-black text-md text-zinc-900 dark:text-white">general</p>

                    <div className="ml-auto flex items-center gap-x-4">
                        <Bell className="w-5 h-5 text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300" />
                        <Pin className="w-5 h-5 text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300" />
                        <Users className="w-5 h-5 text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300" />

                        <div className="relative hidden sm:block">
                            <Search className="w-4 h-4 text-zinc-500 dark:text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2" />
                            <input
                                placeholder="Search"
                                className="bg-zinc-200 dark:bg-zinc-900 rounded-md px-2 py-1 text-xs w-36 focus:w-48 transition-all outline-none border border-transparent shadow-inner"
                            />
                        </div>
                        <HelpCircle className="w-5 h-5 text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300" />
                    </div>
                </header>

                {/* Messages List */}
                <ScrollArea className="flex-1 p-4">
                    <div className="flex flex-col gap-y-6">
                        <WelcomeMessage />
                        {mockMessages.map((msg) => (
                            <div key={msg.id} className="flex items-start gap-x-4 group hover:bg-black/5 dark:hover:bg-black/10 -mx-4 px-4 py-1.5 transition relative">
                                <Avatar className="h-10 w-10 border border-border/10 shadow-sm mt-0.5">
                                    <AvatarFallback className="bg-primary/10 text-primary font-black uppercase text-xs">
                                        {msg.user[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col overflow-hidden">
                                    <div className="flex items-center gap-x-2">
                                        <p className="font-black text-primary hover:underline cursor-pointer text-sm">
                                            {msg.user}
                                        </p>
                                        <span className="text-[10px] text-zinc-500 font-bold opacity-60">
                                            {msg.time}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-800 dark:text-zinc-300 font-medium leading-relaxed">
                                        {msg.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {/* Chat Input */}
                <div className="px-4 pb-2 mt-auto">
                    <div className="relative w-full">
                        <button className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full flex items-center justify-center shadow-md">
                            <PlusCircle className="text-white dark:text-[#313338] h-4 w-4" />
                        </button>
                        <input
                            placeholder="Message #general"
                            className="w-full bg-zinc-200/50 dark:bg-[#383A40] border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-700 dark:text-zinc-200 py-3 pl-14 pr-24 rounded-lg font-bold text-sm shadow-sm"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-x-3">
                            <Gift className="w-5 h-5 text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300" />
                            <Sticker className="w-5 h-5 text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300" />
                            <Smile className="w-5 h-5 text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const WelcomeMessage = () => {
    return (
        <div className="flex flex-col items-start gap-y-2 mb-8 px-4">
            <div className="h-16 w-16 rounded-3xl bg-zinc-200 dark:bg-[#404249] flex items-center justify-center shadow-md transform rotate-3 hover:rotate-0 transition">
                <Hash className="h-10 w-10 text-zinc-900 dark:text-white" />
            </div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white mt-4">
                Welcome to #general!
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm max-w-md">
                This is the start of the #general channel. Use this space for team-wide announcements and general discussion.
            </p>
        </div>
    );
}
