import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import supabase from "@/supabase/client";

const UpsertPharmacySetting = z.object({
  userId: z.string(),
  formData: z.object({
    pharmacyName: z.string().optional(),
    licenseNumber: z.string().optional(),
    requirePrescriptionVerification: z.boolean().optional(),
    trackControlledSubstances: z.boolean().optional(),
    lowStockThreshold: z.number().optional(),
    criticalStockThreshold: z.number().optional(),
    emailLowStockAlerts: z.boolean().optional(),
    expiryDateAlerts: z.boolean().optional(),
    defaultDispensingUnit: z.string().optional(),
    printFormat: z.string().optional(),
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
        .update({ pharmacy: formData })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      result = updated;
    } else {
      const { data: inserted, error } = await supabase
        .from('settings')
        .insert({ user_id: userId, pharmacy: formData })
        .select()
        .single();

      if (error) throw error;
      result = inserted;
    }

    console.log('@pharmacy setting supabase action', result);
    return { data: { setting: result } };

  } catch (error) {
    console.error('Pharmacy settings error:', error);
    return { message: "Oops!, something went wrong", error };
  }
};

export const upsertPharmacySettingSupabase = createSafeAction(UpsertPharmacySetting, handler);

export const fetchPharmacySettings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('pharmacy')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return { data: data?.pharmacy };
  } catch (error) {
    console.error('Fetch pharmacy settings error:', error);
    return { error };
  }
};
