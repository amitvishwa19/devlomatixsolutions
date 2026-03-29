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
 MessageSquare,
 Loader2,
 User,
 Trash,
 Link
} from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useParams, useRouter } from 'next/navigation';
import useSWR, { useSWRConfig } from 'swr';
import { useState, useEffect } from 'react';
import { CreateChannelModal } from './CreateChannelModal';
import { StartConversationModal } from './StartConversationModal';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
 CommandDialog,
 CommandEmpty,
 CommandGroup,
 CommandInput,
 CommandItem,
 CommandList,
} from "@/components/ui/command";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const fetcher = (url) => fetch(url).then((res) => res.json());

export const ChannelSidebar = () => {
 const params = useParams();
 const workspaceId = params?.workspaceId;
 const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
 const [createChannelType, setCreateChannelType] = useState('TEXT');
 const [isConversationModalOpen, setIsConversationModalOpen] = useState(false);

 const { data: channels, error, isLoading } = useSWR(
 workspaceId ? `/api/workspace/${workspaceId}/productivity/channels` : null,
 fetcher,
 { refreshInterval: 5000 } // Basic polling until Realtime is hooked up to UI
 );

 const { data: conversations, isLoading: convLoading } = useSWR(
 workspaceId ? `/api/workspace/${workspaceId}/productivity/conversations` : null,
 fetcher,
 { refreshInterval: 5000 }
 );

 const textChannels = channels?.filter(c => c.type === 'TEXT') || [];
 const voiceVideoChannels = channels?.filter(c => c.type !== 'TEXT') || [];

 return (
 <div className="flex flex-col h-full text-primary w-full border-r bg-card">
 {/* Workspace Header */}
 <div className="w-full text-md px-3 flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b">
 <div className="flex items-center gap-x-2">
 <div className="bg-primary/10 p-1.5 rounded-lg">
 <MessageSquare className="w-4 h-4 text-primary" />
 </div>
 <span>Team Chat</span>
 </div>
 </div>

 <ScrollArea className="flex-1 px-3">
 <div className="mt-4">
 <ChannelSearch channels={channels || []} />
 </div>

 <div className="space-y-[2px] mt-4">
 <div className="flex items-center justify-between px-2 py-2">
 <p className="text-xs text-zinc-500 dark:text-zinc-400">Channels</p>
 <button
 onClick={() => {
 setCreateChannelType('TEXT');
 setIsCreateModalOpen(true);
 }}
 className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
 >
 <Plus className="h-4 w-4" />
 </button>
 </div>
 {isLoading ? (
 <div className="flex items-center justify-center p-4">
 <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
 </div>
 ) : (
 textChannels.map(channel => (
 <ChannelItem key={channel.id} channel={channel} />
 ))
 )}
 </div>

 <div className="space-y-[2px] mt-4">
 <div className="flex items-center justify-between px-2 py-2">
 <p className="text-xs text-zinc-500 dark:text-zinc-400">Voice & Video</p>
 <button
 onClick={() => {
 setCreateChannelType('AUDIO');
 setIsCreateModalOpen(true);
 }}
 className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
 >
 <Plus className="h-4 w-4" />
 </button>
 </div>
 {isLoading ? (
 <div className="flex items-center justify-center p-4">
 <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
 </div>
 ) : (
 voiceVideoChannels.map(channel => (
 <ChannelItem key={channel.id} channel={channel} />
 ))
 )}
 </div>

 <div className="space-y-[2px] mt-4 mb-4">
 <div className="flex items-center justify-between px-2 py-2">
 <p className="text-xs text-zinc-500 dark:text-zinc-400">Direct Messages</p>
 <button
 onClick={() => setIsConversationModalOpen(true)}
 className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
 >
 <Plus className="h-4 w-4" />
 </button>
 </div>
 {convLoading ? (
 <div className="flex items-center justify-center p-4">
 <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
 </div>
 ) : (
 conversations?.map(conv => (
 <ConversationItem key={conv.id} conversation={conv} />
 ))
 )}
 </div>
 </ScrollArea>
 <CreateChannelModal
 isOpen={isCreateModalOpen}
 onClose={() => setIsCreateModalOpen(false)}
 initialType={createChannelType}
 />
 <StartConversationModal
 isOpen={isConversationModalOpen}
 onClose={() => setIsConversationModalOpen(false)}
 />
 </div>
 );
};

