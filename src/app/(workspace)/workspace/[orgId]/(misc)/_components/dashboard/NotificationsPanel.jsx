import { Bell, AlertTriangle, Info, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";



const notifications = [
    {
        id: "1",
        type: "alert",
        title: "Emergency Patient Arrival",
        message: "Patient John Doe requires immediate attention in Room 3",
        time: "5 min ago",
        unread: true,
    },
    {
        id: "2",
        type: "warning",
        title: "Low Inventory Alert",
        message: "Surgical gloves stock below threshold - 20 units remaining",
        time: "15 min ago",
        unread: true,
    },
    {
        id: "3",
        type: "success",
        title: "Appointment Confirmed",
        message: "Sarah Johnson confirmed her appointment for tomorrow at 9 AM",
        time: "1 hour ago",
        unread: false,
    },
    {
        id: "4",
        type: "info",
        title: "System Update",
        message: "New features available - Check the changelog for details",
        time: "2 hours ago",
        unread: false,
    },
];

const typeIcons = {
    alert: AlertTriangle,
    warning: AlertTriangle,
    success: CheckCircle,
    info: Info,
};

const typeStyles = {
    alert: "bg-destructive/10 text-destructive",
    warning: "bg-warning/10 text-warning",
    success: "bg-success/10 text-success",
    info: "bg-primary/10 text-primary",
};

export function NotificationsPanel() {
    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <div className="rounded-xl border border-border/50 bg-card dark:bg-darkSecondaryBackground shadow-card animate-slide-up" style={{ animationDelay: "600ms" }}>
            <div className="flex items-center justify-between border-b border-border/50 p-5">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                    Mark all read
                </Button>
            </div>

            <div className="divide-y divide-border/50">
                {notifications.map((notification) => {
                    const Icon = typeIcons[notification.type];

                    return (
                        <div
                            key={notification.id}
                            className={cn(
                                "flex gap-3 p-4 transition-colors hover:bg-accent/20",
                                notification.unread && "bg-accent/10"
                            )}
                        >
                            <div className={cn(
                                "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg",
                                typeStyles[notification.type]
                            )}>
                                <Icon className="h-4 w-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <p className={cn(
                                        "text-sm",
                                        notification.unread ? "font-semibold text-foreground" : "font-medium text-foreground/80"
                                    )}>
                                        {notification.title}
                                    </p>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                                <span className="mt-1 text-xs text-muted-foreground">{notification.time}</span>
                            </div>

                            {notification.unread && (
                                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary mt-2" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
