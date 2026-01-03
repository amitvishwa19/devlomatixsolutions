import { useState, useMemo, useEffect } from 'react';
import { Notification, NotificationType, NotificationCategory } from '@/types/notification';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const USER_ID = 'user-1'; // Hardcoded for demo purposes

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | 'all'>('all');

  // Fetch notifications from database
  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', USER_ID)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: Notification[] = (data || []).map((n) => ({
        id: n.id,
        type: n.type as NotificationType,
        category: n.category as NotificationCategory,
        title: n.title,
        message: n.message,
        timestamp: new Date(n.created_at),
        isRead: n.is_read,
        patientName: n.patient_name || undefined,
        roomNumber: n.room_number || undefined,
        actionUrl: n.action_url || undefined,
      }));

      setNotifications(mapped);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${USER_ID}`,
        },
        (payload) => {
          console.log('Realtime update:', payload);

          if (payload.eventType === 'INSERT') {
            const n = payload.new as any;
            const newNotification: Notification = {
              id: n.id,
              type: n.type as NotificationType,
              category: n.category as NotificationCategory,
              title: n.title,
              message: n.message,
              timestamp: new Date(n.created_at),
              isRead: n.is_read,
              patientName: n.patient_name || undefined,
              roomNumber: n.room_number || undefined,
              actionUrl: n.action_url || undefined,
            };
            setNotifications((prev) => [newNotification, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const n = payload.new as any;
            setNotifications((prev) =>
              prev.map((notif) =>
                notif.id === n.id
                  ? {
                      ...notif,
                      type: n.type as NotificationType,
                      category: n.category as NotificationCategory,
                      title: n.title,
                      message: n.message,
                      isRead: n.is_read,
                      patientName: n.patient_name || undefined,
                      roomNumber: n.room_number || undefined,
                      actionUrl: n.action_url || undefined,
                    }
                  : notif
              )
            );
          } else if (payload.eventType === 'DELETE') {
            const oldId = (payload.old as any).id;
            setNotifications((prev) => prev.filter((n) => n.id !== oldId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesSearch =
        searchQuery === '' ||
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.patientName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === 'all' || notification.type === selectedType;
      const matchesCategory = selectedCategory === 'all' || notification.category === selectedCategory;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [notifications, searchQuery, selectedType, selectedCategory]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', USER_ID)
        .eq('is_read', false);

      if (error) throw error;
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const clearAll = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', USER_ID);

      if (error) throw error;
      toast.success('All notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    }
  };

  const postDummyNotification = async () => {
    const types = ['urgent', 'warning', 'info', 'success'] as const;
    const categories = ['patient', 'appointment', 'lab', 'pharmacy', 'emergency', 'system'] as const;
    
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    const dummyData = {
      user_id: USER_ID,
      type: randomType,
      category: randomCategory,
      title: `Test ${randomType} notification`,
      message: `This is a test ${randomCategory} notification created at ${new Date().toLocaleTimeString()}`,
      is_read: false,
      patient_name: randomCategory === 'patient' ? 'John Doe' : null,
      room_number: randomCategory === 'patient' ? '101A' : null,
    };

    try {
      const { error } = await supabase.from('notifications').insert(dummyData);
      if (error) throw error;
      toast.success('Dummy notification posted!');
    } catch (error) {
      console.error('Error posting notification:', error);
      toast.error('Failed to post notification');
    }
  };

  const refetch = async () => {
    setLoading(true);
    await fetchNotifications();
    toast.success('Notifications refetched!');
  };

  return {
    notifications,
    filteredNotifications,
    unreadCount,
    loading,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    selectedCategory,
    setSelectedCategory,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    postDummyNotification,
    refetch,
  };
}
