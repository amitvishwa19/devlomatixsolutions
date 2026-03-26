'use client';

import React from 'react';
import { 
 Inbox, 
 Send, 
 File, 
 Trash2, 
 Archive, 
 AlertCircle, 
 Star, 
 Tag,
 Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
 Popover,
 PopoverContent,
 PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const MailSidebar = ({ 
 activeFolder, 
 onFolderChange, 
 counts = {}, 
 accounts = [], 
 labels = [],
 selectedAccountId, 
 onAccountChange 
}) => {
 const folders = [
 { id: 'INBOX', label: 'Inbox', icon: Inbox, color: 'text-blue-500' },
 { id: 'SENT', label: 'Sent', icon: Send, color: 'text-green-500' },
 { id: 'DRAFT', label: 'Drafts', icon: File, color: 'text-orange-500' },
 { id: 'STARRED', label: 'Starred', icon: Star, color: 'text-yellow-500' },
 { id: 'TRASH', label: 'Trash', icon: Trash2, color: 'text-rose-500' },
 { id: 'SPAM', label: 'Spam', icon: AlertCircle, color: 'text-purple-500' },
 { id: 'ARCHIVE', label: 'Archive', icon: Archive, color: 'text-slate-500' },
 ];

 const userLabels = labels.filter(l => l.type === 'user');

 const handleConnect = () => {
 const apiPath = window.location.pathname.startsWith('/workspace') 
 ? `/api${window.location.pathname}/auth`
 : `/api/workspace/callback/google`;
 window.location.href = apiPath;
 };

 return (
 <div className="w-64 h-full flex flex-col bg-card/10 backdrop-blur-md border-r border-border/40 p-4 space-y-6">
 <div className="space-y-4 px-1 text-card-foreground">
 {/* Header with Account Info Popover */}
 {accounts.length > 0 ? (
 <div className="space-y-4">
 <Popover>
 <PopoverTrigger asChild>
 <div className="flex items-center gap-3 cursor-pointer group hover:bg-primary/5 p-1 rounded-xl transition-all">
 <div className="bg-primary/20 p-2 rounded-lg group-hover:bg-primary/30 transition-colors shadow-sm">
 <Inbox className="w-6 h-6 text-primary" />
 </div>
 <div className="flex flex-col min-w-0">
 <h2 className="text-lg font-black leading-none text-foreground/90 group-hover:text-primary transition-colors">Mailbox</h2>
 <span className="text-[10px] font-black text-primary/60 mt-1 animate-pulse">
 ● Connected
 </span>
 </div>
 </div>
 </PopoverTrigger>
 <PopoverContent className="w-80 p-0 overflow-hidden bg-background/95 backdrop-blur-2xl border-border/40 shadow-2xl rounded-2xl" align="start">
 <div className="p-4 border-b border-border/20 bg-muted/30">
 <h3 className="text-xs font-black tracking-[0.2em] text-muted-foreground opacity-70">Connected Accounts</h3>
 </div>
 <ScrollArea className="max-h-[300px]">
 <div className="p-2 space-y-1">
 {accounts.map((account) => (
 <div
 key={account.id}
 className={cn(
 "flex items-center gap-3 p-3 rounded-xl transition-all",
 selectedAccountId === account.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50 border border-transparent"
 )}
 >
 <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
 <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(account.email)}&background=random`} />
 <AvatarFallback className="font-bold text-xs">{account.email.substring(0, 2).toUpperCase()}</AvatarFallback>
 </Avatar>
 <div className="flex flex-col min-w-0">
 <span className="text-[11px] font-bold truncate leading-tight">{account.email}</span>
 <span className="text-[9px] text-primary font-black mt-0.5">Gmail Account</span>
 </div>
 {selectedAccountId === account.id && (
 <div className="ml-auto w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
 )}
 </div>
 ))}
 </div>
 </ScrollArea>
 <div className="p-3 bg-muted/30 border-t border-border/20">
 <Button
 variant="ghost"
 className="w-full justify-start gap-2 h-9 text-[10px] font-bold tracking-wider hover:bg-primary/10 hover:text-primary rounded-xl"
 onClick={handleConnect}
 >
 <Plus className="w-3.5 h-3.5" /> Add Account
 </Button>
 </div>
 </PopoverContent>
 </Popover>

 {/* Traditional Account Switcher */}
 <div className="animate-in fade-in slide-in-from-top-2 duration-700">
 <Select value={selectedAccountId} onValueChange={onAccountChange}>
 <SelectTrigger className="w-full bg-muted/30 border-none rounded-xl h-12 font-bold text-[10px] tracking-wider focus:ring-1 focus:ring-primary/50 shadow-inner">
 <SelectValue placeholder="Select Account" />
 </SelectTrigger>
 <SelectContent className="rounded-2xl border-border/20 shadow-2xl backdrop-blur-xl">
 {accounts.map((account) => (
 <SelectItem 
 key={account.id} 
 value={account.id}
 className="font-bold text-[10px] py-3 tracking-wide"
 >
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full bg-primary" />
 {account.email}
 </div>
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>
 ) : (
 /* Offline State / Login Trigger */
 <div
 className="flex items-center gap-3 cursor-pointer group hover:bg-rose-500/5 p-1 rounded-xl transition-all"
 onClick={handleConnect}
 >
 <div className="bg-rose-500/20 p-2 rounded-lg group-hover:bg-rose-500/30 transition-colors shadow-sm">
 <Inbox className="w-6 h-6 text-rose-500" />
 </div>
 <div className="flex flex-col min-w-0">
 <h2 className="text-lg font-black leading-none text-foreground/90 group-hover:text-rose-500 transition-colors">Mailbox</h2>
 <span className="text-[10px] font-black text-rose-500/60 mt-1">
 ● Offline
 </span>
 </div>
 </div>
 )}
 </div>

 {/* Folder Navigation */}
 <div className="space-y-1">
 {folders.map((folder) => {
 const Icon = folder.icon;
 const isActive = activeFolder === folder.id;
 const count = counts[folder.id];

 return (
 <Button
 key={folder.id}
 variant="ghost"
 onClick={() => onFolderChange(folder.id)}
 className={cn(
 "w-full justify-start gap-3 h-11 px-3 rounded-xl transition-all font-bold text-[11px] ",
 isActive 
 ? "bg-primary/10 text-primary shadow-sm" 
 : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
 )}
 >
 <Icon className={cn("w-4 h-4", isActive ? "" : folder.color)} />
 <span className="flex-1 text-left">{folder.label}</span>
 {count > 0 && (
 <span className={cn(
 "px-2 py-0.5 rounded-full text-[10px] font-extrabold",
 isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
 )}>
 {count}
 </span>
 )}
 </Button>
 );
 })}
 </div>

 {/* Labels Section */}
 <div className="pt-6 border-t border-border/20 flex-1 min-h-0 flex flex-col">
 <h3 className="px-3 text-[10px] font-bold text-muted-foreground tracking-[0.2em] mb-4 opacity-50 flex-shrink-0">User Labels</h3>
 <ScrollArea className="flex-1 min-h-0">
 <div className="space-y-1 pr-3">
 {userLabels.length > 0 ? userLabels.map(label => (
 <Button 
 key={label.id} 
 variant="ghost" 
 onClick={() => onFolderChange(label.id)}
 className={cn(
 "w-full justify-start gap-3 h-10 px-3 rounded-xl text-[10px] font-black transition-all",
 activeFolder === label.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/30"
 )}
 >
 <Tag className="w-3.5 h-3.5 opacity-50" /> 
 <span className="truncate text-left">{label.name}</span>
 </Button>
 )) : (
 <p className="px-3 text-[10px] italic text-muted-foreground py-4">No custom labels found.</p>
 )}
 </div>
 </ScrollArea>
 </div>
 </div>
 );
};
