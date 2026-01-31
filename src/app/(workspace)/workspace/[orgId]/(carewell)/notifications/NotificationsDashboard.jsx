import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '@/carewell/hooks/useLocalStorage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Calendar, Pill, FileText, DollarSign, Check, Trash2 } from 'lucide-react';
import { mockNotifications } from './mockNotifications';
import { NOTIFICATION_TYPES, NOTIFICATION_TYPE_LABELS } from './types';
import { formatDistanceToNow } from 'date-fns';

const typeIcons = {
  [NOTIFICATION_TYPES.APPOINTMENT_REMINDER]: Calendar,
  [NOTIFICATION_TYPES.PRESCRIPTION_REFILL]: Pill,
  [NOTIFICATION_TYPES.LAB_RESULT]: FileText,
  [NOTIFICATION_TYPES.PAYMENT_DUE]: DollarSign,
  [NOTIFICATION_TYPES.GENERAL]: Bell,
};

const typeColors = {
  [NOTIFICATION_TYPES.APPOINTMENT_REMINDER]: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  [NOTIFICATION_TYPES.PRESCRIPTION_REFILL]: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  [NOTIFICATION_TYPES.LAB_RESULT]: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  [NOTIFICATION_TYPES.PAYMENT_DUE]: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  [NOTIFICATION_TYPES.GENERAL]: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
};

export default function NotificationsDashboard() {
  const [notifications, setNotifications] = useLocalStorage('hms_notifications', mockNotifications);
  const [activeTab, setActiveTab] = useState('all');

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications;
    if (activeTab === 'unread') return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === activeTab);
  }, [notifications, activeTab]);

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      <div className="p-6 space-y-6 flex flex-col flex-1 overflow-hidden">
        <div className="flex items-start justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">{unreadCount}</Badge>
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Appointment reminders, refill alerts, and updates</p>
          </div>
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <Check className="w-4 h-4 mr-2" />Mark All Read
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="shrink-0">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value={NOTIFICATION_TYPES.APPOINTMENT_REMINDER}>Appointments</TabsTrigger>
            <TabsTrigger value={NOTIFICATION_TYPES.PRESCRIPTION_REFILL}>Refills</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-full">
              <div className="space-y-3 pr-4">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">No notifications</div>
                ) : (
                  filteredNotifications.map((notification) => {
                    const Icon = typeIcons[notification.type];
                    return (
                      <Card key={notification.id} className={`border-border ${!notification.read ? 'bg-primary/5' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${typeColors[notification.type]}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-foreground">{notification.title}</h3>
                                {!notification.read && <div className="w-2 h-2 rounded-full bg-primary" />}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              {!notification.read && (
                                <Button variant="ghost" size="icon" onClick={() => markAsRead(notification.id)}>
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" onClick={() => deleteNotification(notification.id)}>
                                <Trash2 className="w-4 h-4 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
