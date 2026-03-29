'use client';

import React, { useState } from 'react';
import {
 Search, Phone, Video, MoreVertical, Paperclip, Smile, Send,
 MessageCircle, Instagram, Facebook, Bot, Users, Tag, Filter, CheckCircle2,
 Calendar, Clock, Sparkles, Zap } from
'lucide-react';

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AdvancedCRMPanel() {
 const [activeChannel, setActiveChannel] = useState('whatsapp');
 const [activeChat, setActiveChat] = useState(1);
 const [msgInput, setMsgInput] = useState('');

 const channels = [
 { id: 'whatsapp', icon: MessageCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
 { id: 'instagram', icon: Instagram, color: 'text-pink-500', bg: 'bg-pink-500/10' },
 { id: 'facebook', icon: Facebook, color: 'text-blue-500', bg: 'bg-blue-500/10' },
 { id: 'chatbot', icon: Bot, color: 'text-purple-500', bg: 'bg-purple-500/10' }];


 const chats = [
 { id: 1, name: 'John Doe', avatar: 'JD', lastMsg: 'I need help with my order', time: '10:42 AM', unread: 2, status: 'Active', tags: ['VIP', 'Support'] },
 { id: 2, name: 'Acme Corp', avatar: 'AC', lastMsg: 'The new panel looks great!', time: 'Yesterday', unread: 0, status: 'Resolved', tags: ['Enterprise'] },
 { id: 3, name: 'Sarah Smith', avatar: 'SS', lastMsg: 'Can you send the pricing?', time: 'Yesterday', unread: 1, status: 'Lead', tags: ['Hot Lead'] },
 { id: 4, name: 'Marketing Team', avatar: 'MT', lastMsg: 'Campaign starts tomorrow', time: 'Monday', unread: 0, status: 'Active', tags: ['Internal'] },
 { id: 5, name: 'Tech Support', avatar: 'TS', lastMsg: 'Issue #404 resolved', time: 'Sunday', unread: 0, status: 'Resolved', tags: ['Technical'] }];


 return (
 <div className="flex h-[calc(100vh-80px)] w-full bg-background overflow-hidden border border-border rounded-lg shadow-lg">
 
 {/* Minimal Channel Switcher Sidebar */}
 <div className="w-16 bg-card border-r border-border flex flex-col items-center py-6 gap-6 z-10 hidden sm:flex">
 {channels.map((ch) => {
 const Icon = ch.icon;
 const isActive = activeChannel === ch.id;
 return (
 <button
 key={ch.id}
 onClick={() => setActiveChannel(ch.id)}
 className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
 isActive ? `${ch.bg} ${ch.color} shadow-sm ring-1 ring-${ch.color.split('-')[1]}-500/50` : 'text-muted-foreground hover:bg-secondary'}`
 }>
 
 <Icon className="w-5 h-5" />
 </button>);

 })}
 <div className="mt-auto pb-4 space-y-4">
 <button className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-all">
 <Users className="w-5 h-5" />
 </button>
 <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-primary font-bold text-xs">
 AM
 </div>
 </div>
 </div>

 {/* Chat List Column */}
 <div className="w-full sm:w-[320px] bg-card/50 border-r border-border flex flex-col relative z-10 backdrop-blur-sm">
 <div className="p-4 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-20">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-xl font-bold ">Messages</h2>
 <div className="flex space-x-1">
 <button className="p-2 hover:bg-secondary rounded-lg text-muted-foreground transition-colors"><Filter className="w-4 h-4" /></button>
 </div>
 </div>
 <div className="relative group">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
 <Input
 type="text"
 placeholder="Search conversations..."
 className="w-full bg-background border-border rounded-lg pl-9 pr-4 text-sm" />
 
 </div>
 </div>

 <div className="flex-1 overflow-y-auto w-full">
 {chats.map((chat) =>
 <button
 key={chat.id}
 onClick={() => setActiveChat(chat.id)}
 className={`w-full text-left p-4 border-b border-border/50 hover:bg-secondary/80 transition-all group ${
 activeChat === chat.id ? 'bg-secondary/80 border-l-2 border-l-primary relative' : ''}`
 }>
 
 {activeChat === chat.id && <div className="absolute inset-y-0 left-0 w-0.5 bg-primary rounded-r-full shadow-[0_0_8px_rgba(var(--primary),0.5)]"></div>}
 <div className="flex items-start justify-between mb-1">
 <div className="flex items-center space-x-3 w-full">
 <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-sm font-medium ${
 activeChat === chat.id ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground'}`
 }>
 {chat.avatar}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between w-full">
 <span className="font-semibold text-foreground truncate max-w-[120px]">{chat.name}</span>
 <span className={`text-xs whitespace-nowrap ${chat.unread ? 'text-primary font-bold' : 'text-muted-foreground font-medium'}`}>{chat.time}</span>
 </div>
 <p className={`text-sm truncate mt-0.5 w-[90%] ${chat.unread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
 {chat.lastMsg}
 </p>
 </div>
 </div>
 </div>
 <div className="flex items-center space-x-2 mt-2 ml-13">
 {chat.tags.map((tag) =>
 <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium border border-border/50">
 {tag}
 </span>
 )}
 {chat.unread > 0 &&
 <span className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground shadow-sm">
 {chat.unread}
 </span>
 }
 </div>
 </button>
 )}
 </div>
 </div>

 {/* Main Chat Area */}
 <div className="flex-1 flex flex-col bg-background/50 relative">
 {/* Chat Header */}
 <div className="h-16 px-6 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 shadow-sm">
 <div className="flex items-center space-x-4">
 <div className="relative">
 <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm">
 JD
 </div>
 <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-card rounded-full"></div>
 </div>
 <div>
 <h3 className="font-bold text-foreground">John Doe</h3>
 <p className="text-xs text-emerald-500 font-medium flex items-center">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
 Online now
 </p>
 </div>
 </div>
 <div className="flex items-center space-x-2">
 <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><Phone className="w-4 h-4" /></button>
 <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><Video className="w-4 h-4" /></button>
 <div className="w-px h-6 bg-border mx-1"></div>
 <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><MoreVertical className="w-4 h-4" /></button>
 </div>
 </div>

 {/* Chat Messages */}
 <div className="flex-1 overflow-y-auto p-6 space-y-6">
 <div className="flex justify-center">
 <span className="text-xs font-medium px-3 py-1 bg-secondary text-muted-foreground rounded-full border border-border/50 shadow-sm">
 Today
 </span>
 </div>

 <div className="flex justify-start">
 <div className="flex items-end space-x-2 max-w-[75%]">
 <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 text-xs">JD</div>
 <div className="bg-card border border-border p-4 rounded-lg rounded-bl-sm shadow-sm space-y-2 group relative">
 <p className="text-sm text-foreground leading-relaxed">Hi there! I'm interested in the advanced automation panel.</p>
 <span className="text-[10px] text-muted-foreground font-medium block opacity-70">10:41 AM</span>
 </div>
 </div>
 </div>

 <div className="flex justify-start">
 <div className="flex items-end space-x-2 max-w-[75%]">
 <div className="w-8 h-8 rounded-full bg-transparent shrink-0"></div>
 <div className="bg-card border border-border p-4 rounded-lg rounded-bl-sm shadow-sm space-y-2">
 <p className="text-sm text-foreground leading-relaxed">Can I schedule a demo?</p>
 <span className="text-[10px] text-muted-foreground font-medium block opacity-70">10:42 AM</span>
 </div>
 </div>
 </div>

 <div className="flex justify-end">
 <div className="flex items-end space-x-2 max-w-[75%]">
 <div className="bg-primary text-primary-foreground p-4 rounded-lg rounded-br-sm shadow-[0_4px_14px_rgba(var(--primary),0.3)] space-y-2">
 <div className="flex items-center space-x-2 bg-emerald-500/20 px-2 py-1 rounded border border-emerald-500/30 w-max mb-2">
 <Bot className="w-3 h-3 text-emerald-100" />
 <span className="text-[10px] font-medium text-emerald-50">Automated Reply</span>
 </div>
 <p className="text-sm leading-relaxed">Hello John! Thanks for reaching out. We'd love to show you the advanced features.</p>
 <p className="text-sm leading-relaxed">Please click below to pick a time that works for you.</p>
 <div className="mt-3 bg-white/10 rounded-lg overflow-hidden border border-white/20">
 <button className="w-full py-2.5 text-sm font-semibold flex items-center justify-center space-x-2 hover:bg-white/20 transition-all active:scale-[0.98]">
 <Calendar className="w-4 h-4" />
 <span>Schedule Demo</span>
 </button>
 </div>
 <div className="flex justify-end items-center space-x-1 opacity-80 pt-1">
 <span className="text-[10px] font-medium">10:42 AM</span>
 <CheckCircle2 className="w-3 h-3" />
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Message Input Container */}
 <div className="p-4 border-t border-border bg-card/80 backdrop-blur-md sticky bottom-0 z-20">
 <div className="flex items-end space-x-2 bg-background border border-border rounded-lg p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
 <div className="flex space-x-1 pb-1">
 <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all"><Paperclip className="w-5 h-5" /></button>
 <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all"><Smile className="w-5 h-5" /></button>
 <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all group relative">
 <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
 <span className="absolute -top-8 -left-4 w-max bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">AI Suggest</span>
 </button>
 </div>
 <Textarea
 value={msgInput}
 onChange={(e) => setMsgInput(e.target.value)}
 placeholder="Type a message or use / for templates..."
 className="flex-1 bg-transparent resize-none border-0 focus-visible:ring-0 py-3 px-2 text-sm max-h-32 text-foreground"
 rows={1} />
 
 <button className={`p-3 rounded-lg flex items-center justify-center transition-all ${
 msgInput.trim() ? 'bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:scale-95' : 'bg-secondary text-muted-foreground pointer-events-none'}`
 }>
 <Send className="w-4 h-4 ml-0.5" />
 </button>
 </div>
 <div className="flex items-center justify-between px-2 pt-2 text-[10px] text-muted-foreground font-medium">
 <p>Press <kbd className="font-sans px-1 py-0.5 bg-secondary border border-border rounded text-[9px]">Enter</kbd> to send, <kbd className="font-sans px-1 py-0.5 bg-secondary border border-border rounded text-[9px]">Shift + Enter</kbd> for new line</p>
 <p className="flex items-center"><Zap className="w-3 h-3 mr-1 text-primary" /> Connected via Official API</p>
 </div>
 </div>
 </div>

 {/* CRM Profile Sidebar (Hidden on small screens) */}
 <div className="w-[300px] bg-card/50 border-l border-border hidden lg:flex flex-col relative z-10 backdrop-blur-sm overflow-y-auto">
 <div className="p-6 border-b border-border text-center bg-card/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
 <div className="w-20 h-20 rounded-full mx-auto bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold shadow-sm mb-4 relative">
 JD
 <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-4 border-card rounded-full shadow-sm"></div>
 </div>
 <h2 className="text-xl font-bold text-foreground">John Doe</h2>
 <p className="text-sm text-muted-foreground">Software Engineer</p>
 
 <div className="flex items-center justify-center space-x-2 mt-4">
 <button className="flex-1 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-sm font-semibold rounded-lg transition-all">Profile</button>
 <button className="flex-1 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-sm font-semibold rounded-lg transition-all">Notes</button>
 </div>
 </div>

 <div className="p-6 space-y-6">
 <div className="space-y-3">
 <h4 className="text-xs font-bold text-muted-foreground tracking-wider">Contact Info</h4>
 <div className="space-y-4 bg-background p-4 rounded-lg border border-border shadow-sm">
 <div>
 <p className="text-xs text-muted-foreground mb-1">Phone Number</p>
 <p className="text-sm font-medium text-foreground">+1 (555) 123-4567</p>
 </div>
 <div>
 <p className="text-xs text-muted-foreground mb-1">Email</p>
 <p className="text-sm font-medium text-foreground">john.doe@example.com</p>
 </div>
 <div>
 <p className="text-xs text-muted-foreground mb-1">Location</p>
 <p className="text-sm font-medium text-foreground">New York, USA</p>
 </div>
 </div>
 </div>

 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <h4 className="text-xs font-bold text-muted-foreground tracking-wider">Tags</h4>
 <button className="text-primary hover:bg-primary/10 p-1 rounded transition-colors"><Tag className="w-3 h-3" /></button>
 </div>
 <div className="flex flex-wrap gap-2">
 <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 font-medium border border-amber-500/20">VIP Customer</span>
 <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 font-medium border border-emerald-500/20">Interested</span>
 <span className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-medium border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer border-dashed">+ Add Tag</span>
 </div>
 </div>

 <div className="space-y-3">
 <h4 className="text-xs font-bold text-muted-foreground tracking-wider">Customer Journey</h4>
 <div className="space-y-4">
 <div className="flex items-start space-x-3 relative">
 <div className="absolute top-6 left-1.5 w-0.5 h-10 bg-border"></div>
 <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shrink-0 shadow-sm ring-4 ring-emerald-500/20"></div>
 <div>
 <p className="text-sm font-medium text-foreground">Clicked Facebook Ad</p>
 <p className="text-xs text-muted-foreground mt-0.5">Campaign: "Summer Promo"</p>
 <p className="text-[10px] text-muted-foreground mt-1 font-medium flex items-center"><Clock className="w-3 h-3 mr-1" /> 10:35 AM</p>
 </div>
 </div>
 <div className="flex items-start space-x-3 relative">
 <div className="absolute top-6 left-1.5 w-0.5 h-10 bg-border"></div>
 <div className="w-3 h-3 rounded-full bg-primary mt-1 shrink-0 shadow-sm ring-4 ring-primary/20"></div>
 <div>
 <p className="text-sm font-medium text-foreground">Opted into Automation</p>
 <p className="text-xs text-muted-foreground mt-0.5">Flow: "Lead Qualification"</p>
 <p className="text-[10px] text-muted-foreground mt-1 font-medium flex items-center"><Clock className="w-3 h-3 mr-1" /> 10:40 AM</p>
 </div>
 </div>
 <div className="flex items-start space-x-3 relative">
 <div className="w-3 h-3 rounded-full bg-muted border border-border mt-1 shrink-0"></div>
 <div>
 <p className="text-sm font-medium text-muted-foreground">Human Handover</p>
 <p className="text-[10px] text-muted-foreground mt-1 font-medium flex items-center"><Clock className="w-3 h-3 mr-1" /> Pending</p>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>

 </div>);

}