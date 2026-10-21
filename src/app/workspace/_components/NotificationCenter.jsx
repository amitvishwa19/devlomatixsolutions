'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  CheckCheck,
  Trash2,
  Volume2,
  VolumeX,
  MessageSquare,
  MessageCircle,
  PhoneMissed,
  UserPlus,
  Zap,
  Check,
  X,
  ExternalLink,
  Settings,
  Sparkles,
  Inbox,
  Mail
} from 'lucide-react';
import { useNotifications } from '@/providers/NotificationProvider';

// Relative and clock time formatter helper
function formatNotificationTime(dateString) {
  if (!dateString) return 'Just now';
  try {
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffSecs < 45) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch (_) {
    return 'Recently';
  }
}

// Icon and color mapper per notification type
function getNotificationVisuals(type) {
  switch (type?.toUpperCase()) {
    case 'EMAIL':
    case 'MAILBOX':
      return {
        icon: Mail,
        label: 'Email',
        colorClass: 'bg-blue-500/10 text-blue-500 border-blue-500/25',
        badgeClass: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
        dotClass: 'bg-blue-500'
      };
    case 'WHATSAPP':
      return {
        icon: MessageSquare,
        label: 'WhatsApp',
        colorClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25',
        badgeClass: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
        dotClass: 'bg-emerald-500'
      };
    case 'CHAT':
      return {
        icon: MessageCircle,
        label: 'Team Chat',
        colorClass: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/25',
        badgeClass: 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30',
        dotClass: 'bg-indigo-500'
      };
    case 'CALL':
      return {
        icon: PhoneMissed,
        label: 'Voice / Video',
        colorClass: 'bg-rose-500/10 text-rose-500 border-rose-500/25',
        badgeClass: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
        dotClass: 'bg-rose-500'
      };
    case 'LEAD':
      return {
        icon: UserPlus,
        label: 'CRM Lead',
        colorClass: 'bg-violet-500/10 text-violet-500 border-violet-500/25',
        badgeClass: 'bg-violet-500/15 text-violet-500 border-violet-500/30',
        dotClass: 'bg-violet-500'
      };
    case 'SYSTEM':
    default:
      return {
        icon: Zap,
        label: 'System',
        colorClass: 'bg-amber-500/10 text-amber-500 border-amber-500/25',
        badgeClass: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
        dotClass: 'bg-amber-500'
      };
  }
}

