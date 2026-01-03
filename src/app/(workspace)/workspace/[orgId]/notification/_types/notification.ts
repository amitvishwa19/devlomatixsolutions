export type NotificationType = 'urgent' | 'warning' | 'info' | 'success';

export type NotificationCategory = 
  | 'patient'
  | 'appointment'
  | 'lab'
  | 'pharmacy'
  | 'emergency'
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  patientName?: string;
  roomNumber?: string;
  actionUrl?: string;
}
