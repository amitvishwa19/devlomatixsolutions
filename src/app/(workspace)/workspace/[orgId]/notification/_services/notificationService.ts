import { supabase } from "@/integrations/supabase/client";
import { NotificationType, NotificationCategory } from "@/types/notification";

export interface DbNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  is_read: boolean;
  patient_name: string | null;
  room_number: string | null;
  action_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationInput {
  user_id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  patient_name?: string;
  room_number?: string;
  action_url?: string;
}

export interface UpdateNotificationInput {
  type?: NotificationType;
  category?: NotificationCategory;
  title?: string;
  message?: string;
  is_read?: boolean;
  patient_name?: string | null;
  room_number?: string | null;
  action_url?: string | null;
}

// Fetch all notifications
export async function getNotifications(userId?: string) {
  let query = supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }

  return data as DbNotification[];
}

// Fetch a single notification by ID
export async function getNotificationById(id: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching notification:", error);
    throw error;
  }

  return data as DbNotification | null;
}

// Create a new notification
export async function createNotification(input: CreateNotificationInput) {
  const { data, error } = await supabase
    .from("notifications")
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error("Error creating notification:", error);
    throw error;
  }

  return data as DbNotification;
}

// Update a notification
export async function updateNotification(id: string, input: UpdateNotificationInput) {
  const { data, error } = await supabase
    .from("notifications")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating notification:", error);
    throw error;
  }

  return data as DbNotification;
}

// Mark notification as read
export async function markNotificationAsRead(id: string) {
  return updateNotification(id, { is_read: true });
}

// Mark all notifications as read for a user
export async function markAllNotificationsAsRead(userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false)
    .select();

  if (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }

  return data as DbNotification[];
}

// Delete a notification
export async function deleteNotification(id: string) {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }

  return true;
}

// Delete all notifications for a user
export async function deleteAllNotifications(userId: string) {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting all notifications:", error);
    throw error;
  }

  return true;
}

// Get unread count
export async function getUnreadCount(userId: string) {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }

  return count || 0;
}
