import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { supabase } from "@/supabase/client";

const UpsertGeneralSetting = z.object({
  userId: z.string(),
  formData: z.object({
    hospitalName: z.string().optional(),
    hospitalCode: z.string().optional(),
    contactEmail: z.string().optional(),
    contactPhone: z.string().optional(),
    website: z.string().optional(),
    address: z.string().optional(),
    logo: z.string().optional(),
    timezone: z.string().optional(),
    language: z.string().optional(),
    dateFormat: z.string().optional(),
    timeFormat: z.string().optional(),
    currency: z.string().optional(),
    theme: z.string().optional(),
  }),
});

const handler = async (data) => {
  const { userId, formData } = data;

  try {
    // Check if record exists
    const { data: existing } = await supabase
      .from('general_settings')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    let result;

    if (existing) {
      // Update existing record
      const { data: updated, error } = await supabase
        .from('general_settings')
        .update({
          hospital_name: formData.hospitalName,
          hospital_code: formData.hospitalCode,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone,
          website: formData.website,
          address: formData.address,
          logo: formData.logo,
          timezone: formData.timezone,
          language: formData.language,
          date_format: formData.dateFormat,
          time_format: formData.timeFormat,
          currency: formData.currency,
          theme: formData.theme,
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      result = updated;
    } else {
      // Insert new record
      const { data: inserted, error } = await supabase
        .from('general_settings')
        .insert({
          user_id: userId,
          hospital_name: formData.hospitalName,
          hospital_code: formData.hospitalCode,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone,
          website: formData.website,
          address: formData.address,
          logo: formData.logo,
          timezone: formData.timezone,
          language: formData.language,
          date_format: formData.dateFormat,
          time_format: formData.timeFormat,
          currency: formData.currency,
          theme: formData.theme,
        })
        .select()
        .single();

      if (error) throw error;
      result = inserted;
    }

    console.log('@general setting supabase action', result);
    return { data: { setting: result } };

  } catch (error) {
    console.error('General settings error:', error);
    return { message: "Oops!, something went wrong", error };
  }
};

export const upsertGeneralSettingSupabase = createSafeAction(UpsertGeneralSetting, handler);

// Fetch general settings
export const fetchGeneralSettings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('general_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Fetch general settings error:', error);
    return { error };
  }
};
