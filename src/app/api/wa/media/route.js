import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { symmetricDecrypt } from "@/lib/encryption";
import { ensureWorkspaceAccess } from "@/lib/auth-utils";

/**
 * GET /api/wa/media?mediaId=...&workspaceId=...
 * Proxies media from Meta Cloud API to the browser with authentication.
 */
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const mediaId = searchParams.get("mediaId");
        const workspaceId = searchParams.get("workspaceId");

        if (!mediaId || !workspaceId) {
            return new Response("Missing parameters", { status: 400 });
        }

        // 1. Verify access and get user session
        const session = await ensureWorkspaceAccess(workspaceId);
        const userId = session.user.userId || session.user.id;

        // 2. Get WhatsApp Credentials for this workspace/user
        const credentials = await db.credentials.findFirst({
            where: { userId, platform: 'WHATSAPP_CLOUD' }
        });

        if (!credentials) {
            return new Response("No WhatsApp credentials found", { status: 404 });
        }

        let cloudCreds = null;
        const stored = credentials.credentials;
        if (typeof stored === 'string' && stored.includes(':')) {
            cloudCreds = JSON.parse(symmetricDecrypt(stored));
        } else if (typeof stored === 'string') {
            cloudCreds = JSON.parse(stored);
        } else { cloudCreds = stored; }

        if (cloudCreds?.enc) {
            cloudCreds = JSON.parse(symmetricDecrypt(cloudCreds.enc));
        }

        const accessToken = cloudCreds?.accessToken || cloudCreds?.access_token;
        if (!accessToken) {
            return new Response("Invalid credentials", { status: 401 });
        }

        // 3. Fetch the actual Media URL from Meta
        const metaUrl = `https://graph.facebook.com/v21.0/${mediaId}`;
        const metaRes = await fetch(metaUrl, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        const metaData = await metaRes.json();
        if (!metaData.url) {
            console.error("[MediaProxy] Failed to get URL from Meta:", metaData);
            return new Response("Failed to retrieve media from Meta", { status: 502 });
        }

        // 4. Fetch the file content from the retrieved Meta URL
        const fileRes = await fetch(metaData.url, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!fileRes.ok) {
            return new Response("Failed to fetch file from Meta storage", { status: 502 });
        }

        // 5. Stream the response back to the client
        const contentType = fileRes.headers.get("content-type") || "application/octet-stream";
        const contentSize = fileRes.headers.get("content-length");

        const headers = new Headers();
        headers.set("Content-Type", contentType);
        if (contentSize) headers.set("Content-Length", contentSize);
        headers.set("Cache-Control", "public, max-age=3600"); // Cache for 1 hour

        return new Response(fileRes.body, { headers });

    } catch (error) {
        console.error("[MediaProxy Error]", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
