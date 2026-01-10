import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import supabase from "@/supabase/client";

const UpsertStaffSetting = z.object({
  userId: z.string(),
  formData: z.object({
    staff: z.array(z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      role: z.string(),
      department: z.string().optional(),
      status: z.string(),
    })).optional(),
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
        .update({ staff: formData })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      result = updated;
    } else {
      const { data: inserted, error } = await supabase
        .from('settings')
        .insert({ user_id: userId, staff: formData })
        .select()
        .single();

      if (error) throw error;
      result = inserted;
    }

    console.log('@staff setting supabase action', result);
    return { data: { setting: result } };

  } catch (error) {
    console.error('Staff settings error:', error);
    return { message: "Oops!, something went wrong", error };
  }
};

export const upsertStaffSettingSupabase = createSafeAction(UpsertStaffSetting, handler);

export const fetchStaffSettings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('staff')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return { data: data?.staff };
  } catch (error) {
    console.error('Fetch staff settings error:', error);
    return { error };
  }
};
