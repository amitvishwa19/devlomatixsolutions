import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { supabase } from "@/supabase/client";


const UpsertDepartmentsSetting = z.object({
  userId: z.string(),
  formData: z.object({
    departments: z.array(z.object({
      id: z.string(),
      name: z.string(),
      code: z.string(),
      head: z.string().optional(),
      beds: z.number().optional(),
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
        .update({ departments: formData })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      result = updated;
    } else {
      const { data: inserted, error } = await supabase
        .from('settings')
        .insert({ user_id: userId, departments: formData })
        .select()
        .single();

      if (error) throw error;
      result = inserted;
    }

    console.log('@departments setting supabase action', result);
    return { data: { setting: result } };

  } catch (error) {
    console.error('Departments settings error:', error);
    return { message: "Oops!, something went wrong", error };
  }
};

export const upsertDepartmentsSettingSupabase = createSafeAction(UpsertDepartmentsSetting, handler);

export const fetchDepartmentsSettings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('departments')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return { data: data?.departments };
  } catch (error) {
    console.error('Fetch departments settings error:', error);
    return { error };
  }
};
