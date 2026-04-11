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
     * Classify an incoming message for smart routing.
     */
    async classifyMessage(message) {
        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `Classify this customer message into one category: [SALES, SUPPORT, BILLING, FEEDBACK, SPAM, OTHER]. 
            Return ONLY the category name. Message: "${message}"`;
            
            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        } catch (e) {
            return "OTHER";
        }
    }
}

export const waAIService = WhatsAppAIService.getInstance();
