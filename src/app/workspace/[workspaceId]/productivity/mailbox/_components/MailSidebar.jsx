'use client';

import React from'react';
import {
 Inbox,
 Send,
 File,
 Trash2,
 Archive,
 AlertCircle,
 Star,
 Tag,
 Plus,
 ChevronDown,
} from'lucide-react';
import { cn } from'@/lib/utils';
import { Button } from'@/components/ui/button';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from"@/components/ui/select";
import { ScrollArea } from'@/components/ui/scroll-area';
import {
 Popover,
 PopoverContent,
 PopoverTrigger,
} from"@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from"@/components/ui/avatar";
import { Separator } from'@/components/ui/separator';

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
 { id:'INBOX', label:'Inbox', icon: Inbox, color:'text-sky-500'},
 { id:'SENT', label:'Sent', icon: Send, color:'text-emerald-500'},
 { id:'DRAFT', label:'Drafts', icon: File, color:'text-amber-500'},
 { id:'STARRED', label:'Starred', icon: Star, color:'text-yellow-500'},
 { id:'TRASH', label:'Trash', icon: Trash2, color:'text-rose-500'},
 { id:'SPAM', label:'Spam', icon: AlertCircle, color:'text-purple-500'},
 { id:'ARCHIVE', label:'Archive', icon: Archive, color:'text-slate-500'},
 ];

 const userLabels = labels.filter(l => l.type ==='user');

 const handleConnect = () => {
 const apiPath = window.location.pathname.startsWith('/workspace')
 ? `/api${window.location.pathname}/auth`
 : `/api/workspace/callback/google`;
 window.location.href = apiPath;
 };

 return (
 <div className="w-64 h-full flex flex-col bg-card/10 backdrop-blur-xl border-r border-border/40 p-4 space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
 <div className="space-y-4 px-1 text-card-foreground">
 {/* Header with Account Info Popover */}
 {accounts.length > 0 ? (
 <div className="space-y-4">
 <Popover>
 <PopoverTrigger asChild>
 <div className="flex items-center gap-3 cursor-pointer group hover:bg-primary/5 p-1 rounded-md transition-all">
 <div className="bg-primary/10 p-2 rounded-md group-hover:bg-primary/20 transition-all shadow-inner ring-1 ring-primary/20">
 <Inbox className="w-5 h-5 text-primary"/>
 </div>
 <div className="flex flex-col min-w-0">
 <h2 className="text-sm font-bold leading-tight text-foreground/90 group-hover:text-primary transition-colors flex items-center gap-1">
 Mailbox <ChevronDown className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity"/>
 </h2>
 <div className="flex items-center gap-2 mt-0.5">
 <div className="relative flex h-1.5 w-1.5">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
 <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
 </div>
 <span className="text-[10px] font-bold text-primary opacity-70">Live Sync</span>
 </div>
 </div>
 </div>
 </PopoverTrigger>
 <PopoverContent className="w-80 p-0 overflow-hidden bg-background/95 backdrop-blur-2xl border-border/40 shadow-2xl rounded-md"align="start">
 <div className="p-4 border-b border-border/20 bg-muted/30">
 <h3 className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase opacity-70">Active Accounts</h3>
 </div>
 <ScrollArea className="max-h-[300px]">
 <div className="p-2 space-y-1">
 {accounts.map((account) => (
 <div
 key={account.id}
 className={cn(
"flex items-center gap-3 p-3 rounded-md transition-all font-bold",
 selectedAccountId === account.id ?"bg-primary/10 border border-primary/20":"hover:bg-muted/50 border border-transparent opacity-60 hover:opacity-100"
 )}
 >
 <Avatar className="w-10 border-2 border-background shadow-md">
 <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(account.email)}&background=random`} />
 <AvatarFallback className="font-bold text-xs">{account.email.substring(0, 2).toUpperCase()}</AvatarFallback>
 </Avatar>
 <div className="flex flex-col min-w-0">
 <span className="text-[11px] font-bold truncate leading-tight">{account.email}</span>
 <span className="text-[9px] text-primary font-bold mt-0.5 uppercase tracking-tighter opacity-70">Primary Gmail</span>
 </div>
 {selectedAccountId === account.id && (
 <div className="ml-auto w-2 h-2 rounded-full bg-primary shadow-glow shadow-primary/50"/>
 )}
 </div>
 ))}
 </div>
 </ScrollArea>
 <div className="p-3 bg-muted/30 border-t border-border/20">
 <Button
 variant="ghost"
 className="w-full justify-start gap-2 h-9 text-[10px] font-bold tracking-wider hover:bg-primary/10 hover:text-primary rounded-md"
 onClick={handleConnect}
 >
 <Plus className="w-3.5 h-3.5"/> Link New Account
 </Button>
 </div>
 </PopoverContent>
 </Popover>

 {/* Account Switcher */}
 <div className="animate-in fade-in slide-in-from-top-2 duration-700">
 <Select
 value={selectedAccountId}
 onValueChange={(val) => {
 if (val ==='ADD_ACCOUNT') {
 handleConnect();
 } else {
 onAccountChange(val);
 }
 }}
 >
 <SelectTrigger className="w-full bg-muted/30 border border-white/5 rounded-md h-11 font-bold text-[10px] tracking-wider focus:ring-1 focus:ring-primary/50 shadow-inner text-left hover:bg-muted/50 transition-all">
 <SelectValue placeholder="Select Account"/>
 </SelectTrigger>
 <SelectContent className="rounded-md border-border/20 shadow-2xl backdrop-blur-xl">
 {accounts.map((account) => (
 <SelectItem
 key={account.id}
 value={account.id}
 className="font-bold text-[10px] py-3 tracking-wide"
 >
 <div className="flex items-center gap-2">
 <div className="w-1.5 h-1.5 rounded-full bg-primary"/>
 {account.email}
 </div>
 </SelectItem>
 ))}
 <Separator className="my-1 bg-border/20"/>
 <SelectItem
 value="ADD_ACCOUNT"
 className="font-bold text-[10px] py-3 tracking-wide text-primary hover:bg-primary/10 focus:bg-primary/10 focus:text-primary transition-all cursor-pointer"
 >
 <div className="flex items-center gap-2">
 <Plus className="w-3.5 h-3.5 text-primary"/>
 Add Another Account
 </div>
 </SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 ) : (
 /* Offline State */
 <div
 className="flex items-center gap-3 cursor-pointer group hover:bg-rose-500/5 p-1 rounded-md transition-all"
 onClick={handleConnect}
 >
 <div className="bg-rose-500/10 p-2 rounded-md group-hover:bg-rose-500/20 transition-all ring-1 ring-rose-500/20 shadow-inner">
 <Inbox className="w-5 h-5 text-rose-500"/>
 </div>
 <div className="flex flex-col min-w-0">
 <h2 className="text-sm font-bold leading-tight text-foreground/90 group-hover:text-rose-500 transition-colors">Mailbox</h2>
 <div className="flex items-center gap-2 mt-0.5">
 <div className="h-1.5 w-1.5 rounded-full bg-rose-500"></div>
 <span className="text-[10px] font-bold text-rose-500 opacity-70">Disconnected</span>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Folder Navigation */}
 <ScrollArea className="flex-1 -mx-4">
 <div className="px-4 pb-6 space-y-8">
 <div className="space-y-1">
 <label className="px-3 text-[10px] font-bold text-muted-foreground tracking-[0.2em] mb-4 uppercase opacity-40 block">Navigation</label>
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
"w-full justify-start gap-3 px-3 rounded-md transition-all font-bold text-[11px]",
 isActive
 ?"bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
 :"text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground"
 )}
 >
 <Icon className={cn("w-4 h-4", isActive ?"text-primary shadow-glow shadow-primary/40": folder.color)} />
 <span className="flex-1 text-left">{folder.label}</span>
 {count > 0 && (
 <span className={cn(
"min-w-[20px] h-[18px] flex items-center justify-center px-1.5 rounded-md text-[9px] font-extrabold",
 isActive ?"bg-primary text-primary-foreground shadow-sm":"bg-muted/50 text-muted-foreground"
 )}>
 {count}
 </span>
 )}
 </Button>
 );
 })}
 </div>

 {/* Labels Section */}
 <div className="space-y-1">
 <h3 className="px-3 text-[10px] font-bold text-muted-foreground tracking-[0.2em] mb-4 uppercase opacity-40 shrink-0">Labels</h3>
 <div className="space-y-1">
 {userLabels.length > 0 ? userLabels.map(label => (
 <Button
 key={label.id}
 variant="ghost"
 onClick={() => onFolderChange(label.id)}
 className={cn(
"w-full justify-start gap-3 px-3 rounded-md text-[10px] font-bold transition-all",
 activeFolder === label.id
 ?"bg-primary/10 text-primary ring-1 ring-primary/20 shadow-sm"
 :"text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground"
 )}
 >
 <Tag className="w-3.5 h-3.5 opacity-50"/>
 <span className="truncate text-left">{label.name}</span>
 </Button>
 )) : (
 <p className="px-3 text-[10px] italic text-muted-foreground py-2 opacity-50">No custom tags found</p>
 )}
 </div>
 </div>
 </div>
 </ScrollArea>
 </div>
 );
};