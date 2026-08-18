'use client';

import React, { useState, useMemo } from 'react';
import { usePathname, useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ThemeSwitcher from '@/components/global/ThemeSwitch';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
    Bell,
    Search,
    ChevronRight,
    Home,
    Sparkles,
    CheckCircle2,
    Shield,
    Bot,
    MessageSquare,
    Share2,
    FolderKanban,
    Users,
    Settings,
    Check,
    Layers,
    Building2,
} from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSettings } from '@/providers/WorkspaceProvider';
import { AuthSelector } from '@/components/global/AuthSelector';
import WorkspaceCommandPalette from './WorkspaceCommandPalette';
import { toast } from 'sonner';

const ROUTE_LABELS = {
    flowgenix: { label: 'FlowGenix AI', icon: Bot },
    konnectx: { label: 'WhatsApp Hub', icon: MessageSquare },
    article: { label: 'Social Publisher', icon: Share2 },
    document: { label: 'Digital Assets', icon: FolderKanban },
    contact: { label: 'Contacts & CRM', icon: Users },
    management: { label: 'Team & RBAC', icon: Shield },
    system: { label: 'System', icon: Settings },
    setting: { label: 'Settings', icon: Settings },
    flowbyte: { label: 'Automation', icon: Layers },
    hireflow: { label: 'HireFlow ATS', icon: Users },
    ecommerce: { label: 'E-Commerce', icon: Building2 },
    chat: { label: 'Chat Studio', icon: Bot },
    provider: { label: 'AI Providers', icon: Bot },
    analytics: { label: 'Telemetry & Cost', icon: Sparkles }
};

