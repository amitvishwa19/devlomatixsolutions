import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import supabase from "@/supabase/client";

const UpsertNotificationsSetting = z.object({
  userId: z.string(),
  formData: z.object({
    emailAppointmentConfirmations: z.boolean().optional(),
    emailAppointmentReminders: z.boolean().optional(),
    emailInvoiceBilling: z.boolean().optional(),
    emailLabResults: z.boolean().optional(),
    smsAppointmentReminders: z.boolean().optional(),
    smsPrescriptionReady: z.boolean().optional(),
    smsPaymentConfirmations: z.boolean().optional(),
    inAppNewPatient: z.boolean().optional(),
    inAppEmergencyAlerts: z.boolean().optional(),
    inAppLowInventory: z.boolean().optional(),
    inAppScheduleChanges: z.boolean().optional(),
    quietHoursStart: z.string().optional(),
    quietHoursEnd: z.string().optional(),
  }),
});

const handler = async (data) => {
  const { userId, formData } = data;

  try {
    const { data: existing } = await supabase
      .from('settings')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    let result;

    if (existing) {
      const { data: updated, error } = await supabase
        .from('settings')
        .update({ notifications: formData })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      result = updated;
    } else {
      const { data: inserted, error } = await supabase
        .from('settings')
        .insert({ user_id: userId, notifications: formData })
        .select()
        .single();

      if (error) throw error;
      result = inserted;
    }

    console.log('@notifications setting supabase action', result);
    return { data: { setting: result } };

  } catch (error) {
    console.error('Notifications settings error:', error);
    return { message: "Oops!, something went wrong", error };
  }
};

export const upsertNotificationsSettingSupabase = createSafeAction(UpsertNotificationsSetting, handler);

export const fetchNotificationsSettings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('notifications')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return { data: data?.notifications };
  } catch (error) {
    console.error('Fetch notifications settings error:', error);
    return { error };
  }
};
