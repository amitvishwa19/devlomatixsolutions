import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Bot, Twitter, Instagram, Linkedin, Facebook, Sparkles, Copy, Check, Loader2, MessageSquare, Layers, Image as ImageIcon, Film, Globe, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/supabase/client";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs"

// ---------------------------------------------------------
// GEMINI API LIGHWEIGHT INTEGRATION
// ---------------------------------------------------------
const GEMINI_API_KEY = "AIzaSyDJgGYDDr8SDZlq3cvpM3ShECu9VhSEDeQ";
const GEMINI_MODEL = "gemini-2.5-flash";

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
    post: "Create a detailed, standalone social media post. Make it comprehensive and engaging, at least 500 words.",
    thread: "Create a thread/carousel with 8-12 connected posts that tell a story or provide deep value. Each post should be substantial.",
    caption: "Create a detailed, engaging caption for an image or video post. At least 300 words with context and storytelling.",
    story: "Create an extremely detailed, long-form story. This MUST be at least 6000 words. Include rich narrative, multiple sections... Do NOT summarize — expand on every point extensively."
};

const languages = {
    english: "Write in English.", spanish: "Write entirely in Spanish (Español).",
    french: "Write entirely in French (Français).", german: "Write entirely in German (Deutsch).",
    portuguese: "Write entirely in Portuguese (Português).", italian: "Write entirely in Italian (Italiano).",
    japanese: "Write entirely in Japanese (日本語).", korean: "Write entirely in Korean (한국어).",
    chinese: "Write entirely in Simplified Chinese (中文).", arabic: "Write entirely in Arabic (العربية).",
    hindi: "Write entirely in Hindi (हिन्दी).",
};

async function generateContent({ topic, platform, tone, contentType, language, wordCount }) {
    const languageInstruction = languages[language] || languages.english;
    const wordCountInstruction = wordCount ? `\nIMPORTANT: The main content MUST be approximately ${wordCount} words long. Do not make it shorter.` : "";

    const systemPrompt = `You are an expert social media content creator and copywriter. Your task is to generate engaging, platform-optimized content.

You MUST respond in the following JSON format ONLY (no markdown, no code blocks, just raw JSON):
{
  "title": "A catchy, attention-grabbing title for the content",
  "description": "A brief 1-2 sentence summary/description of what this content is about",
  "content": "The main content body here",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}

${languageInstruction}

Platform: ${platform}
${platformGuidelines[platform] || ""}

Tone: ${tone}
${toneGuidelines[tone] || ""}

Content Type: ${contentType}
${contentTypeGuidelines[contentType] || ""}
${wordCountInstruction}

Important guidelines:
- Make the content scroll-stopping and engaging
- Adapt language and style to the platform's culture
- Include relevant emojis where appropriate in the content
- Generate 5-15 relevant hashtags (mix popular with niche ones), WITHOUT the # symbol
- The title should be compelling and platform-appropriate
- The description should summarize the content in 1-2 sentences
- Never use placeholder text like [Your Name] - make it ready to post
- Return ONLY valid JSON, no other text`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemPrompt}\n\nCreate ${contentType} content about: ${topic}` }] }],
                generationConfig: { temperature: 0.9, maxOutputTokens: contentType === "story" ? 16384 : 2048 }
            }),
        }
    );

    if (!response.ok) throw new Error("Failed to generate content.");

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    try {
        const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return {
            title: parsed.title || topic,
            description: parsed.description || "",
            content: parsed.content || rawText,
            hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags.map((h) => h.replace(/^#/, '')) : [],
        };
    } catch {
        return { title: topic, description: "", content: rawText, hashtags: [] };
    }
}

// ---------------------------------------------------------
// EMBEDDED CONTENT GENERATOR
// ---------------------------------------------------------

const platformOptions = [
    { id: "twitter", name: "Twitter/X", icon: Twitter, color: "text-sky-400" },
    { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-400" },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-blue-400" },
    { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-500" },
    { id: "tiktok", name: "TikTok", icon: Film, color: "text-cyan-400" },
];

const toneOptions = [
    { id: "professional", name: "Professional", emoji: "💼" },
    { id: "casual", name: "Casual", emoji: "😊" },
    { id: "humorous", name: "Humorous", emoji: "😂" },
    { id: "inspirational", name: "Inspirational", emoji: "✨" },
    { id: "educational", name: "Educational", emoji: "📚" },
];

const contentTypeOptions = [
    { id: "post", name: "Single Post", icon: MessageSquare },
    { id: "thread", name: "Thread", icon: Layers },
    { id: "caption", name: "Caption", icon: ImageIcon },
    { id: "story", name: "Story", icon: Film },
];

const languageOptions = [
    { id: "english", name: "English", flag: "🇺🇸" },
    { id: "spanish", name: "Español", flag: "🇪🇸" },
    { id: "french", name: "Français", flag: "🇫🇷" },
    { id: "german", name: "Deutsch", flag: "🇩🇪" },
    { id: "portuguese", name: "Português", flag: "🇧🇷" },
    { id: "japanese", name: "日本語", flag: "🇯🇵" },
    { id: "hindi", name: "हिन्दी", flag: "🇮🇳" },
];



// ---------------------------------------------------------
// COMPONENT EXPORT
// ---------------------------------------------------------

export const AILabModal = ({ isOpen, onOpenChange }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent
                className="p-0 border border-border/50 rounded-lg shadow-2xl bg-background flex flex-col overflow-hidden"
                style={{ minWidth: '90vw', maxWidth: '90vw', minHeight: '90vh', maxHeight: '90vh' }}
            >
                <Tabs defaultValue="generator" className="w-full">
                    <DialogHeader className="p-4 border-b border-border bg-card  flex flex-row items-center justify-between">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Bot className="h-6 w-6 text-primary" /> AI Content Lab
                        </DialogTitle>
                        <TabsList className='mr-10'>
                            <TabsTrigger value="generator">Generator</TabsTrigger>
                            <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
                            <TabsTrigger value="rewriter">Rewriter</TabsTrigger>
                            <TabsTrigger value="content-calendar">Content Calendar</TabsTrigger>
                            <TabsTrigger value="api-docs">API Docs</TabsTrigger>
                            <TabsTrigger value="analytics">Analytis</TabsTrigger>

                        </TabsList>
                    </DialogHeader>
                    <ScrollArea className="flex-1 overflow-auto rounded-b-lg bg-muted/20">

                    </ScrollArea>
                </Tabs>

            </DialogContent>
        </Dialog>
    );
};
