'use client';

import React from 'react';
import { 
    Phone, Mail, Layers, Trash2, MoreVertical, 
    Pencil, Send, History 
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
    isSelected, 
    onSelectChange, 
    categories = [], 
    getCategoryColor, 
    getTagColor,
    onEdit,
    onMessage,
    onHistory,
    onDelete
}) {
    return (
        <Card
            id='contact-card'
            className={`group p-0 transition-all hover:border-primary/20 shadow-none bg-card/60 ${isSelected ? 'border-border bg-primary/5' : 'border-border/0'}`}
        >
            <CardContent className="py-0.5 px-4 flex items-center gap-4 border border-border/90 rounded-md">
                <div className="shrink-0 flex items-center gap-3">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={onSelectChange}
                    />
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold border">
                        {contact.name[0].toUpperCase()}
                    </div>
                </div>

                <div className="flex-1 min-w-0 space-y-0.5 flex flex-row items-center justify-between">
                    <div>
                        <div className="flex items-center justify-between ">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <h3 className="text-sm font-bold truncate t">{contact.name}</h3>
                                {contact.category && (
                                    <Badge variant="outline" className="h-4 text-[9px] font-bold px-1.5 border-none" style={{ backgroundColor: `${getCategoryColor(contact.category)}20`, color: getCategoryColor(contact.category) }}>
                                        {categories.find(c => c.id === contact.category)?.name || 'Cat'}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-1 font-mono">
                                <Phone className="w-3 h-3 opacity-40 shrink-0" />
                                {contact.phone}
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
                                <Badge key={tag} variant="secondary" className="text-[9px] h-4 px-1 opacity-70 border-none" style={{ backgroundColor: `${getTagColor(tag)}30`, color: getTagColor(tag) }}>
                                    {tag}
                                </Badge>
                            ))}
                            {contact.groups?.map(group => (
                                <Badge key={group.id} variant="outline" className="text-[9px] h-4 px-1 opacity-50 border-blue-500/20 text-blue-400">
                                    <Layers className="w-2 h-2 mr-1" />
                                    {group.name}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-100 group-hover:opacity-100 transition-opacity">
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
                            <DropdownMenuContent align="end" className='mt-4'>
                                <DropdownMenuItem onClick={() => onEdit(contact)}>
                                    <Pencil className="w-3.5 h-3.5 mr-2" /> Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onMessage(contact)}>
                                    <Send className="w-3.5 h-3.5 mr-2 text-green-500" /> Send Message
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onHistory(contact)}>
                                    <History className="w-3.5 h-3.5 mr-2 text-blue-500" /> Interaction History
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Contact
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
