'use client';

import React from 'react';
import {
    Building2,
    Users,
    MessageCircle,
    Calendar,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DealCard({ deal, onClick, onQuickWhatsApp, provided, isDragging }) {
    const priorityColors = {
        LOW: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20",
        MEDIUM: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        HIGH: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        URGENT: "text-red-500 bg-red-500/10 border-red-500/20"
    };

    const formatCurrency = (val, currency = "INR") => {
        const symbol = currency === "USD" ? "$" : "₹";
        return `${symbol} ${Number(val || 0).toLocaleString('en-IN')}`;
    };

    return (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={onClick}
            className={`group p-3.5 rounded-xl border bg-card/90 hover:bg-card transition-all duration-200 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md select-none ${
                isDragging
                    ? 'border-primary shadow-xl ring-2 ring-primary/20 rotate-1 scale-105'
                    : 'border-border/80 hover:border-border'
            }`}
        >
            {/* Header: Title & Priority */}
            <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-xs font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {deal.title}
                </h4>
                {deal.priority && deal.priority !== 'MEDIUM' && (
                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 uppercase shrink-0 font-bold ${priorityColors[deal.priority] || ''}`}>
                        {deal.priority}
                    </Badge>
                )}
            </div>

            {/* Value & Probability */}
            <div className="flex items-baseline justify-between gap-2 mb-3">
                <span className="text-sm font-extrabold text-foreground tracking-tight">
                    {formatCurrency(deal.value, deal.currency)}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground">
                    {deal.stage?.probability}% prob
                </span>
            </div>

            {/* Linked Contact & Company */}
            <div className="space-y-1 text-[11px] text-muted-foreground border-t border-border/50 pt-2.5">
                {deal.contact && (
                    <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 truncate text-foreground/90 font-medium">
                            <Users className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span className="truncate">{deal.contact.name}</span>
                        </span>
                        {deal.contact.phone && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-[#25D366] hover:text-[#25D366] hover:bg-[#25D366]/10 shrink-0"
                                title="Quick WhatsApp Outreach"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onQuickWhatsApp && onQuickWhatsApp(deal.contact, deal);
                                }}
                            >
                                <MessageCircle className="w-3 h-3" />
                            </Button>
                        )}
                    </div>
                )}

                {deal.account && (
                    <div className="flex items-center gap-1.5 truncate text-muted-foreground">
                        <Building2 className="w-3 h-3 shrink-0" />
                        <span className="truncate">{deal.account.name}</span>
                    </div>
                )}
            </div>

            {/* Footer: Owner & Expected Close Date */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground/80 mt-2.5 pt-2 border-t border-border/40">
                {deal.expectedClose ? (
                    <span className="flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(deal.expectedClose).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                ) : (
                    <span>No close date</span>
                )}

                {deal.owner && (
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[9px] font-bold flex items-center justify-center">
                            {deal.owner.displayName?.charAt(0) || 'U'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
