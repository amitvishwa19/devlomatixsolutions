import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { supabase } from "@/supabase/client";

const UpsertPatientsSetting = z.object({
  userId: z.string(),
  formData: z.object({
    patientIdPrefix: z.string().optional(),
    idNumberLength: z.string().optional(),
    autoGenerateId: z.boolean().optional(),
    requirePhotoUpload: z.boolean().optional(),
    smsNotifications: z.boolean().optional(),
    recordRetentionPeriod: z.string().optional(),
    defaultBloodType: z.string().optional(),
    requireConsentForm: z.boolean().optional(),
    hipaaComplianceMode: z.boolean().optional(),
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
        .update({ patients: formData })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      result = updated;
    } else {
      const { data: inserted, error } = await supabase
        .from('settings')
        .insert({ user_id: userId, patients: formData })
        .select()
        .single();

      if (error) throw error;
      result = inserted;
    }

    console.log('@patients setting supabase action', result);
    return { data: { setting: result } };

  } catch (error) {
    console.error('Patients settings error:', error);
    return { message: "Oops!, something went wrong", error };
  }
};

export const upsertPatientsSettingSupabase = createSafeAction(UpsertPatientsSetting, handler);

export const fetchPatientsSettings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('patients')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return { data: data?.patients };
  } catch (error) {
    console.error('Fetch patients settings error:', error);
    return { error };
  }
};
