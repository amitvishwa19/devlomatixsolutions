'use server'
import { z } from "zod";
import { createSafeAction } from "@/utils/CreateSafeAction";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid'
import { ROLE } from "@prisma/client";

const GenerativeAI = z.object({
    orgId: z.string(),
    userId: z.string(),
    topic: z.string(),
    platform: z.string(),
    tone: z.string(),
    contentType: z.string(),
    image: z.boolean()
});


const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const platformGuidelines = {
    twitter: "Keep it under 280 characters. Use hashtags sparingly (2-3 max). Be punchy and engaging.",
    instagram: "Write an engaging caption with emojis. Include a call-to-action. Suggest 5-10 relevant hashtags at the end.",
    linkedin: "Professional tone. Include insights or value. Can be longer form (up to 3000 characters). Use line breaks for readability.",
    facebook: "Conversational and engaging. Can include questions to boost engagement. Medium length works best.",
    tiktok: "Super casual and trendy. Use Gen-Z language if appropriate. Keep it short and hook-driven. Suggest trending sounds or effects."
};

const toneGuidelines = {
    professional: "Maintain a polished, business-appropriate voice. Use industry terminology when relevant.",
    casual: "Be friendly and relatable. Use conversational language.",
    humorous: "Include wit and humor. Make it entertaining while staying on-brand.",
    inspirational: "Be motivating and uplifting. Use powerful, emotive language.",
    educational: "Be informative and helpful. Break down complex topics simply."
};

const contentTypeGuidelines = {
    post: "Create a single, standalone social media post.",
    thread: "Create a thread/carousel with 3-5 connected posts that tell a story or provide value.",
    caption: "Create a caption for an image or video post.",
    story: "Create brief, engaging content suitable for Stories format."
};


const handler = async (data) => {
    let content
    let imagePrompt
    let imageDescription
    let imageUrl = null


    try {



        const { orgId, userId, topic, platform, tone, contentType, image } = data


        if (!GEMINI_API_KEY) {
            return ({ status: 500, message: 'Gemeni api keey not found' })
        }



        let systemPrompt = `You are an expert social media content creator and copywriter. Your task is to generate engaging, platform-optimized content. Platform: ${platform}`;

        // Add platform guidelines
        if (platformGuidelines[platform]) {
            systemPrompt += `${platformGuidelines[platform]}\n\n`;
        }

        systemPrompt += `Tone: ${tone}\n`;

        // Add tone guidelines
        if (toneGuidelines[tone]) {
            systemPrompt += `${toneGuidelines[tone]}\n\n`;
        }

        systemPrompt += `Content Type: ${contentType}\n`;

        // Add content type guidelines
        if (contentTypeGuidelines[contentType]) {
            systemPrompt += `${contentTypeGuidelines[contentType]}\n\n`;
        }

        systemPrompt += `Important guidelines:
                        - Make the content scroll-stopping and engaging
                        - Adapt language and style to the platform's culture
                        - Include relevant emojis where appropriate
                        - If suggesting hashtags, make them relevant and mix popular with niche ones
                        - Never use placeholder text like [Your Name] - make it ready to post`;



        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: `${systemPrompt}\n\nCreate ${contentType} content about: ${topic}` }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.9,
                        maxOutputTokens: 1024,
                    }
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API error:", response.status, errorText);
            //throw new Error("Failed to generate content. Check your API key.");
            return ({ status: 501, message: 'Failed to generate content. Check your API key', error: errorText })
        }


        const res = await response.json();
        content = res.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate content";


        if (image) {
            imagePrompt = `Create a vivid, detailed image description for a social media post.
                        Topic: ${topic}
                        Platform: ${platform}
                        Tone: ${tone}
                        Content type: ${contentType}

                        Describe only the visual scene that should be illustrated in one short paragraph, no hashtags or captions.`;

            const imgPromptRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [{ text: imagePrompt }]
                            }
                        ],
                        generationConfig: {
                            temperature: 0.8,
                            maxOutputTokens: 256,
                        }
                    }),
                }
            );

            if (!imgPromptRes.ok) {
                const errorText = await imgPromptRes.text();
                console.error("Gemini IMAGE PROMPT API error:", imgPromptRes.status, errorText);
                throw new Error("Failed to generate image description");
            }


            const imgPromptData = await imgPromptRes.json();
            imageDescription = imgPromptData.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate image description";


            // ✅ FREE IMAGE GENERATION using Hugging Face (no API key needed!)
            const imageRes = null

            if (imageRes.ok) {
                const imageBlob = await imageRes.blob();
                imageUrl = URL.createObjectURL(imageBlob);
            }
        }


    } catch (error) {
        return { message: "Oops!, something went wrong", error }
    }

    return { data: { content, imagePrompt: imageDescription, imageUrl } };

}


export const generativeAI = createSafeAction(GenerativeAI, handler);