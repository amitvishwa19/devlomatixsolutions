import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import supabase from "@/supabase/client";

const UpsertAppointmentsSetting = z.object({
  userId: z.string(),
  formData: z.object({
    defaultDuration: z.string().optional(),
    bufferTime: z.string().optional(),
    maxAdvanceBooking: z.string().optional(),
    allowSameDayBooking: z.boolean().optional(),
    workingHoursStart: z.string().optional(),
    workingHoursEnd: z.string().optional(),
    workingDays: z.array(z.string()).optional(),
    emailReminder: z.boolean().optional(),
    smsReminder: z.boolean().optional(),
    reminderTime: z.string().optional(),
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
        .update({ appointments: formData })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      result = updated;
    } else {
      const { data: inserted, error } = await supabase
        .from('settings')
        .insert({ user_id: userId, appointments: formData })
        .select()
        .single();

      if (error) throw error;
      result = inserted;
    }

    console.log('@appointments setting supabase action', result);
    return { data: { setting: result } };

  } catch (error) {
    console.error('Appointments settings error:', error);
    return { message: "Oops!, something went wrong", error };
  }
};

export const upsertAppointmentsSettingSupabase = createSafeAction(UpsertAppointmentsSetting, handler);

export const fetchAppointmentsSettings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('appointments')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return { data: data?.appointments };
  } catch (error) {
    console.error('Fetch appointments settings error:', error);
    return { error };
  }
};
