import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import supabase from "@/supabase/client";

const UpsertIntegrationsSetting = z.object({
  userId: z.string(),
  formData: z.object({
    googleCalendarEnabled: z.boolean().optional(),
    googleCalendarSyncFrequency: z.string().optional(),
    outlookCalendarEnabled: z.boolean().optional(),
    smsProvider: z.string().optional(),
    smsApiKey: z.string().optional(),
    emailProvider: z.string().optional(),
    emailApiKey: z.string().optional(),
    paymentGateway: z.string().optional(),
    paymentApiKey: z.string().optional(),
    labSystemEnabled: z.boolean().optional(),
    labSystemUrl: z.string().optional(),
    pharmacySystemEnabled: z.boolean().optional(),
    pharmacySystemUrl: z.string().optional(),
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
        .update({ integrations: formData })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      result = updated;
    } else {
      const { data: inserted, error } = await supabase
        .from('settings')
        .insert({ user_id: userId, integrations: formData })
        .select()
        .single();

      if (error) throw error;
      result = inserted;
    }

    console.log('@integrations setting supabase action', result);
    return { data: { setting: result } };

  } catch (error) {
    console.error('Integrations settings error:', error);
    return { message: "Oops!, something went wrong", error };
  }
};

export const upsertIntegrationsSettingSupabase = createSafeAction(UpsertIntegrationsSetting, handler);

export const fetchIntegrationsSettings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('integrations')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return { data: data?.integrations };
  } catch (error) {
    console.error('Fetch integrations settings error:', error);
    return { error };
  }
};
