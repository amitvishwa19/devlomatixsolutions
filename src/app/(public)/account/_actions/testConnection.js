"use server";

import { z } from "zod";

const TestConnectionSchema = z.object({
  storeId: z.string().min(1),
  webhookUrl: z.string().url(),
  apiKey: z.string().min(1),
});

export async function testConnection(data) {
  try {
    const validated = TestConnectionSchema.parse(data);

    // Call health endpoint directly without DB lookup
    const response = await fetch(`${validated.webhookUrl}/api/health`, {
      method: "GET",
      headers: {
        "x-api-key": validated.apiKey,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return { success: true, message: "Connection successful!" };
    } else if (response.status === 401) {
      return { success: false, error: "Invalid API key" };
    } else {
      return { success: false, error: `Connection failed: ${response.status}` };
    }
  } catch (error) {
    console.error("[TEST_CONNECTION_ERROR]", error);
    return {
      success: false,
      error: "Cannot connect to server. Check webhook URL.",
    };
  }
}