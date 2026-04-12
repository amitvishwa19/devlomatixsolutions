import { useState, useMemo } from "react";
import { Bell, UserPlus, ArrowRightLeft, Calendar, Star, Mail, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAts } from "@/ATS/context/AtsContext";
import { activities } from "@/ATS/data/mockData";
import { cn } from "@/lib/utils";

const ACTIVITY_ICONS: Record<string, typeof Bell> = {
  stage_change: ArrowRightLeft,
  note: Star,
  email: Mail,
  interview: Calendar,
  rating: Star,
};

const ACTIVITY_COLORS: Record<string, string> = {
  stage_change: "bg-primary/10 text-primary",
  note: "bg-warning/10 text-warning",
  email: "bg-accent/10 text-accent-foreground",
  interview: "bg-success/10 text-success",
  rating: "bg-warning/10 text-warning",
};

const NotificationCenter = () => {
  const { candidates } = useAts();
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);

  const notifications = useMemo(() => {
    const notifs = activities.map((a) => {
      const candidate = candidates.find((c) => c.id === a.candidateId);
      return {
        ...a,
        candidateName: candidate?.name || "Unknown",
        candidateAvatar: candidate?.avatar || "??",
      };
    });
    return notifs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [candidates]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const markRead = (id: string) => setReadIds((prev) => new Set(prev).add(id));
  const markAllRead = () => setReadIds(new Set(notifications.map((n) => n.id)));

  const formatTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={markAllRead}>
              <Check className="h-3 w-3 mr-1" /> Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No notifications</div>
          ) : (
            notifications.map((n) => {
              const Icon = ACTIVITY_ICONS[n.type] || Bell;
              const isUnread = !readIds.has(n.id);
              return (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 border-b last:border-0 cursor-pointer transition-colors hover:bg-muted/50",
                    isUnread && "bg-primary/5"
                  )}
                >
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0", ACTIVITY_COLORS[n.type])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{n.candidateName}</span>{" "}
                      <span className="text-muted-foreground">{n.message}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground">{formatTime(n.timestamp)}</span>
                      <span className="text-[11px] text-muted-foreground">by {n.user}</span>
                    </div>
                  </div>
                  {isUnread && <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
                </div>
              );
            })
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