export default function AppTopNav() {
    const pathname = usePathname();
    const params = useParams();
    const router = useRouter();
    const { settings } = useSettings();
    const workspaceId = params?.workspaceId || 'default';

    const [commandOpen, setCommandOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'FlowGenix AI Router Online', desc: 'Omni-route telemetry actively aggregating latency.', time: '5m ago', read: false },
        { id: 2, title: 'WhatsApp Webhook Synchronized', desc: 'Inbound message webhook listening at 200 OK.', time: '1h ago', read: false },
        { id: 3, title: 'System Security Config Verified', desc: 'AES-256 encryption active across all API keys.', time: '3h ago', read: true },
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        toast.success("All notifications marked as read");
    };

    // Construct Breadcrumb Trail
    const breadcrumbs = useMemo(() => {
        if (!pathname) return [];
        const segments = pathname.split('/').filter(Boolean);
        const wsIndex = segments.indexOf(workspaceId);

        if (wsIndex === -1) {
            return [{ label: 'Workspace', href: `/workspace/${workspaceId}` }];
        }

        const subSegments = segments.slice(wsIndex + 1);
        if (subSegments.length === 0) {
            return [{ label: 'Dashboard', href: `/workspace/${workspaceId}`, isLast: true }];
        }

        return subSegments.map((seg, idx) => {
            const href = `/workspace/${workspaceId}/${subSegments.slice(0, idx + 1).join('/')}`;
            const meta = ROUTE_LABELS[seg.toLowerCase()] || { label: seg.charAt(0).toUpperCase() + seg.slice(1) };
            const isLast = idx === subSegments.length - 1;
            return {
                label: meta.label,
                icon: meta.icon,
                href,
                isLast
            };
        });
    }, [pathname, workspaceId]);

    const workspaceName = settings?.general?.name || settings?.branding?.appName || 'Devlomatix Hub';

    return (
        <>
            <WorkspaceCommandPalette open={commandOpen} setOpen={setCommandOpen} />

            <header className="backdrop-blur-xl bg-card/60 border border-border/80  rounded-lg px-3 py-1.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
                {/* Left: Sidebar Toggle + Breadcrumb Trail */}
                <div className="flex items-center gap-2 min-w-0">
                    <SidebarTrigger className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg shrink-0" />

                    <div className="h-4 w-[1px] bg-border/60 mx-0.5 shrink-0" />

                    {/* Workspace Switcher Pill */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-secondary/40 border border-transparent hover:border-border/40 transition-colors text-xs font-semibold text-foreground shrink-0 cursor-pointer">
                                <span className="truncate max-w-[120px] sm:max-w-[160px]">{workspaceName}</span>
                                <Badge variant="secondary" className="text-[9px] px-1 py-0 font-bold bg-primary/10 text-primary border-primary/20">
                                    PRO
                                </Badge>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 bg-card border-border/50">
                            <DropdownMenuLabel className="text-xs text-muted-foreground">Active Organization</DropdownMenuLabel>
                            <DropdownMenuItem className="text-xs font-bold text-foreground flex items-center justify-between">
                                <span>{workspaceName}</span>
                                <Check className="w-3.5 h-3.5 text-primary" />
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="border-border/40" />
                            <DropdownMenuItem
                                onClick={() => router.push(`/workspace/${workspaceId}/system/setting`)}
                                className="text-xs cursor-pointer gap-2"
                            >
                                <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>Manage Workspace</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Breadcrumbs */}
                    <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground min-w-0 overflow-hidden">
                        <ChevronRight className="w-3 h-3 text-border shrink-0" />
                        <Link
                            href={`/workspace/${workspaceId}`}
                            className="hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary/30 shrink-0 flex items-center gap-1"
                        >
                            <Home className="w-3.5 h-3.5" />
                        </Link>

                        {breadcrumbs.map((crumb, i) => (
                            <React.Fragment key={crumb.href || i}>
                                <ChevronRight className="w-3 h-3 text-border shrink-0" />
                                {crumb.isLast ? (
                                    <span className="font-semibold text-foreground truncate max-w-[140px] px-1">
                                        {crumb.label}
                                    </span>
                                ) : (
                                    <Link
                                        href={crumb.href}
                                        className="hover:text-foreground transition-colors truncate max-w-[120px] px-1 py-0.5 rounded hover:bg-secondary/30"
                                    >
                                        {crumb.label}
                                    </Link>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Right: Spotlight Trigger + Realtime Pulse + Notifications + Theme + User */}
                <div className="flex items-center gap-2 justify-end shrink-0">
                    {/* Command Palette Spotlight Button */}
                    <button
                        onClick={() => setCommandOpen(true)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-secondary/30 hover:bg-secondary/60 border border-border/50 text-muted-foreground hover:text-foreground text-xs transition-colors cursor-pointer shadow-2xs"
                    >
                        <Search className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline-block font-medium text-[11px]">Search workspace...</span>
                        <kbd className="hidden sm:inline-block px-1 py-0.2 text-[9px] font-mono bg-background/80 border border-border/60 rounded text-muted-foreground">
                            ⌘K
                        </kbd>
                    </button>

                    {/* Real-Time Connection Pulse */}
                    <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        <span>Sync</span>
                    </div>

                    {/* Notifications Center Popover */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg cursor-pointer">
                                <Bell className="w-4 h-4" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-card"></span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-80 p-0 bg-card border-border/50 shadow-2xl rounded-xl">
                            <div className="p-3 border-b border-border/40 flex items-center justify-between bg-secondary/10">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-xs font-bold text-foreground">Notifications</h4>
                                    {unreadCount > 0 && (
                                        <Badge variant="secondary" className="text-[9px] bg-rose-500/10 text-rose-500 border-rose-500/20 px-1.5">
                                            {unreadCount} new
                                        </Badge>
                                    )}
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="text-[10px] text-primary hover:underline font-semibold cursor-pointer"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            <ScrollArea className="max-h-[280px]">
                                <div className="p-1 space-y-1">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={`p-2.5 rounded-lg text-xs space-y-0.5 transition-colors ${n.read ? 'opacity-60 bg-transparent' : 'bg-secondary/30 border border-border/40'}`}
                                        >
                                            <div className="flex items-center justify-between font-semibold text-foreground">
                                                <span className="truncate">{n.title}</span>
                                                <span className="text-[9px] text-muted-foreground font-mono">{n.time}</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground leading-snug">{n.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </PopoverContent>
                    </Popover>

                    {/* Theme Switcher */}
                    <ThemeSwitcher className="h-8 w-8" />

                    {/* User Profile Avatar Menu */}
                    <div className="pl-1 border-l border-border/50">
                        <AuthSelector classname="text-xs" />
                    </div>
                </div>
            </header>
        </>
    );
}