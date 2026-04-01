import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export async function POST(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return new NextResponse("Unauthorized", { status: 401 });

        const { workspaceId } = params;
        const { credentialId, provider } = await req.json();

        if (!credentialId) return new NextResponse("Missing Credential ID", { status: 400 });

        const credential = await db.credentials.findUnique({
            where: { id: credentialId, userId: session.user.id }
        });

        if (!credential || !credential.credentials) {
            return new NextResponse("Credential not found", { status: 404 });
        }

        const credData = credential.credentials;
        const apiKey = credData.apiKey || credData.api_key || credData.token;

        if (!apiKey) return new NextResponse("API Key not found in credential", { status: 400 });

        // Test based on provider
        if (provider === 'gemini') {
            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                // Simple handshake
                await model.countTokens("ping");
                return NextResponse.json({ success: true, message: "Gemini API Key is valid" });
            } catch (err) {
                return NextResponse.json({ success: false, error: err.message }, { status: 400 });
            }
        }

        if (provider === 'openai') {
            try {
                const openai = new OpenAI({ apiKey });
                await openai.models.list();
                return NextResponse.json({ success: true, message: "OpenAI API Key is valid" });
            } catch (err) {
                return NextResponse.json({ success: false, error: err.message }, { status: 400 });
            }
        }

        return NextResponse.json({ success: true, message: "Credential linked (No validation logic for this provider yet)" });

    } catch (error) {
        console.error("[CREDENTIAL_TEST_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
