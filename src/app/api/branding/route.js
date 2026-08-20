import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export async function GET() {
    try {
        const globalSettings = await prisma.appSettings.findUnique({
            where: { key: 'global' }
        });

        const branding = globalSettings?.social || globalSettings?.general || {
            primaryColor: "#3b82f6",
            logoUrl: "",
            appName: "Devlomatix",
            appDescription: "Your Productivity Platform",
        };

        return NextResponse.json(branding);
    } catch (error) {
        console.error("GET Branding Error:", error);
        return NextResponse.json({ message: "Internal Server Error", error: error?.message || String(error) }, { status: 500 });
    }
}
