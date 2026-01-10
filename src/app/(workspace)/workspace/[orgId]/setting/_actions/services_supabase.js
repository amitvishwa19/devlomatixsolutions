import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import supabase from "@/supabase/client";

const UpsertServicesSetting = z.object({
  userId: z.string(),
  formData: z.object({
    services: z.array(z.object({
      id: z.string(),
      name: z.string(),
      category: z.string(),
      price: z.number(),
      duration: z.number().optional(),
      active: z.boolean(),
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
        .update({ services: formData })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      result = updated;
    } else {
      const { data: inserted, error } = await supabase
        .from('settings')
        .insert({ user_id: userId, services: formData })
        .select()
        .single();

      if (error) throw error;
      result = inserted;
    }

    console.log('@services setting supabase action', result);
    return { data: { setting: result } };

  } catch (error) {
    console.error('Services settings error:', error);
    return { message: "Oops!, something went wrong", error };
  }
};

export const upsertServicesSettingSupabase = createSafeAction(UpsertServicesSetting, handler);

export const fetchServicesSettings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('services')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return { data: data?.services };
  } catch (error) {
    console.error('Fetch services settings error:', error);
    return { error };
  }
};
