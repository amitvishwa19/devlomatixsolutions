'use server';

import { db } from "@/lib/db";
import { getAuthUser } from "./auth-helper";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Run Gemini AI on Document (Summarize, Action Items, Polish, Q&A)
 */
export async function runDocumentAi(workspaceId, documentId, { action = "summarize", question, customPrompt } = {}) {
    try {
        await getAuthUser();
        if (!documentId) throw new Error("Document ID required");

        const document = await db.workspaceDocument.findUnique({
            where: { id: documentId, workspaceId },
        });

        if (!document) {
            throw new Error("Document not found");
        }

        let docContext = "";
        if (document.content) {
            docContext = document.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        }
        if (!docContext && document.description) {
            docContext = document.description;
        }
        if (!docContext) {
            docContext = `Document Name: ${document.name}, File Type: ${document.fileType || 'File'}, Category: ${document.category || 'General'}`;
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMENI_API_KEY;

        if (!apiKey) {
            throw new Error("Gemini API key is not configured. Please add GEMINI_API_KEY to your environment variables.");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let prompt = "";

        if (action === "summarize") {
            prompt = `You are an elite workspace document analyst. Analyze the following document and provide:
1. A concise 1-sentence Executive TL;DR.
2. 3 to 5 Key Takeaways & Highlights in clean bullet points.
3. Target Audience / Department if applicable.

Document Name: "${document.name}"
Document Content:
${docContext.substring(0, 15000)}

Format response with clear markdown headings and bold bullet points.`;
        } else if (action === "actions") {
            prompt = `You are a project manager and productivity expert. Analyze the following document and extract all actionable next steps, tasks, owners, and priorities.

Document Name: "${document.name}"
Document Content:
${docContext.substring(0, 15000)}

Format as a markdown checklist with priorities [HIGH / MED / LOW] and suggested owners/roles. If no explicit actions exist, formulate 3 recommended next steps based on the document.`;
        } else if (action === "polish") {
            prompt = `You are a professional editor. Improve the following document content for clarity, active voice, executive polish, and brevity while keeping all key facts intact.

Document Content:
${docContext.substring(0, 15000)}

Return the polished version formatted cleanly in HTML or Markdown.`;
        } else if (action === "ask") {
            prompt = `You are an intelligent document assistant answering user questions specifically based on the provided document.

Document Name: "${document.name}"
Document Content:
${docContext.substring(0, 15000)}

User Question: "${question || customPrompt}"

Provide a clear, accurate, and direct answer based strictly on the document information. If the answer is not in the document, state that clearly and offer general guidance.`;
        } else {
            prompt = `Analyze the document: "${document.name}" with content: ${docContext.substring(0, 15000)}`;
        }

        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();

        return {
            success: true,
            action,
            result: aiResponse,
            docTitle: document.name,
        };
    } catch (error) {
        console.error("[SERVER_ACTION_DOCUMENT_AI]", error);
        return { success: false, error: error.message || "Failed to process AI request" };
    }
}
