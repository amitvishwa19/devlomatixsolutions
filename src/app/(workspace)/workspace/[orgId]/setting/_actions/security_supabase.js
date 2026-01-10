import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import supabase from "@/supabase/client";

const UpsertSecuritySetting = z.object({
  userId: z.string(),
  formData: z.object({
    minPasswordLength: z.string().optional(),
    passwordExpiry: z.string().optional(),
    requireUppercase: z.boolean().optional(),
    requireNumbers: z.boolean().optional(),
    requireSpecialChars: z.boolean().optional(),
    twoFactorAuth: z.boolean().optional(),
    sessionTimeout: z.string().optional(),
    failedLoginLockout: z.string().optional(),
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
        .update({ security: formData })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      result = updated;
    } else {
      const { data: inserted, error } = await supabase
        .from('settings')
        .insert({ user_id: userId, security: formData })
        .select()
        .single();

      if (error) throw error;
      result = inserted;
    }

    console.log('@security setting supabase action', result);
    return { data: { setting: result } };

  } catch (error) {
    console.error('Security settings error:', error);
    return { message: "Oops!, something went wrong", error };
  }
};

export const upsertSecuritySettingSupabase = createSafeAction(UpsertSecuritySetting, handler);

export const fetchSecuritySettings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('security')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return { data: data?.security };
  } catch (error) {
    console.error('Fetch security settings error:', error);
    return { error };
  }
};
