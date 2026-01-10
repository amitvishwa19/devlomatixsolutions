import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import supabase from "@/supabase/client";

const UpsertPrescriptionSetting = z.object({
  userId: z.string(),
  formData: z.object({
    prescriptionPrefix: z.string().optional(),
    defaultValidityPeriod: z.string().optional(),
    defaultInstructions: z.string().optional(),
    footerText: z.string().optional(),
    checkDrugInteractions: z.boolean().optional(),
    allergyWarnings: z.boolean().optional(),
    dosageValidation: z.boolean().optional(),
    requireDigitalSignature: z.boolean().optional(),
    paperSize: z.string().optional(),
    copies: z.string().optional(),
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
        .update({ prescription: formData })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      result = updated;
    } else {
      const { data: inserted, error } = await supabase
        .from('settings')
        .insert({ user_id: userId, prescription: formData })
        .select()
        .single();

      if (error) throw error;
      result = inserted;
    }

    console.log('@prescription setting supabase action', result);
    return { data: { setting: result } };

  } catch (error) {
    console.error('Prescription settings error:', error);
    return { message: "Oops!, something went wrong", error };
  }
};

export const upsertPrescriptionSettingSupabase = createSafeAction(UpsertPrescriptionSetting, handler);

export const fetchPrescriptionSettings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('prescription')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return { data: data?.prescription };
  } catch (error) {
    console.error('Fetch prescription settings error:', error);
    return { error };
  }
};