export default function NotificationCenter() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params?.workspaceId;

  const {
    notifications = [],
    unreadCount = 0,
    soundEnabled = true,
    toggleSound,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread' | 'emails' | 'whatsapp' | 'chats'

  // Filter items based on active pill
  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case 'unread':
        return notifications.filter((n) => !n.read);
      case 'emails':
        return notifications.filter((n) => n.type === 'EMAIL' || n.type === 'MAILBOX');
      case 'whatsapp':
        return notifications.filter((n) => n.type === 'WHATSAPP');
      case 'chats':
        return notifications.filter((n) => n.type === 'CHAT' || n.type === 'CALL');
      case 'all':
      default:
        return notifications;
    }
  }, [notifications, activeFilter]);

  // Group notifications chronologically (Today, Yesterday, Earlier)
  const groupedNotifications = useMemo(() => {
    const groups = {
      today: [],
      yesterday: [],
      earlier: []
    };

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;

    filteredNotifications.forEach((item) => {
      const itemTime = new Date(item.createdAt).getTime();
      if (itemTime >= todayStart) {
        groups.today.push(item);
      } else if (itemTime >= yesterdayStart) {
        groups.yesterday.push(item);
      } else {
        groups.earlier.push(item);
      }
    });

    return groups;
  }, [filteredNotifications]);

  const handleItemClick = (notif) => {
    if (!notif.read) {
      markAsRead(notif.id);
    }
    if (notif.link) {
      setOpen(false);
      router.push(notif.link);
    }
  };

  const renderNotificationCard = (n) => {
    const visuals = getNotificationVisuals(n.type);
    const IconComponent = visuals.icon;

    return (
      <div
        key={n.id}
        onClick={() => handleItemClick(n)}
        className={`group relative flex items-start gap-3 p-3.5 rounded-xl text-xs transition-all cursor-pointer ${n.read
          ? 'bg-card/40 hover:bg-secondary/40 opacity-80 hover:opacity-100 border border-transparent hover:border-border/50'
          : 'bg-secondary/35 hover:bg-secondary/60 border border-border/70 shadow-xs'
          }`}
      >
        {/* Visual Category Icon */}
        <div className={`p-2 rounded-xl shrink-0 border mt-0.5 ${visuals.colorClass}`}>
          <IconComponent className="w-4 h-4" />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center justify-between gap-1 mb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-foreground truncate text-[12px]">
                {n.title}
              </span>
              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold ${visuals.badgeClass}`}>
                {visuals.label}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono shrink-0">
              {formatNotificationTime(n.createdAt)}
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {n.message}
          </p>

          {/* Action Row */}
          <div className="mt-2 flex items-center justify-between">
            {n.link ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-primary font-semibold group-hover:underline">
                <span>View conversation</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground/60">Info alert</span>
            )}

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1">
              {!n.read && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(n.id);
                  }}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                  title="Mark as read"
                >
                  <Check className="w-3 h-3 inline mr-1" />
                  Read
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(n.id);
                }}
                className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Unread Glow Dot */}
        {!n.read && (
          <span className="absolute top-4 right-3.5 w-2 h-2 rounded-full bg-primary ring-4 ring-primary/20" />
        )}
      </div>
    );
  };

  const hasAnyItems = filteredNotifications.length > 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Workspace Notifications"
          className="relative h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center bg-rose-500 text-white font-mono font-bold text-[9px] rounded-full border-2 border-card shadow-xs animate-in zoom-in-50">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="sm:max-w-[440px] w-full flex flex-col h-full border-0  z-50 bg-transparent text-foreground p-2"
      >

        <div className='bg-background h-full border rounded-lg'>        {/* Accessible Sheet Header */}
          <SheetHeader className="p-4 border-b border-border/50 bg-secondary/20 shrink-0">
            <div className="flex items-center justify-between pr-6">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-sm font-bold text-foreground">Notifications</SheetTitle>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-[10px] font-bold bg-rose-500/10 text-rose-500 border-rose-500/20 px-2 py-0.5">
                    {unreadCount} unread
                  </Badge>
                )}
              </div>

              {/* Quick Header Actions */}
              <div className="flex items-center gap-1.5">
                {/* Sound Toggle */}
                <button
                  type="button"
                  onClick={toggleSound}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                  title={soundEnabled ? 'Mute notification chimes' : 'Enable notification chimes'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-muted-foreground/60" />}
                </button>

                {/* Mark All Read */}
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mark all</span>
                  </button>
                )}

                {/* Clear All */}
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Clear all notifications"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <SheetDescription className="sr-only">
              Workspace real-time notification drawer
            </SheetDescription>
          </SheetHeader>

          {/* Filter Pills Bar */}
          <div className="px-4 py-2 bg-secondary/10 border-b border-border/40 flex items-center gap-1.5 shrink-0 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${activeFilter === 'all'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('unread')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${activeFilter === 'unread'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('emails')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${activeFilter === 'emails'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                }`}
            >
              Emails
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('whatsapp')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${activeFilter === 'whatsapp'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                }`}
            >
              WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('chats')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${activeFilter === 'chats'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                }`}
            >
              Calls & Chats
            </button>
          </div>

          {/* Notification Scrollable Area */}
          <ScrollArea className="flex-1 h-[85vh] px-4 py-3 ">
            {!hasAnyItems ? (
              <div className="py-24 px-6 text-center space-y-3 text-muted-foreground">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-secondary/40 flex items-center justify-center text-muted-foreground/60 border border-border/40">
                  <Inbox className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">
                    {activeFilter === 'unread' ? "You're all caught up!" : "No notifications"}
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
                    {activeFilter === 'unread'
                      ? 'All unread messages, calls, and updates have been reviewed.'
                      : 'Real-time alerts, inbound WhatsApp messages, and calls will stream here.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pb-6">
                {/* Today Section */}
                {groupedNotifications.today.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-1">
                      <span>Today</span>
                      <div className="flex-1 h-[1px] bg-border/40" />
                    </div>
                    <div className="space-y-2">
                      {groupedNotifications.today.map(renderNotificationCard)}
                    </div>
                  </div>
                )}

                {/* Yesterday Section */}
                {groupedNotifications.yesterday.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-1">
                      <span>Yesterday</span>
                      <div className="flex-1 h-[1px] bg-border/40" />
                    </div>
                    <div className="space-y-2">
                      {groupedNotifications.yesterday.map(renderNotificationCard)}
                    </div>
                  </div>
                )}

                {/* Earlier Section */}
                {groupedNotifications.earlier.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-1">
                      <span>Earlier</span>
                      <div className="flex-1 h-[1px] bg-border/40" />
                    </div>
                    <div className="space-y-2">
                      {groupedNotifications.earlier.map(renderNotificationCard)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Drawer Footer */}
          <div className="p-3 border-t border-border/50 bg-secondary/15 shrink-0 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Real-time Sync Active</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                if (workspaceId) {
                  router.push(`/workspace/${workspaceId}/system/setting`);
                }
              }}
              className="flex items-center gap-1 text-[11px] hover:text-foreground text-muted-foreground transition-colors cursor-pointer"
            >
              <Settings className="w-3 h-3" />
              <span>Preferences</span>
            </button>
          </div>

        </div>

      </SheetContent>
    </Sheet>
  );
}
