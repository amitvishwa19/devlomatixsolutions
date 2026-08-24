import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

const DEFAULT_BRANDING = {
    primaryColor: "#3b82f6",
    logoUrl: "",
    appName: "Devlomatix",
    appDescription: "Your Productivity Platform",
};

export async function GET() {
    try {
        const globalSettings = await prisma.appSettings.findUnique({
            where: { key: 'global' }
        }).catch(() => null);

        const branding = globalSettings?.social || globalSettings?.general || DEFAULT_BRANDING;

        return NextResponse.json(branding);
    } catch (error) {
        console.error("GET Branding Error:", error);
        return NextResponse.json(DEFAULT_BRANDING);
    }
}
