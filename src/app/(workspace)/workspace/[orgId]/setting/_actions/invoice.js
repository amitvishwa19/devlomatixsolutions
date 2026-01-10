'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

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
  let setting;

  try {
    setting = await db.setting.upsert({
      where: { userId },
      create: {
        userId,
        invoice: formData,
      },
      update: {
        invoice: formData,
      },
    });

    console.log('@invoice setting server action', setting);

  } catch (error) {
    console.log(error);
    return { message: "Oops!, something went wrong", error };
  }

  return { data: { setting } };
};

export const upsertInvoiceSetting = createSafeAction(UpsertInvoiceSetting, handler);
