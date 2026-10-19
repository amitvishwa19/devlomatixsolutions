import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db";
import crypto from "node:crypto";

/**
 * Get configured Gemini API key & model for the current user or system fallback
 */
async function getGeminiCredentials(userId) {
    let apiKey = null;
    let aiModel = "gemini-1.5-flash";

    if (userId) {
        try {
            const credential = await db.credentials.findFirst({
                where: {
                    userId,
                    platform: "GEMINI",
                    status: "connected"
                },
                orderBy: { createdAt: "desc" }
            });

            if (credential && credential.credentials) {
                let data = credential.credentials;
                if (data.enc && typeof data.enc === "string") {
                    const encKey = process.env.ENCRYPTION_KEY;
                    if (encKey) {
                        try {
                            const parts = data.enc.split(":");
                            const ivBuffer = Buffer.from(parts[0], "hex");
                            const encText = Buffer.from(parts.slice(1).join(":"), "hex");
                            const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(encKey, "hex"), ivBuffer);
                            let decrypted = decipher.update(encText);
                            decrypted = Buffer.concat([decrypted, decipher.final()]);
                            data = JSON.parse(decrypted.toString());
                        } catch (e) {
                            console.error("[GEMINI_DECRYPT_FAILED]", e.message);
                        }
                    }
                }
                apiKey = data.apiKey || data["api-key"] || data.api_key;
                if (data.model) aiModel = data.model;
            }
        } catch (e) {
            console.error("[GET_GEMINI_CRED_ERROR]", e.message);
        }
    }

    if (!apiKey) {
        apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMENI_API_KEY;
    }

    return { apiKey, aiModel };
}

/**
 * Call Gemini to analyze extracted DOM text and images and extract structured product data
 */
export async function extractProductsWithGemini({
    userId,
    targetUrl,
    cleanText,
    images = [],
    og = {},
    jsonLd = [],
    mode = "auto",
    limit = 10
}) {
    const { apiKey, aiModel } = await getGeminiCredentials(userId);

    if (!apiKey) {
        throw new Error("Gemini API key is not configured. Please add your Gemini key in Credentials or system environment.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: aiModel,
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1
        }
    });

    const prompt = `
You are an expert eCommerce catalog extraction intelligence.
Your task is to analyze the provided web page data (OpenGraph metadata, JSON-LD schema, extracted text, and candidate image URLs) from "${targetUrl}" and extract the product(s) available on this page.

Available Information:
- Target URL: ${targetUrl}
- OpenGraph: ${JSON.stringify(og)}
- JSON-LD Snippets: ${JSON.stringify(jsonLd).slice(0, 4000)}
- Candidate High-Res Image URLs: ${JSON.stringify(images.slice(0, 20))}
- Web Page Text:
"""
${cleanText.slice(0, 10000)}
"""

Extraction Instructions:
1. Extract up to ${limit} distinct product(s). If this is a single product page, extract that 1 product in deep detail.
2. For each product, extract:
   - "title": Clean, market-ready title without store branding or fluff.
   - "description": High-converting, readable product description.
   - "price": Numeric retail/selling price (number, e.g. 1499.00). If multiple options, use the base price.
   - "discount": Numeric discount or compare-at price difference if on sale (number, default 0).
   - "currency": Standard 3-letter currency code (e.g. "INR", "USD", "EUR", "GBP").
   - "sku": Manufacturer SKU if found, otherwise generate a unique alphanumeric SKU based on title.
   - "category": Best fitting category name (e.g., "Apparel", "Footwear", "Electronics").
   - "imageUrls": Array of 1 to 6 image URLs that best represent this product. Prioritize URLs from Candidate Image URLs or OpenGraph image. Make sure URLs are absolute.
   - "variants": Array of variant objects if available, each with { "name": string (e.g. "Size: L / Color: Black"), "price": number, "sku": string, "inventoryCount": number (default 20) }. If no variants, provide one standard variant.
   - "specifications": Key-value dictionary of product specs (e.g. { "Material": "Cotton", "Weight": "250g", "Brand": "..." }).
   - "tags": Array of 3 to 6 search keywords.

Return strictly a JSON object with this structure:
{
  "products": [
    {
      "title": "string",
      "description": "string",
      "price": number,
      "discount": number,
      "currency": "string",
      "sku": "string",
      "category": "string",
      "imageUrls": ["string"],
      "variants": [
        {
          "name": "string",
          "price": number,
          "sku": "string",
          "inventoryCount": number
        }
      ],
      "specifications": {
        "key": "value"
      },
      "tags": ["string"]
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    try {
        const parsed = JSON.parse(rawText);
        if (parsed && Array.isArray(parsed.products)) {
            return parsed.products;
        }
        return [];
    } catch (parseErr) {
        console.error("[GEMINI_JSON_PARSE_ERROR]", parseErr, rawText);
        throw new Error("AI failed to return valid JSON. Please try again or refine the URL.");
    }
}
