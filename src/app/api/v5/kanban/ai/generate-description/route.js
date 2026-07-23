import { NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";

async function getUserIdFromRequest(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return null;
    const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
    const payload = await decrypt(token);
    return payload?.userId || null;
  } catch {
    return null;
  }
}

async function generateWithGemini(title, type) {
  const apiKey = process.env.GEMINI_API;
  if (!apiKey) return null;

  const prompt = `Generate a concise, professional task description for a ${type || 'task'} titled "${title}". 
The description should be 2-3 sentences explaining what needs to be done, why it matters, and any key considerations.
Return only the description text, no markdown or prefixes.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, type } = body;

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const description = await generateWithGemini(title, type || 'task');

    if (!description) {
      return NextResponse.json({ error: "Failed to generate description" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { description } });
  } catch (error) {
    console.error("AI generate description error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate description" }, { status: 500 });
  }
}
