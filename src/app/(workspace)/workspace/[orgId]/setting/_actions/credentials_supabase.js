import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import supabase from "@/supabase/client";


const UpsertCredentialSetting = z.object({
  userId: z.string(),
  formData: z.object({
    id: z.string().optional(),
    serviceName: z.string(),
    apiKey: z.string().optional(),
    apiSecret: z.string().optional(),
    accessToken: z.string().optional(),
    refreshToken: z.string().optional(),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    endpointUrl: z.string().optional(),
    webhookUrl: z.string().optional(),
    region: z.string().optional(),
    port: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

const handler = async (data) => {
  const { userId, formData } = data;

  try {
    const { data: existing } = await supabase
      .from('settings')
      .select('id, credentials')
      .eq('user_id', userId)
      .maybeSingle();

    let result;
    const credentialsData = existing?.credentials || [];

    // Find existing credential by serviceName
    const existingIndex = credentialsData.findIndex(
      (c) => c.serviceName === formData.serviceName
    );

    if (existingIndex >= 0) {
      // Update existing credential
      credentialsData[existingIndex] = {
        ...credentialsData[existingIndex],
        ...formData,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Add new credential
      credentialsData.push({
        ...formData,
        id: formData.id || crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    if (existing) {
      const { data: updated, error } = await supabase
        .from('settings')
        .update({ credentials: credentialsData })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      result = updated;
    } else {
      const { data: inserted, error } = await supabase
        .from('settings')
        .insert({ user_id: userId, credentials: credentialsData })
        .select()
        .single();

      if (error) throw error;
      result = inserted;
    }

    console.log('@credentials setting supabase action', result);
    return { data: { setting: result } };

  } catch (error) {
    console.error('Credentials settings error:', error);
    return { message: "Oops!, something went wrong", error };
  }
};

export const upsertCredentialSettingSupabase = createSafeAction(UpsertCredentialSetting, handler);

const DeleteCredentialSetting = z.object({
  userId: z.string(),
  serviceName: z.string(),
});

const deleteHandler = async (data) => {
  const { userId, serviceName } = data;

  try {
    const { data: existing } = await supabase
      .from('settings')
      .select('id, credentials')
      .eq('user_id', userId)
      .maybeSingle();

    if (!existing) {
      return { message: "Settings not found" };
    }

    const credentialsData = existing.credentials || [];
    const updatedCredentials = credentialsData.filter(
      (c) => c.serviceName !== serviceName
    );

    const { error } = await supabase
      .from('settings')
      .update({ credentials: updatedCredentials })
      .eq('user_id', userId);

    if (error) throw error;

    console.log('@credentials delete supabase action', { userId, serviceName });
    return { data: { success: true } };

  } catch (error) {
    console.error('Delete credentials error:', error);
    return { message: "Oops!, something went wrong", error };
  }
};

export const deleteCredentialSettingSupabase = createSafeAction(DeleteCredentialSetting, deleteHandler);

export const fetchCredentialsSettings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('credentials')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return { data: data?.credentials || [] };
  } catch (error) {
    console.error('Fetch credentials settings error:', error);
    return { error };
  }
};
