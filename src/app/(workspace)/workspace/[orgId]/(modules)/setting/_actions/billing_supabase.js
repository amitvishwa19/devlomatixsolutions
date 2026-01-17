import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { supabase } from "@/integrations/supabase/client";

const UpsertBillingSetting = z.object({
  userId: z.string(),
  formData: z.object({
    plan: z.string().optional(),
    billingCycle: z.string().optional(),
    paymentMethod: z.string().optional(),
    autoRenew: z.boolean().optional(),
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
        .update({ billing: formData })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      result = updated;
    } else {
      const { data: inserted, error } = await supabase
        .from('settings')
        .insert({ user_id: userId, billing: formData })
        .select()
        .single();

      if (error) throw error;
      result = inserted;
    }

    console.log('@billing setting supabase action', result);
    return { data: { setting: result } };

  } catch (error) {
    console.error('Billing settings error:', error);
    return { message: "Oops!, something went wrong", error };
  }
};

export const upsertBillingSettingSupabase = createSafeAction(UpsertBillingSetting, handler);

export const fetchBillingSettings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('billing')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return { data: data?.billing };
  } catch (error) {
    console.error('Fetch billing settings error:', error);
    return { error };
  }
};
