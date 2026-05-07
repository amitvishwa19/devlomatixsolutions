"use server";

export async function getEcommerceConfig() {
  try {
    // Return config from environment variables since DB is removed
    const config = {
      storeName: process.env.NEXT_PUBLIC_APP_NAME || "CrystalAura",
      webhookUrl: process.env.NEXT_PUBLIC_URL || "http://localhost:3001",
      apiKey: process.env.API_SECRET || "",
      isActive: true,
    };

    return { success: true, data: config };
  } catch (error) {
    console.error("[GET_ECOMMERCE_CONFIG_ERROR]", error);
    return { success: false, error: "Failed to fetch configuration" };
  }
}