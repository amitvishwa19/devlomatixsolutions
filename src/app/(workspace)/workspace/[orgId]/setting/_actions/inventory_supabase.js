import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { supabase } from "@/supabase/client";

const UpsertInventorySetting = z.object({
  userId: z.string(),
  formData: z.object({
    lowStockThreshold: z.number().optional(),
    criticalStockThreshold: z.number().optional(),
    autoReorderEnabled: z.boolean().optional(),
    reorderLeadTime: z.string().optional(),
    defaultSupplier: z.string().optional(),
    trackBatchNumbers: z.boolean().optional(),
    trackExpiryDates: z.boolean().optional(),
    emailLowStockAlerts: z.boolean().optional(),
    emailExpiryAlerts: z.boolean().optional(),
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
        .update({ inventory: formData })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      result = updated;
    } else {
      const { data: inserted, error } = await supabase
        .from('settings')
        .insert({ user_id: userId, inventory: formData })
        .select()
        .single();

      if (error) throw error;
      result = inserted;
    }

    console.log('@inventory setting supabase action', result);
    return { data: { setting: result } };

  } catch (error) {
    console.error('Inventory settings error:', error);
    return { message: "Oops!, something went wrong", error };
  }
};

export const upsertInventorySettingSupabase = createSafeAction(UpsertInventorySetting, handler);

export const fetchInventorySettings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('inventory')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return { data: data?.inventory };
  } catch (error) {
    console.error('Fetch inventory settings error:', error);
    return { error };
  }
};
