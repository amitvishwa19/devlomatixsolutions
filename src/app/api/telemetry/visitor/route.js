import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";

// Helper to parse User-Agent
function parseUserAgent(uaString = "") {
    let browser = "Unknown Browser";
    let os = "Unknown OS";
    let device = "Desktop";

    const ua = uaString.toLowerCase();

    // Device
    if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) {
        device = "Mobile";
    } else if (/ipad|tablet|android(?!.*mobile)/i.test(ua)) {
        device = "Tablet";
    }

    // OS
    if (ua.includes("win")) os = "Windows";
    else if (ua.includes("mac")) os = "macOS";
    else if (ua.includes("linux")) os = "Linux";
    else if (ua.includes("android")) os = "Android";
    else if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) os = "iOS";

    // Browser
    if (ua.includes("edg/")) browser = "Edge";
    else if (ua.includes("chrome") && !ua.includes("edg/")) browser = "Chrome";
    else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
    else if (ua.includes("firefox")) browser = "Firefox";
    else if (ua.includes("opera") || ua.includes("opr/")) browser = "Opera";

    return { browser, os, device };
}

// Fallback IP Geolocation for local/self-hosted
async function resolveIpLocation(ip) {
    if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
        return {
            country: "Local / Development",
            countryCode: "LOCAL",
            city: "Localhost",
            region: "Local",
            latitude: 0,
            longitude: 0
        };
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);
        const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,lat,lon`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
            const data = await res.json();
            if (data.status === "success") {
                return {
                    country: data.country || "Unknown",
                    countryCode: data.countryCode || "UN",
                    city: data.city || "Unknown",
                    region: data.regionName || "Unknown",
                    latitude: data.lat || 0,
                    longitude: data.lon || 0
                };
            }
        }
    } catch (e) {
        // Fallback silently if ip-api is unreachable
    }

    return {
        country: "Unknown",
        countryCode: "UN",
        city: "Unknown",
        region: "Unknown",
        latitude: 0,
        longitude: 0
    };
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { workspaceId, pathname, title, referrer, screenWidth, screenHeight, sessionId, duration } = body || {};

        if (!pathname) {
            return NextResponse.json({ message: "Pathname is required" }, { status: 400 });
        }

        // Check if visitor telemetry logging is disabled
        if (workspaceId) {
            const wsSettings = await prisma.appSettings.findUnique({
                where: { key: workspaceId }
            });
            if (wsSettings?.privacy && wsSettings.privacy.visitorLoggingEnabled === false) {
                return NextResponse.json({ success: true, disabled: true, message: "Visitor logging disabled" });
            }
        }
        const appGeneral = await prisma.appSettings.findUnique({
            where: { key: 'APP_GENERAL' }
        });
        if (appGeneral?.privacy && appGeneral.privacy.visitorLoggingEnabled === false) {
            return NextResponse.json({ success: true, disabled: true, message: "Global visitor logging disabled" });
        }

        // Extract IP & Headers
        const forwardedFor = req.headers.get("x-forwarded-for");
        const realIp = req.headers.get("x-real-ip");
        const cfIp = req.headers.get("cf-connecting-ip");
        const rawIp = cfIp || (forwardedFor ? forwardedFor.split(",")[0].trim() : realIp) || "127.0.0.1";

        const userAgentStr = req.headers.get("user-agent") || "";
        const { browser, os, device } = parseUserAgent(userAgentStr);

        // Header-based Geo (Vercel/Cloudflare) or Fallback Lookup
        let country = req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry");
        let city = req.headers.get("x-vercel-ip-city");
        let region = req.headers.get("x-vercel-ip-country-region");
        let countryCode = country ? country.toUpperCase() : null;
        let latitude = parseFloat(req.headers.get("x-vercel-ip-latitude") || "0");
        let longitude = parseFloat(req.headers.get("x-vercel-ip-longitude") || "0");

        if (!country || country === "XX") {
            const geo = await resolveIpLocation(rawIp);
            country = geo.country;
            countryCode = geo.countryCode;
            city = geo.city;
            region = geo.region;
            latitude = geo.latitude;
            longitude = geo.longitude;
        }

        // Save telemetry record to Database
        const log = await prisma.visitorLog.create({
            data: {
                workspaceId: workspaceId || null,
                sessionId: sessionId || null,
                ipAddress: rawIp,
                userAgent: userAgentStr,
                browser,
                os,
                device,
                country,
                countryCode,
                city,
                region,
                latitude,
                longitude,
                path: pathname,
                fullUrl: req.headers.get("referer") || pathname,
                referrer: referrer || null,
                title: title || null,
                duration: duration ? parseInt(duration) : null,
                metadata: {
                    screenWidth: screenWidth || null,
                    screenHeight: screenHeight || null
                }
            }
        });

        return NextResponse.json({ success: true, id: log.id });
    } catch (error) {
        console.error("POST Telemetry Visitor Error:", error);
        return NextResponse.json({ message: "Failed to record visitor telemetry" }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        let id, duration;
        const contentType = req.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            const body = await req.json();
            id = body.id;
            duration = body.duration;
        } else {
            const text = await req.text();
            const body = JSON.parse(text || "{}");
            id = body.id;
            duration = body.duration;
        }

        if (!id || duration === undefined) {
            return NextResponse.json({ message: "ID and duration are required" }, { status: 400 });
        }

        await prisma.visitorLog.update({
            where: { id },
            data: { duration: parseInt(duration) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PATCH Telemetry Visitor Error:", error);
        return NextResponse.json({ message: "Failed to update visitor duration" }, { status: 500 });
    }
}
