import { NextResponse } from "next/server";
import { requireUserId } from "../../_lib/helpers";

export const dynamic = "force-dynamic";

/**
 * Hosts this endpoint is allowed to call.
 *
 * This route forwards a caller-supplied URL, headers, method and body to
 * whatever it is given. Unauthenticated that is an open proxy and an SSRF
 * primitive against anything the server can reach (cloud metadata endpoints,
 * internal services), so both authentication and a Meta-only host allowlist are
 * required.
 */
const ALLOWED_HOSTS = [
    "graph.facebook.com",
    "graph.facebook.net",
    "graph.instagram.com",
    "lookaside.fbsbx.com",
    "business.facebook.com",
    "graph.thread.net"
];

function isAllowed(url) {
    let parsed;
    try {
        parsed = new URL(url);
    } catch {
        return false;
    }

    if (parsed.protocol !== "https:") return false;

    const host = parsed.hostname.toLowerCase();
    return ALLOWED_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}

/** POST /api/v5/konnectx/credentials/meta-test — authenticated Graph probe. */
export async function POST(request) {
    try {
        await requireUserId(request);
        const body = await request.json().catch(() => ({}));

        const { url, method = "GET", payload } = body;

        if (!url) {
            return NextResponse.json({ error: "url is required" }, { status: 400 });
        }
        if (!isAllowed(url)) {
            return NextResponse.json(
                { error: `url must be an https Meta Graph endpoint (${ALLOWED_HOSTS.join(", ")})` },
                { status: 400 }
            );
        }

        // Caller-supplied headers used to be spread over the request, which let
        // a caller inject Host, Authorization or cookie headers. Only the
        // content type is accepted now.
        const fetchOptions = {
            method,
            headers: { "Content-Type": "application/json" }
        };

        if (payload && method !== "GET") {
            fetchOptions.body = JSON.stringify(payload);
        }

        const res = await fetch(url, fetchOptions);
        const data = await res.json().catch(() => ({}));

        return NextResponse.json({ success: res.ok, apiData: data, statusCode: res.status });
    } catch (error) {
        if (error?.status) throw error;
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}