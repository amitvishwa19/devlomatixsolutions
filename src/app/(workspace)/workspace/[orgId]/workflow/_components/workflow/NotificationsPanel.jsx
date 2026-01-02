import { useState } from 'react';
import { Patient, PatientStatus } from '@/types/workflow';
import {
    Bell, AlertTriangle, Clock, CheckCircle2, ArrowRight,
    X, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';




export function NotificationsPanel({ patients, onViewPatient }) {
    const [notifications, setNotifications] = useState(() => {
        const notifs = [];

        // Generate notifications from patient data
        patients.forEach(patient => {
            // Critical patients
            if (patient.status === 'critical') {
                notifs.push({
                    id: `critical-${patient.id}`,
                    type: 'critical',
                    title: 'Critical Patient Alert',
                    message: `${patient.name} requires immediate attention`,
                    patientId: patient.id,
                    patientName: patient.name,
                    timestamp: new Date().toISOString(),
                    read: false,
                });
            }

            // Long waiting patients (check if in waiting stage for too long)
            const waitingHistory = patient.stageHistory.find(h => h.stage === 'waiting' && !h.completedAt);
            if (waitingHistory) {
                const waitTime = Date.now() - new Date(waitingHistory.enteredAt).getTime();
                if (waitTime > 30 * 60 * 1000) { // More than 30 minutes
                    notifs.push({
                        id: `waiting-${patient.id}`,
                        type: 'waiting',
                        title: 'Extended Wait Time',
                        message: `${patient.name} has been waiting for ${formatDistanceToNow(new Date(waitingHistory.enteredAt))}`,
                        patientId: patient.id,
                        patientName: patient.name,
                        timestamp: waitingHistory.enteredAt,
                        read: false,
                    });
                }
            }

            // Recent stage changes
            const recentHistory = patient.stageHistory
                .filter(h => h.completedAt)
                .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];

            if (recentHistory && Date.now() - new Date(recentHistory.completedAt).getTime() < 60 * 60 * 1000) {
                notifs.push({
                    id: `stage-${patient.id}-${recentHistory.stage}`,
                    type: 'stage-change',
                    title: 'Stage Completed',
                    message: `${patient.name} completed ${recentHistory.stage.replace(/-/g, ' ')}`,
                    patientId: patient.id,
                    patientName: patient.name,
                    timestamp: recentHistory.completedAt,
                    read: true,
                });
            }
        });

        return notifs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'critical':
                return <AlertTriangle className="w-4 h-4 text-destructive" />;
            case 'waiting':
                return <Clock className="w-4 h-4 text-warning" />;
            case 'stage-change':
                return <ArrowRight className="w-4 h-4 text-info" />;
            case 'appointment':
                return <CheckCircle2 className="w-4 h-4 text-success" />;
            default:
                return <Bell className="w-4 h-4" />;
        }
    };

    const getNotificationBg = (type, read) => {
        if (read) return 'bg-muted/30';
        switch (type) {
            case 'critical':
                return 'bg-destructive/10 border-l-2 border-l-destructive';
            case 'waiting':
                return 'bg-warning/10 border-l-2 border-l-warning';
            case 'stage-change':
                return 'bg-info/10 border-l-2 border-l-info';
            default:
                return 'bg-muted/50';
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="font-semibold text-foreground">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                            Mark all as read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        'p-4 cursor-pointer hover:bg-muted/50 transition-colors',
                                        getNotificationBg(notification.type, notification.read)
                                    )}
                                    onClick={() => {
                                        markAsRead(notification.id);
                                        if (notification.patientId && onViewPatient) {
                                            onViewPatient(notification.patientId);
                                        }
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                'text-sm font-medium text-foreground',
                                                notification.read && 'text-muted-foreground'
                                            )}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                            </p>
                                        </div>
                                        {notification.patientId && (
                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
