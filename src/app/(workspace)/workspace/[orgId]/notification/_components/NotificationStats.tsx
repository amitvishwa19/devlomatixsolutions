import { AlertTriangle, Bell, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { Notification } from '@/types/notification';
import { cn } from '@/lib/utils';

interface NotificationStatsProps {
  notifications: Notification[];
}

export function NotificationStats({ notifications }: NotificationStatsProps) {
  const stats = {
    total: notifications.length,
    unread: notifications.filter((n) => !n.isRead).length,
    urgent: notifications.filter((n) => n.type === 'urgent' && !n.isRead).length,
    warning: notifications.filter((n) => n.type === 'warning' && !n.isRead).length,
  };

  const statItems = [
    {
      label: 'Total',
      value: stats.total,
      icon: Bell,
      className: 'bg-muted text-muted-foreground',
    },
    {
      label: 'Unread',
      value: stats.unread,
      icon: Info,
      className: 'bg-info-bg text-info-foreground',
    },
    {
      label: 'Urgent',
      value: stats.urgent,
      icon: AlertCircle,
      className: 'bg-urgent-bg text-urgent-foreground',
    },
    {
      label: 'Warnings',
      value: stats.warning,
      icon: AlertTriangle,
      className: 'bg-warning-bg text-warning-foreground',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-card"
        >
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', item.className)}>
            <item.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
