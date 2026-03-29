'use client';

import {
 Hash,
 Video,
 Search,
 Bell,
 Pin,
 Users,
 UserPlus,
 HelpCircle,
 PlusCircle,
 Gift,
 Sticker,
 Smile,
 MessageSquare,
 Menu,
 Loader2,
 User
} from 'lucide-react';
import { ChannelSidebar } from './_components/ChannelSidebar';
import { StartConversationModal } from './_components/StartConversationModal';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { useParams, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { useState, useRef, useEffect, Suspense } from 'react';
import { format } from "date-fns";
import { supabase } from '@/lib/supabase';

const fetcher = (url) => fetch(url).then((res) => res.json());

function MessagePageContent() {
 const params = useParams();
 const searchParams = useSearchParams();
 const urlChannelId = searchParams.get('channelId');
 const urlConversationId = searchParams.get('conversationId');
 const workspaceId = params?.workspaceId;
 const [content, setContent] = useState("");
 const scrollRef = useRef(null);
 const [isDmModalOpen, setIsDmModalOpen] = useState(false);

 // Fetch channels to find the default one
 const { data: channels, isLoading: channelsLoading } = useSWR(
 workspaceId ? `/api/workspace/${workspaceId}/productivity/channels` : null,
 fetcher
 );

 const activeChannel = urlChannelId
 ? channels?.find(c => c.id === urlChannelId)
 : (!urlConversationId ? channels?.find(c => c.type === 'TEXT') : null);
 const channelId = activeChannel?.id;

 // Fetch conversations to find the active one
 const { data: conversations } = useSWR(
 urlConversationId ? `/api/workspace/${workspaceId}/productivity/conversations` : null,
 fetcher
 );
 const activeConversation = conversations?.find(c => c.id === urlConversationId);

 const isDirectMessage = !!urlConversationId;

 // Fetch messages from DB
 const { data: channelMessages, mutate: mutateChannelMsgs, isLoading: channelMsgsLoading } = useSWR(
 channelId ? `/api/workspace/${workspaceId}/productivity/channels/${channelId}/messages` : null,
 fetcher
 );

 const { data: directMsgs, mutate: mutateDirectMsgs, isLoading: directMsgsLoading } = useSWR(
 urlConversationId ? `/api/workspace/${workspaceId}/productivity/conversations/${urlConversationId}/messages` : null,
 fetcher
 );

 const messages = isDirectMessage ? directMsgs : channelMessages;
 const messagesLoading = isDirectMessage ? directMsgsLoading : channelMsgsLoading;
 const mutate = isDirectMessage ? mutateDirectMsgs : mutateChannelMsgs;

 // ---- Supabase Realtime Database Subscription ----
 useEffect(() => {
 const table = isDirectMessage ? 'DirectMessage' : 'Message';
 const filterId = isDirectMessage ? urlConversationId : channelId;
 const filterColumn = isDirectMessage ? 'conversationId' : 'channelId';

 if (!filterId) return;

 console.log(`[Realtime] Subscribing to ${table} changes for ${filterColumn}=${filterId}`);

 const channel = supabase
 .channel(`realtime-${table}-${filterId}`)
 .on(
 'postgres_changes',
 {
 event: '*',
 schema: 'public',
 table: table,
 filter: `${filterColumn}=eq.${filterId}`
 },
 (payload) => {
 console.log('[Realtime] Change received:', payload.eventType);
 // Refetch messages from API to get full data with user info
 mutate();
 }
 )
 .subscribe((status) => {
 console.log(`[Realtime] Subscription status: ${status}`);
 });

 return () => {
 console.log(`[Realtime] Unsubscribing from ${table}-${filterId}`);
 supabase.removeChannel(channel);
 };
 }, [channelId, urlConversationId, isDirectMessage, mutate]);

 // Auto-scroll to bottom
 useEffect(() => {
 if (scrollRef.current) {
 scrollRef.current.scrollIntoView({ behavior: 'smooth' });
 }
 }, [messages]);

 const handleSendMessage = async (e) => {
 if (e.key === 'Enter' && !e.shiftKey) {
 e.preventDefault();
 if (!content.trim() || (!channelId && !urlConversationId)) return;

 const newContent = content;
 setContent("");

 const url = isDirectMessage
 ? `/api/workspace/${workspaceId}/productivity/conversations/${urlConversationId}/messages`
 : `/api/workspace/${workspaceId}/productivity/channels/${channelId}/messages`;

 await fetch(url, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ content: newContent })
 });

 // Immediately refetch for sender
 mutate();
 }
 };




 const displayName = isDirectMessage
 ? activeConversation?.otherMember?.user?.displayName || "Loading..."
 : (channelsLoading ? "..." : (activeChannel?.name || "general"));

 return (
 <div className="flex flex-1 h-full ">
 {/* Navigation Sidebar (Channels Only) reached via page directly now */}
 <div className="hidden md:flex flex-col h-full w-64 z-20">
 <ChannelSidebar />
 </div>

 {/* Main Chat Area */}
 <div className="flex flex-col flex-1 h-full ">


 {/* Chat Header */}
 <header className="h-12 border-b bg-card border-neutral-200 dark:border-neutral-800 flex items-center px-4 gap-x-2 shadow-sm">
 <div className="md:hidden">
 <Button variant="ghost" size="icon" className="h-8 w-8">
 <Menu className="w-5 h-5 text-zinc-500" />
 </Button>
 </div>
 {isDirectMessage ? (
 <User className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
 ) : (
 <Hash className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
 )}
 <p className="text-md text-zinc-900 dark:text-white">
 {displayName}
 </p>

 <div className="ml-auto flex items-center gap-x-4">
 <Bell className="w-5 h-5 text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300" />
 <Pin className="w-5 h-5 text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300" />

 <Users
 onClick={() => setIsDmModalOpen(true)}
 className="w-5 h-5 text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300"
 title="New Direct Message"
 />

 <div className="relative hidden sm:block">
 <Search className="w-4 h-4 text-zinc-500 dark:text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2" />
 <input
 placeholder="Search"
 className="bg-zinc-200 dark:bg-zinc-900 rounded-lg px-2 py-1 text-xs w-36 focus:w-48 transition-all outline-none border border-transparent shadow-inner"
 />
 </div>
 <HelpCircle className="w-5 h-5 text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300" />
 </div>
 </header>

 <StartConversationModal
 isOpen={isDmModalOpen}
 onClose={() => setIsDmModalOpen(false)}
 />

 {/* Messages List */}
 <ScrollArea className="flex-1 p-4">
 <div className="flex flex-col gap-y-6">
 <WelcomeMessage title={displayName} isDirectMessage={isDirectMessage} />

 {messagesLoading ? (
 <div className="flex justify-center p-4">
 <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
 </div>
 ) : (
 messages?.map((msg) => (
 <div key={msg.id} className="flex items-start gap-x-4 group hover:bg-black/5 dark:hover:bg-black/10 -mx-4 px-4 py-1.5 transition relative">
 <Avatar className="h-10 w-10 border border-border/10 shadow-sm mt-0.5">
 <AvatarImage src={msg.member?.user?.avatar} />
 <AvatarFallback className="bg-primary/10 text-primary text-xs">
 {msg.member?.user?.displayName?.[0] || "?"}
 </AvatarFallback>
 </Avatar>
 <div className="flex flex-col overflow-hidden">
 <div className="flex items-center gap-x-2">
 <p className="text-primary hover:underline cursor-pointer text-sm">
 {msg.member?.user?.displayName || "Unknown User"}
 </p>
 <span className="text-[10px] text-zinc-500 font-bold opacity-60">
 {format(new Date(msg.createdAt), "MMM d, yyyy 'at' h:mm a")}
 </span>
 </div>
 <p className="text-sm text-zinc-800 dark:text-zinc-300 font-medium leading-relaxed">
 {msg.content}
 </p>
 </div>
 </div>
 ))
 )}
 <div ref={scrollRef} />
 </div>
 </ScrollArea>

 {/* Chat Input */}
 <div className="px-4 pb-2 mt-auto">
 <div className="relative w-full">
 <button className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full flex items-center justify-center shadow-md">
 <PlusCircle className="text-white dark:text-[#313338] h-4 w-4" />
 </button>
 <input
 placeholder={`Message ${isDirectMessage ? '@' : '#'}${displayName}`}
 value={content}
 onChange={(e) => setContent(e.target.value)}
 onKeyDown={handleSendMessage}
 disabled={messagesLoading || (!channelId && !urlConversationId)}
 className="w-full bg-zinc-200/50 dark:bg-[#383A40] border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0 focus:outline-none text-zinc-700 dark:text-zinc-200 py-3 pl-14 pr-24 rounded-lg font-bold text-sm shadow-sm"
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

const WelcomeMessage = ({ title, isDirectMessage }) => {
 return (
 <div className="flex flex-col items-start gap-y-2 mb-8 px-4">
 <div className="h-16 w-16 rounded-lg bg-zinc-200 dark:bg-[#404249] flex items-center justify-center shadow-md transform rotate-3 hover:rotate-0 transition">
 {isDirectMessage ? (
 <User className="h-10 w-10 text-zinc-900 dark:text-white" />
 ) : (
 <Hash className="h-10 w-10 text-zinc-900 dark:text-white" />
 )}
 </div>
 <h1 className="text-3xl text-zinc-900 dark:text-white mt-4">
 {isDirectMessage ? title : `Welcome to #${title}!`}
 </h1>
 <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm max-w-md">
 {isDirectMessage
 ? `This is the beginning of your direct message history with @${title}.`
 : `This is the start of the #${title} channel. Use this space for team-wide announcements and general discussion.`}
 </p>
 </div>
 );
}

export default function MessagePage() {
 return (
 <Suspense fallback={
 <div className="flex flex-1 h-full items-center justify-center">
 <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
 </div>
 }>
 <MessagePageContent />
 </Suspense>
 );
}
