import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { supabase } from "@/supabase/client";

const UpsertInvoiceSetting = z.object({
  userId: z.string(),
  formData: z.object({
    invoicePrefix: z.string().optional(),
    nextInvoiceNumber: z.number().optional(),
    dueDatePeriod: z.string().optional(),
    currency: z.string().optional(),
    invoiceNotes: z.string().optional(),
    taxRate: z.number().optional(),
    taxId: z.string().optional(),
    includeTaxInPrice: z.boolean().optional(),
    showTaxBreakdown: z.boolean().optional(),
    acceptCash: z.boolean().optional(),
    acceptCard: z.boolean().optional(),
    acceptInsurance: z.boolean().optional(),
    allowPartialPayments: z.boolean().optional(),
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
        .update({ invoice: formData })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      result = updated;
    } else {
      const { data: inserted, error } = await supabase
        .from('settings')
        .insert({ user_id: userId, invoice: formData })
        .select()
        .single();

      if (error) throw error;
      result = inserted;
    }

    console.log('@invoice setting supabase action', result);
    return { data: { setting: result } };

  } catch (error) {
    console.error('Invoice settings error:', error);
    return { message: "Oops!, something went wrong", error };
  }
};

export const upsertInvoiceSettingSupabase = createSafeAction(UpsertInvoiceSetting, handler);

export const fetchInvoiceSettings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('invoice')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return { data: data?.invoice };
  } catch (error) {
    console.error('Fetch invoice settings error:', error);
    return { error };
  }
};
