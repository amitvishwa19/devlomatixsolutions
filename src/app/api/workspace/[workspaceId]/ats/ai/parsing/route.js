import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

import { prisma } from "@/lib/prisma";

export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { candidateId, resumeUrl, resumeText } = await req.json();

        if (!candidateId && !resumeText && !resumeUrl) {
            return NextResponse.json({ message: "Candidate ID or Resume content is required" }, { status: 400 });
        }

        let resumeContent = resumeText;
        let candidate;

        if (candidateId) {
            candidate = await prisma.candidate.findUnique({
                where: { id: candidateId }
            });
            if (!candidate) return NextResponse.json({ message: "Candidate not found" }, { status: 404 });
            
            // In a real app, we might download the resume from resumeUrl if text is missing
            // For now, we assume resumeText or simulation
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMENI_API_KEY;
        
        if (!apiKey) {
            return NextResponse.json({ 
                message: "Gemini API key missing. Please configure GEMINI_API_KEY."
            }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
            You are an expert recruitment AI. Analyze the following resume and extract candidate information into a strictly structured JSON format.
            
            Fields to extract:
            - name (String)
            - email (String)
            - phone (String)
            - location (String)
            - summary (String - short professional summary)
            - skills (Array of Strings)
            - experience (Array of objects with title, company, duration, description)
            - education (Array of objects with degree, institution, year)
            
            Resume Content:
            ${resumeText || `Please analyze the document at this URL: ${resumeUrl}`}

            Return ONLY the JSON object.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const parsedData = JSON.parse(responseText);

        if (candidateId) {
            await prisma.candidate.update({
                where: { id: candidateId },
                data: {
                    name: parsedData.name || undefined,
                    email: parsedData.email || undefined,
                    phone: parsedData.phone || undefined,
                    location: parsedData.location || undefined,
                    skills: parsedData.skills || [],
                    experience: parsedData.experience,
                    education: parsedData.education,
                    aiInsights: {
                        summary: parsedData.summary,
                        pros: parsedData.skills?.slice(0, 3) || [], // Basic mapping if pros not in prompt
                        cons: []
                    }
                }
            });
        }

        return NextResponse.json({ 
            success: true,
            data: parsedData
        });

    } catch (error) {
        console.error("[AI_PARSE_ERROR]", error);
        return NextResponse.json({ 
            message: "Failed to parse resume",
            error: error.message 
        }, { status: 500 });
    }
}
