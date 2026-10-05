import crypto from "crypto";
import { NextResponse } from "next/server";
import * as cloudApi from "../../../../workspace/[workspaceId]/konnectx/_lib/whatsapp-cloud-api";

export const dynamic = "force-dynamic";

/**
 * Meta signs webhook deliveries with the app secret and sends the digest in
 * `X-Hub-Signature-256`. Without this check anyone who learns the callback URL
 * can inject fake inbound messages, delivery receipts and status updates.
 */
function verifySignature(rawBody, header) {
    const secret = process.env.META_APP_SECRET || process.env.WEBHOOK_APP_SECRET;
    if (!secret || !header || !header.startsWith("sha256=")) return false;

    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

    const given = header.slice("sha256=".length);
    const a = Buffer.from(given, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return false;

    return crypto.timingSafeEqual(a, b);
}

/** GET /api/v5/konnectx/webhook — Meta's one-time verification handshake. */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get("hub.mode");
        const token = searchParams.get("hub.verify_token");
        const challenge = searchParams.get("hub.challenge");

        const verifyToken =
            process.env.WEBHOOK_VERIFY_TOKEN || process.env.WA_WEBHOOK_VERIFY_TOKEN;

        // No configured token means no usable verification string. The previous
        // `|| 'devlomatix_wa_verify'` fallback shipped a publicly known value.
        if (!verifyToken) {
            return NextResponse.json(
                { error: "WEBHOOK_VERIFY_TOKEN is not configured" },
                { status: 503 }
            );
        }

        const result = cloudApi.verifyWebhook(
            { "hub.mode": mode, "hub.verify_token": token, "hub.challenge": challenge },
            verifyToken
        );

        if (result.success) {
            return new NextResponse(result.challenge, { status: 200 });
        }

        return NextResponse.json({ error: result.error }, { status: 403 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/** POST /api/v5/konnectx/webhook — signed event delivery. */
export async function POST(request) {
    try {
        // The raw body is required for the HMAC; parse it from the text.
        const rawBody = await request.text();

        const signature =
            request.headers.get("x-hub-signature-256") ||
            request.headers.get("x-hub-signature");

        if (!verifySignature(rawBody, signature)) {
            console.warn("[WEBHOOK] Rejected delivery with an invalid or missing signature");
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        let body;
        try {
            body = JSON.parse(rawBody);
        } catch {
            return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
        }

        const parsed = cloudApi.parseIncomingMessage(body);
        if (!parsed) {
            return NextResponse.json({ status: "ignored" });
        }

        console.log("[WEBHOOK] Incoming message:", parsed);

        return NextResponse.json({ status: "received" });
    } catch (error) {
        console.error("[WEBHOOK] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}