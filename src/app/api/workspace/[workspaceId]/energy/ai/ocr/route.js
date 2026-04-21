import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
    try {
        const body = await req.json();
        const { imageBase64, mimeType = "image/jpeg" } = body;

        if (!imageBase64) {
            return NextResponse.json({ message: "Image data is required" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) {
            console.error("[AI_OCR] API Key missing in environment");
            return NextResponse.json({ message: "Gemini API key not configured." }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const targetModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";
        const model = genAI.getGenerativeModel({ model: targetModel });

        const prompt = "Analyze this image of an energy meter and extract the primary reading/number shown on the digital display. Return ONLY the numeric value (no letters, symbols, or conversational text).";

        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const text = result.response.text();

        // Clean up text in case the AI adds formatting
        const matches = text.match(/\d+/g);
        const extractedNumber = matches ? matches.join("") : text.trim();

        return NextResponse.json({ reading: extractedNumber });
    } catch (error) {
        console.error("[AI_OCR_ERROR]", error);
        return NextResponse.json({ message: "Failed to extract text from image", error: error.message }, { status: 500 });
    }
}
