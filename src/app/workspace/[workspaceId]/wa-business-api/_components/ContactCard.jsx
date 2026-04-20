'use client';

import React from 'react';
import { 
    Phone, Mail, Layers, Trash2, MoreVertical, 
    Pencil, Send, History, CheckCircle2 
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ContactCard({ 
    contact, 
    categories = [], 
    getCategoryColor, 
    getTagColor,
    getStringColor,
    onEdit,
    onMessage,
    onHistory,
    onDelete
}) {
    return (
        <Card
            id='contact-card'
            className="group p-0 transition-all hover:border-primary/20 shadow-none bg-card/60 border-border/0 hover:border hover:bg-card"
        >
            <CardContent className="py-2 px-4 flex items-center gap-4 border border-border/90 rounded-md">
                <div className="shrink-0 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold border shadow-sm">
                        {contact.name ? contact.name[0].toUpperCase() : '?'}
                    </div>
                </div>

                <div className="flex-1 min-w-0 space-y-0.5 flex flex-row items-center justify-between">
                    <div>
                        <div className="flex items-center justify-between ">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <h3 className="text-sm font-bold truncate">{contact.name}</h3>
                                {contact.category && (
                                    <Badge 
                                        variant="outline" 
                                        className="h-4 text-[9px] font-bold px-1.5 border-none uppercase tracking-wider"
                                        style={{ backgroundColor: `${getStringColor(contact.category)}15`, color: getStringColor(contact.category) }}
                                    >
                                        {contact.category}
                                    </Badge>
                                )}
                                {contact.verified && (
                                    <Badge 
                                        variant="outline" 
                                        className="h-4 px-1 gap-0.5 border-none bg-blue-500/10 text-blue-500 font-bold"
                                    >
                                        <CheckCircle2 className="w-2.5 h-2.5" />
                                        <span className="text-[8px] uppercase tracking-tighter">Verified</span>
                                    </Badge>
                                )}
                                {contact.categoryId && (
                                    <Badge variant="outline" className="h-4 text-[9px] font-bold px-1.5 border-none" style={{ backgroundColor: `${getCategoryColor(contact.categoryId)}20`, color: getCategoryColor(contact.categoryId) }}>
                                        {categories.find(c => c.id === contact.categoryId)?.name || 'Cat'}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-1 font-mono">
                                <Phone className={`w-3 h-3 ${contact.verified ? 'text-blue-500 opacity-100' : 'opacity-40'} shrink-0`} />
                                <span className={contact.verified ? 'text-blue-900/80 font-bold' : ''}>{contact.phone}</span>
                                {contact.verified && <CheckCircle2 className="w-2.5 h-2.5 text-blue-500" />}
                            </div>
                            {contact.email && (
                                <div className="flex items-center gap-1">
                                    <Mail className="w-3 h-3 opacity-40 shrink-0" />
                                    {contact.email}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-1 pt-0.5">
                            {contact.tags?.map(tag => (
                                <Badge 
                                    key={tag} 
                                    variant="secondary" 
                                    className="text-[9px] h-4 px-1.5 border-none shadow-none"
                                    style={{ backgroundColor: `${getStringColor(tag)}15`, color: getStringColor(tag) }}
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground/30 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60">
                                    <MoreVertical className="w-6 h-6" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className='w-48'>
                                <DropdownMenuItem onClick={() => onEdit(contact)}>
                                    <Pencil className="w-4 h-4 mr-2" /> Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onMessage(contact)}>
                                    <Send className="w-4 h-4 mr-2 text-primary" /> Send Message
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive font-semibold" onClick={onDelete}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete Node
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
