import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { logger } from "@/lib/logger";
import { getGmailClient } from "@/lib/gmail";

export async function POST(req, { params }) {
    try {
        const { workspaceId, messageId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { accountId } = body;

        const gmail = await getGmailClient(null, accountId);
        const res = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'full'
        });

        // Recursive function to extract body from complex nested parts
        const getBody = (payload) => {
            if (payload.body && payload.body.data) {
                return Buffer.from(payload.body.data, 'base64').toString();
            }
            if (payload.parts) {
                // Prioritize plain text, then html
                const plainTextPart = payload.parts.find(p => p.mimeType === 'text/plain');
                if (plainTextPart) return getBody(plainTextPart);
                
                const htmlPart = payload.parts.find(p => p.mimeType === 'text/html');
                if (htmlPart) return getBody(htmlPart);

                // Fallback to first part
                return getBody(payload.parts[0]);
            }
            return "";
        };

        const messageBody = getBody(res.data.payload);
        console.log("[AI_SUMMARIZE] Body extracted, length:", messageBody?.length);

        if (!messageBody || messageBody.trim().length < 20) {
            return NextResponse.json({ summary: "This message appears to be empty or contains only media. Nothing to summarize." });
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMENI_API_KEY;
        
        if (!apiKey) {
            console.error("[AI_SUMMARIZE] API Key missing in environment");
            return NextResponse.json({ 
                message: "Gemini API key not found in environment. Please add GEMINI_API_KEY to your .env file."
            }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Using gemini-1.5-flash as it is the most standard/robust for this task
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemPrompt = "You are an expert email assistant. Provide a single, concise sentence that summarizes the most important takeaway or 'bottom line' of the following email. Focus on the core request or update. Do not include any introductory phrases like 'This email is about...'";
        
        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "Understood. Please provide the email content." }] },
            ],
        });

        const result = await chat.sendMessage(messageBody.substring(0, 10000)); // Limit context
        const summary = result.response.text().trim();

        return NextResponse.json({ summary });

    } catch (error) {
        console.error("[AI_SUMMARIZE_ERROR]", error);
        return NextResponse.json({ 
            message: "Failed to generate summary",
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
}
