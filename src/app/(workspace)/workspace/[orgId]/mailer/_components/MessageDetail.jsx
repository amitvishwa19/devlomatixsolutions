import {
    ArrowLeft,
    Reply,
    Forward,
    Trash2,
    Star,
    MoreHorizontal,
    AlertCircle,
    AlertTriangle,
    Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

function getRoleBadgeColor(role) {
    const colors = {
        doctor: 'bg-primary/10 text-primary',
        nurse: 'bg-success/10 text-success',
        admin: 'bg-secondary text-secondary-foreground',
        technician: 'bg-accent/10 text-accent',
        pharmacist: 'bg-warning/10 text-warning',
    };
    return colors[role] || 'bg-muted text-muted-foreground';
}

function getPriorityBadge(priority) {
    if (priority === 'urgent') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-urgent/10 text-urgent">
                <AlertCircle className="w-3 h-3" />
                Urgent
            </span>
        );
    }
    if (priority === 'high') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
                <AlertTriangle className="w-3 h-3" />
                High Priority
            </span>
        );
    }
    return null;
}

export function MessageDetail({
    message,
    onBack,
    onReply,
    onToggleStar,
    onDelete
}) {
    if (!message) {
        return (
            <div className="hidden lg:flex flex-1 min-w-0 items-center justify-center h-[88vh] w-full">
                <div className="text-center text-muted-foreground">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-sm">Select a message to read</p>
                </div>
            </div>
        );
    }

    const initials = message.from.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2);

    return (
        <div className="flex-1 flex flex-col bg-card h-full animate-slide-in-right">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="lg:hidden"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>

                <div className="flex-1" />

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={onReply}>
                        <Reply className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Forward className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleStar(message.id)}
                    >
                        <Star className={cn(
                            "w-4 h-4",
                            message.isStarred && "fill-warning text-warning"
                        )} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(message.id)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                <div className="max-w-3xl mx-auto p-6">
                    {/* Subject & Priority */}
                    <div className="mb-6">
                        <div className="flex items-start gap-3 mb-2">
                            <h1 className="text-xl font-semibold text-foreground flex-1">
                                {message.subject}
                            </h1>
                            {getPriorityBadge(message.priority)}
                        </div>
                    </div>

                    {/* Sender Info */}
                    <div className="flex items-start gap-4 mb-8 pb-6 border-b border-border">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-primary">{initials}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-foreground">{message.from.name}</span>
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                                    getRoleBadgeColor(message.from.role)
                                )}>
                                    {message.from.role}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                                {message.from.department}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>{format(message.timestamp, 'EEEE, MMMM d, yyyy • h:mm a')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Message Body */}
                    <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
                            {message.body}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Reply */}
            <div className="border-t border-border p-4">
                <Button
                    onClick={onReply}
                    className="gap-2"
                >
                    <Reply className="w-4 h-4" />
                    Reply
                </Button>
            </div>
        </div>
    );
}