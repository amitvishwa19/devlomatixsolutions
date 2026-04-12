'use client';

import React from 'react';
import { 
    Edit2, 
    Trash2, 
    MoreVertical, 
    MessageSquare, 
    Send, 
    Copy, 
    Sparkles, 
    RefreshCw, 
    Loader2,
    Eye
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import TemplatePreview from './TemplatePreview';

export const TemplatePreviewCard = ({ 
    template, 
    onEdit, 
    onClone, 
    onDelete, 
    onTest, 
    onPreview,
    onSubmit, 
    onCheckStatus,
    isSubmittingId,
    isDeletingId
}) => {
    return (
        <div className="group relative flex flex-col h-full bg-card/50 hover:bg-card border hover:border-primary/30 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
            {/* Template Bubble Preview */}
            <div className="flex-1">
                <TemplatePreview template={template} showHeader={false} />
            </div>

            {/* Actions Footer */}
            <div className="px-5 py-4 bg-background border-t border-border/50 flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-foreground truncate">{template.name}</span>
                        {template.platform === 'WHATSAPP_CLOUD' && (
                            <Badge
                                className={`h-4 text-[9px] px-1.5 uppercase tracking-tighter border-0 font-bold ${template.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30' :
                                    (template.status === 'PENDING_APPROVAL' || template.status === 'IN_APPEAL') ? 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30' :
                                        template.status === 'REJECTED' ? 'bg-destructive/20 text-destructive hover:bg-destructive/30' :
                                            'bg-muted text-muted-foreground'
                                    }`}
                            >
                                {template.status === 'APPROVED' ? "Approved" :
                                    (template.status === 'PENDING_APPROVAL' || template.status === 'IN_APPEAL') ? "In Review" :
                                        template.status === 'REJECTED' ? "Rejected" : "Draft"}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center">
                        <code className="text-[10px] font-mono text-muted-foreground/60 truncate bg-muted/40 px-1.5 py-0.5 rounded border border-border/20 max-w-full">
                            {template.templateName || template.name.toLowerCase().replace(/\s+/g, '_')}
                        </code>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground uppercase opacity-60 tracking-wider font-semibold">
                            {template.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground/40">•</span>
                        <span className="text-[10px] text-muted-foreground uppercase opacity-60 tracking-wider font-semibold">
                            {template.type}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-1 pt-3 border-t border-border/50">
                    <Button
                        variant="default"
                        size="sm"
                        className="flex-1 h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm"
                        onClick={() => template.isDefault ? onClone(template) : onEdit(template)}
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                        {template.isDefault ? "Clone & Edit" : "Edit Template"}
                    </Button>

                    <div className="flex gap-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="w-8 h-8 text-primary hover:bg-primary/5 hover:text-primary transition-colors border-border"
                                    onClick={() => onPreview(template)}
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Preview</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="w-8 h-8 text-muted-foreground hover:text-emerald-500 border-border transition-colors"
                                    onClick={() => onTest(template)}
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Send Test</TooltipContent>
                        </Tooltip>

                        {template.platform === 'WHATSAPP_CLOUD' && (!template.status || template.status === 'DRAFT' || template.status === 'REJECTED') && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="w-8 h-8 text-primary hover:bg-primary/10 border-primary/20 transition-colors"
                                        onClick={() => onSubmit(template.id)}
                                        disabled={isSubmittingId === template.id}
                                    >
                                        {isSubmittingId === template.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Send for Review</TooltipContent>
                            </Tooltip>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="w-8 h-8 text-muted-foreground border-border">
                                    <MoreVertical className="w-3.5 h-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                                <DropdownMenuItem className="text-xs flex items-center gap-2 cursor-pointer py-2" onClick={() => onClone(template)}>
                                    <Copy className="w-3.5 h-3.5 opacity-60" /> Clone Template
                                </DropdownMenuItem>

                                {template.platform === 'WHATSAPP_CLOUD' && (
                                    <>
                                        {(!template.status || template.status === 'DRAFT' || template.status === 'REJECTED') ? (
                                            <DropdownMenuItem
                                                className="text-xs flex items-center gap-2 cursor-pointer py-2 text-primary"
                                                onClick={() => onSubmit(template.id)}
                                                disabled={isSubmittingId === template.id}
                                            >
                                                {isSubmittingId === template.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 opacity-60" />}
                                                Submit for Review
                                            </DropdownMenuItem>
                                        ) : (template.status === 'PENDING_APPROVAL' || template.status === 'PENDING' || template.status === 'IN_APPEAL') ? (
                                            <DropdownMenuItem
                                                className="text-xs flex items-center gap-2 cursor-pointer py-2 text-orange-500"
                                                onClick={() => onCheckStatus(template.id)}
                                                disabled={isSubmittingId === template.id}
                                            >
                                                {isSubmittingId === template.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 opacity-60" />}
                                                Refresh Status
                                            </DropdownMenuItem>
                                        ) : null}
                                    </>
                                )}

                                {!template.isDefault && (
                                    <>
                                        <div className="h-px bg-border my-1" />
                                        <DropdownMenuItem
                                            className="text-xs flex items-center gap-2 cursor-pointer py-2 text-destructive focus:bg-destructive/10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(template.id);
                                            }}
                                            disabled={isDeletingId === template.id}
                                        >
                                            {isDeletingId === template.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 opacity-60" />}
                                            {isDeletingId === template.id ? "Deleting..." : "Delete Template"}
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const TemplateListRow = ({ 
    template, 
    onEdit, 
    onClone, 
    onDelete, 
    onTest, 
    onPreview,
    onSubmit, 
    onCheckStatus,
    isSubmittingId,
    isDeletingId
}) => {
    return (
        <div className="group relative flex items-center gap-4 p-3 bg-card/50 hover:bg-card border border-border/50 hover:border-primary/30 rounded-xl transition-all duration-200">
            {/* Info Section */}
            <div className="flex-1 min-w-0 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center shrink-0 border border-border/10">
                    <MessageSquare className="w-5 h-5 text-primary/40" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-foreground truncate">{template.name}</span>
                        {template.platform === 'WHATSAPP_CLOUD' && (
                            <Badge
                                className={`h-3.5 text-[8px] px-1.5 uppercase tracking-tighter border-0 font-bold ${template.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30' :
                                    (template.status === 'PENDING_APPROVAL' || template.status === 'PENDING' || template.status === 'IN_APPEAL') ? 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30' :
                                        template.status === 'REJECTED' ? 'bg-destructive/20 text-destructive hover:bg-destructive/30' :
                                            'bg-muted text-muted-foreground'
                                    }`}
                            >
                                {template.status === 'APPROVED' ? "Approved" :
                                    (template.status === 'PENDING_APPROVAL' || template.status === 'PENDING' || template.status === 'IN_APPEAL') ? "In Review" :
                                        template.status === 'REJECTED' ? "Rejected" : "Draft"}
                            </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground/40 hidden sm:inline">• {template.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate opacity-70">
                        {template.body.substring(0, 100)}{template.body.length > 100 ? '...' : ''}
                    </p>
                </div>
            </div>

            {/* Meta / Official Name */}
            <div className="hidden md:flex flex-col items-end shrink-0 px-4 border-l border-border/20">
                <code className="text-[9px] font-mono text-muted-foreground/50 bg-muted/20 px-1 rounded whitespace-nowrap overflow-hidden">
                    {template.templateName || template.name.toLowerCase().replace(/\s+/g, '_')}
                </code>
                <span className="text-[10px] text-muted-foreground/40 uppercase mt-1 tracking-tight">
                    {template.category}
                </span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 shrink-0 ml-auto mr-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 rounded-full text-primary hover:bg-primary/10"
                            onClick={() => template.isDefault ? onClone(template) : onEdit(template)}
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        {template.isDefault ? "Clone to Edit" : "Edit Template"}
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-8 h-8 rounded-full text-primary hover:bg-primary/10" 
                            onClick={() => onPreview(template)}
                        >
                            <Eye className="w-3.5 h-3.5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        Preview Template
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-muted-foreground hover:text-emerald-500" onClick={() => onTest(template)}>
                            <Send className="w-3.5 h-3.5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        Send Test Message
                    </TooltipContent>
                </Tooltip>

                {template.platform === 'WHATSAPP_CLOUD' && (!template.status || template.status === 'DRAFT' || template.status === 'REJECTED') && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="w-8 h-8 rounded-full text-primary hover:bg-primary/10" 
                                onClick={() => onSubmit(template.id)}
                                disabled={isSubmittingId === template.id}
                            >
                                {isSubmittingId === template.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            Send for Review
                        </TooltipContent>
                    </Tooltip>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-muted-foreground border-border">
                            <MoreVertical className="w-3.5 h-3.5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                        <DropdownMenuItem className="text-xs flex items-center gap-2 cursor-pointer py-2" onClick={() => onClone(template)}>
                            <Copy className="w-3.5 h-3.5 opacity-60" /> Clone Template
                        </DropdownMenuItem>

                        {template.platform === 'WHATSAPP_CLOUD' && (
                            <>
                                {(!template.status || template.status === 'DRAFT') ? (
                                    <DropdownMenuItem
                                        className="text-xs flex items-center gap-2 cursor-pointer py-2 text-primary"
                                        onClick={() => onSubmit(template.id)}
                                        disabled={isSubmittingId === template.id}
                                    >
                                        {isSubmittingId === template.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 opacity-60" />}
                                        Submit for Review
                                    </DropdownMenuItem>
                                ) : (template.status === 'PENDING_APPROVAL' || template.status === 'PENDING' || template.status === 'IN_APPEAL') ? (
                                    <DropdownMenuItem
                                        className="text-xs flex items-center gap-2 cursor-pointer py-2 text-orange-500"
                                        onClick={() => onCheckStatus(template.id)}
                                        disabled={isSubmittingId === template.id}
                                    >
                                        {isSubmittingId === template.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 opacity-60" />}
                                        Refresh Status
                                    </DropdownMenuItem>
                                ) : null}
                            </>
                        )}

                        {!template.isDefault && (
                            <>
                                <div className="h-px bg-border my-1" />
                                <DropdownMenuItem
                                    className="text-xs flex items-center gap-2 cursor-pointer py-2 text-destructive focus:bg-destructive/10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(template.id);
                                    }}
                                    disabled={isDeletingId === template.id}
                                >
                                    {isDeletingId === template.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 opacity-60" />}
                                    {isDeletingId === template.id ? "Deleting..." : "Delete Template"}
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};