const ChannelSearch = ({ channels }) => {
 const [open, setOpen] = useState(false);
 const router = useRouter();

 useEffect(() => {
 const down = (e) => {
 if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
 e.preventDefault();
 setOpen((open) => !open);
 }
 }
 document.addEventListener("keydown", down);
 return () => document.removeEventListener("keydown", down);
 }, []);

 const onClick = (id) => {
 setOpen(false);
 router.push(`?channelId=${id}`);
 }

 const textChannels = channels.filter(c => c.type === 'TEXT');
 const audioChannels = channels.filter(c => c.type === 'AUDIO');
 const videoChannels = channels.filter(c => c.type === 'VIDEO');

 return (
 <>
 <button
 onClick={() => setOpen(true)}
 className="group px-2 py-2 rounded-lg flex items-center gap-x-2 w-full bg-zinc-700/10 dark:bg-black/20 hover:bg-zinc-700/20 dark:hover:bg-black/30 transition"
 >
 <Search className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
 <p className="font-bold text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition">
 Search
 </p>
 <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border/10 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto">
 ⌘K
 </kbd>
 </button>
 <CommandDialog open={open} onOpenChange={setOpen}>
 <CommandInput placeholder="Search all channels..." />
 <CommandList>
 <CommandEmpty>No Results found</CommandEmpty>
 {textChannels.length > 0 && (
 <CommandGroup heading="Text Channels">
 {textChannels.map((channel) => (
 <CommandItem key={channel.id} onSelect={() => onClick(channel.id)}>
 <Hash className="mr-2 h-4 w-4" />
 <span>{channel.name}</span>
 </CommandItem>
 ))}
 </CommandGroup>
 )}
 {audioChannels.length > 0 && (
 <CommandGroup heading="Audio Channels">
 {audioChannels.map((channel) => (
 <CommandItem key={channel.id} onSelect={() => onClick(channel.id)}>
 <Mic className="mr-2 h-4 w-4" />
 <span>{channel.name}</span>
 </CommandItem>
 ))}
 </CommandGroup>
 )}
 {videoChannels.length > 0 && (
 <CommandGroup heading="Video Channels">
 {videoChannels.map((channel) => (
 <CommandItem key={channel.id} onSelect={() => onClick(channel.id)}>
 <Video className="mr-2 h-4 w-4" />
 <span>{channel.name}</span>
 </CommandItem>
 ))}
 </CommandGroup>
 )}
 </CommandList>
 </CommandDialog>
 </>
 );
};

const ChannelItem = ({ channel }) => {
 const Icon = channel.type === 'TEXT' ? Hash : channel.type === 'AUDIO' ? Mic : Video;
 const router = useRouter();
 const params = useParams();
 const workspaceId = params?.workspaceId;
 const { mutate } = useSWRConfig();
 const [isDeleting, setIsDeleting] = useState(false);

 const onCopy = (e) => {
 e.stopPropagation();
 const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "";
 const inviteUrl = `${origin}/workspace/${workspaceId}/productivity/message?channelId=${channel.id}`;
 navigator.clipboard.writeText(inviteUrl);
 // Could also show a toast here if a Toast provider exists
 alert("Channel link copied to clipboard!");
 };

 const onDelete = async (e) => {
 e.stopPropagation();
 if (channel.name === "general") {
 return alert("Cannot delete the general channel");
 }

 const confirm = window.confirm(`Are you sure you want to delete #${channel.name}?`);
 if (!confirm) return;

 try {
 setIsDeleting(true);
 const res = await fetch(`/api/workspace/${workspaceId}/productivity/channels/${channel.id}`, {
 method: 'DELETE',
 });

 if (!res.ok) {
 const errorText = await res.text();
 throw new Error(errorText);
 }

 mutate(`/api/workspace/${workspaceId}/productivity/channels`);

 // Redirect to general if we deleted the current channel
 const currentUrl = window.location.href;
 if (currentUrl.includes(`channelId=${channel.id}`)) {
 router.push(`/workspace/${workspaceId}/productivity/message`);
 }
 } catch (error) {
 console.error(error);
 alert(`Error: ${error.message}`);
 } finally {
 setIsDeleting(false);
 }
 };

 return (
 <div
 onClick={() => router.push(`?channelId=${channel.id}`)}
 className="group px-2 py-2 rounded-lg flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-0.5 cursor-pointer"
 >
 <Icon className="flex-shrink-0 w-4 h-4 text-zinc-500 dark:text-zinc-400" />
 <p className="line-clamp-1 font-bold text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition">
 {channel.name}
 </p>
 <div className="ml-auto flex items-center gap-x-2">
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <div
 onClick={(e) => e.stopPropagation()}
 className="hidden group-hover:flex items-center justify-center rounded outline-none cursor-pointer"
 >
 <Settings className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition" />
 </div>
 </DropdownMenuTrigger>
 <DropdownMenuContent side="right" align="center" sideOffset={15} className="w-48 bg-white dark:bg-zinc-900 border-none shadow-md">
 <DropdownMenuItem
 onClick={onCopy}
 className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 cursor-pointer"
 >
 <Link className="h-4 w-4 mr-2" />
 Share Link
 </DropdownMenuItem>
 {channel.name !== "general" && (
 <>
 <DropdownMenuSeparator />
 <DropdownMenuItem
 onClick={onDelete}
 disabled={isDeleting}
 className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 cursor-pointer"
 >
 {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash className="h-4 w-4 mr-2" />}
 Delete Channel
 </DropdownMenuItem>
 </>
 )}
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </div>
 );
};

const ConversationItem = ({ conversation }) => {
 const router = useRouter();
 const otherMember = conversation.otherMember;

 return (
 <button
 onClick={() => router.push(`?conversationId=${conversation.id}`)}
 className="group px-2 py-2 rounded-lg flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-0.5"
 >
 <Avatar className="h-6 w-6">
 <AvatarImage src={otherMember?.user?.avatar} />
 <AvatarFallback className="text-[10px] bg-zinc-200 dark:bg-zinc-800">
 {otherMember?.user?.displayName?.[0] || <User className="h-3 w-3" />}
 </AvatarFallback>
 </Avatar>
 <p className="line-clamp-1 font-bold text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition">
 {otherMember?.user?.displayName || "Unknown"}
 </p>
 </button>
 );
};
