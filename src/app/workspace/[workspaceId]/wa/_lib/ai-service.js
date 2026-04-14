import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db";

/**
 * WhatsAppAIService: Integration with Gemini for RAG and Smart Automation.
 */
export class WhatsAppAIService {
    static instance;
    genAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY || "";
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    static getInstance() {
        if (!WhatsAppAIService.instance) {
            WhatsAppAIService.instance = new WhatsAppAIService();
        }
        return WhatsAppAIService.instance;
    }

    /**
     * Generate an AI response based on workspace documents (RAG).
     */
    async generateRAGResponse(workspaceId, userMessage, category = 'GENERAL') {
        try {
            // 1. Find relevant context from documents
            const context = await this.findRelevantContext(workspaceId, userMessage, category);

            // 2. Prepare Gemini prompt
            const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            
            const prompt = `
                You are a helpful business assistant for a company in this workspace.
                
                CONTEXT FROM BUSINESS DOCUMENTS:
                ---
                ${context || "No specific documents found for this query. Use general professional knowledge."}
                ---

                CUSTOMER QUERY: ${userMessage}

                INSTRUCTIONS:
                - Use the provided context to answer accurately.
                - If the answer is not in the context, say you don't know or ask for more details.
                - Keep the tone professional, concise, and helpful.
                - Do not mention that you are using specific "documents" - just answer the customer.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();

        } catch (error) {
            console.error("[WA_AI] RAG Error:", error);
            return "I apologize, I'm having trouble processing your request right now. Please try again later.";
        }
    }

    /**
     * Simple keyword-based context search if Vector DB is not set up.
     */
    async findRelevantContext(workspaceId, query, category) {
        const keywords = query.toLowerCase().split(' ').filter(word => word.length > 3);
        
        const documents = await db.workspaceDocument.findMany({
            where: {
                workspaceId,
                category,
                content: { not: null }
            },
            take: 5
        });

        if (!documents.length) return "";

        const scoredDocs = documents.map(doc => {
            let score = 0;
            keywords.forEach(kw => {
                if (doc.content?.toLowerCase().includes(kw)) score++;
            });
            return { content: doc.content, score };
        });

        const relevantContent = scoredDocs
            .filter(d => d.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(d => d.content)
            .join("\n\n---\n\n");

        return relevantContent || documents[0].content?.substring(0, 2000); 
    }

    /**
     * Generate a WhatsApp template suggest based on a user prompt.
     */
    async generateTemplateSuggestion(prompt) {
        try {
            const model = this.genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                generationConfig: { responseMimeType: "application/json" }
            });
            
            const systemPrompt = `
                You are an expert WhatsApp Marketing and Automation specialist.
                Generate a professional WhatsApp template based on the following USER INTENT: "${prompt}"

                RETURN A JSON OBJECT WITH THE FOLLOWING STRUCTURE:
                {
                    "name": "Short Descriptive Name (Lower case, no spaces, e.g. festive_offer)",
                    "displayName": "Capitalized Name (e.g. Festive Offer)",
                    "category": "One of [MARKETING, UTILITY, AUTHENTICATION]",
                    "body": "The main message text. Use {{1}}, {{2}}, etc. for variables if needed.",
                    "footer": "Optional footer text (max 60 chars)",
                    "buttons": ["Up to 3 Quick Reply button labels"]
                }

                RULES:
                - Body should be engaging and compliant with WhatsApp policies.
                - Buttons should be short (max 20 chars).
                - Use a professional yet conversational tone.
            `;

            const result = await model.generateContent(systemPrompt);
            const response = await result.response;
            const text = response.text();
            
            // Clean markdown if present
            const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanJson);
        } catch (error) {
            console.error("[WA_AI] Suggestion Error:", error);
            throw error;
        }
    }

    /**
     * Translate template content to another language using AI.
     */
    async translateTemplate(text, targetLanguage) {
        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `Translate the following WhatsApp message to ${targetLanguage}. 
            IMPORTANT: Keep all variables like {{1}}, {{2}}, etc. EXACTLY as they are. Do not translate them.
            
            Text: "${text}"`;
            
            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        } catch (error) {
            console.error("[WA_AI] Translation Error:", error);
            return text; // Fallback to original
        }
    /**
     * Generate 3 suggested replies based on conversation history.
     */
    async generateReplySuggestions(messages) {
        try {
            const model = this.genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                generationConfig: { responseMimeType: "application/json" }
            });

            // Format history for context
            const history = messages
                .slice(-10) // Take last 10 messages
                .map(m => `${m.fromMe ? 'YOU' : 'CUSTOMER'}: ${m.text}`)
                .join('\n');

            const prompt = `
                You are a helpful business customer support agent.
                Based on the following conversation history, generate exactly 3 short, professional, and helpful reply suggestions.
                Keep them concise and ready to send.

                CONVERSATION HISTORY:
                ---
                ${history}
                ---

                RETURN A JSON OBJECT WITH THE FOLLOWING STRUCTURE:
                {
                    "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
                }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanJson);
        } catch (error) {
            console.error("[WA_AI] Reply Suggestion Error:", error);
            return { suggestions: ["How can I help you today?", "Please share more details.", "I will get back to you."] };
        }
    }
}

export const waAIService = WhatsAppAIService.getInstance();
