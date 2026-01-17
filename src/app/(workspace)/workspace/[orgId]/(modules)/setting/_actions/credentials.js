'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";

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
  let credential;

  try {
    credential = await db.credentials.upsert({
      where: {
        userId_serviceName: {
          userId,
          serviceName: formData.serviceName,
        },
      },
      create: {
        userId,
        serviceName: formData.serviceName,
        apiKey: formData.apiKey,
        apiSecret: formData.apiSecret,
        accessToken: formData.accessToken,
        refreshToken: formData.refreshToken,
        clientId: formData.clientId,
        clientSecret: formData.clientSecret,
        username: formData.username,
        password: formData.password,
        endpointUrl: formData.endpointUrl,
        webhookUrl: formData.webhookUrl,
        region: formData.region,
        port: formData.port,
        isActive: formData.isActive ?? true,
      },
      update: {
        apiKey: formData.apiKey,
        apiSecret: formData.apiSecret,
        accessToken: formData.accessToken,
        refreshToken: formData.refreshToken,
        clientId: formData.clientId,
        clientSecret: formData.clientSecret,
        username: formData.username,
        password: formData.password,
        endpointUrl: formData.endpointUrl,
        webhookUrl: formData.webhookUrl,
        region: formData.region,
        port: formData.port,
        isActive: formData.isActive,
      },
    });

    console.log('@credentials setting server action', credential);

  } catch (error) {
    console.log(error);
    return { message: "Oops!, something went wrong", error };
  }

  return { data: { credential } };
};

export const upsertCredentialSetting = createSafeAction(UpsertCredentialSetting, handler);

const DeleteCredentialSetting = z.object({
  userId: z.string(),
  serviceName: z.string(),
});

const deleteHandler = async (data) => {
  const { userId, serviceName } = data;

  try {
    await db.credentials.delete({
      where: {
        userId_serviceName: {
          userId,
          serviceName,
        },
      },
    });

    console.log('@credentials delete server action', { userId, serviceName });

  } catch (error) {
    console.log(error);
    return { message: "Oops!, something went wrong", error };
  }

  return { data: { success: true } };
};

export const deleteCredentialSetting = createSafeAction(DeleteCredentialSetting, deleteHandler);
