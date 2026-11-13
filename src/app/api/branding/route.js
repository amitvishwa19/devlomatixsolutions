import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_BRANDING = {
    primaryColor: "#3b82f6",
    logoUrl: "",
    logoLightUrl: "",
    logoDarkUrl: "",
    appName: "Devlomatix",
    appDescription: "Your Productivity Platform",
    showGoogleLogin: true,
};

export async function GET() {
    try {
        const globalSettings = await prisma.appSettings.findUnique({
            where: { key: 'global' }
        }).catch(() => null);

        const savedBranding = globalSettings?.social || globalSettings?.general || {};
        const branding = {
            ...DEFAULT_BRANDING,
            ...savedBranding,
            showGoogleLogin: savedBranding.showGoogleLogin !== undefined ? Boolean(savedBranding.showGoogleLogin) : true,
        };

        return NextResponse.json(branding);
    } catch (error) {
        console.error("GET Branding Error:", error);
        return NextResponse.json(DEFAULT_BRANDING);
    }
}
