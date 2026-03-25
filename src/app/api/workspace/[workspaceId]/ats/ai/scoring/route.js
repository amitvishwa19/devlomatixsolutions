import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { candidateProfile, jobDescription } = await req.json();

        if (!candidateProfile || !jobDescription) {
            return NextResponse.json({ message: "Candidate profile and job description are required" }, { status: 400 });
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
            You are an expert recruitment AI. Compare the candidate's profile with the provided job description and evaluate their fit.
            
            Candidate Profile:
            ${JSON.stringify(candidateProfile)}
            
            Job Description:
            ${jobDescription}
            
            Provide a strictly structured JSON response with:
            - score (Number, 0-100)
            - summary (String - 1-2 sentence overview of fit)
            - strengths (Array of Strings)
            - gaps (Array of Strings)
            - recommendation (String - e.g., "Highly Recommend", "Potential Fit", "Not a Match")

            Return ONLY the JSON object.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const scoreData = JSON.parse(responseText);

        return NextResponse.json({ 
            success: true,
            data: scoreData
        });

    } catch (error) {
        console.error("[AI_SCORING_ERROR]", error);
        return NextResponse.json({ 
            message: "Failed to score candidate",
            error: error.message 
        }, { status: 500 });
    }
}
