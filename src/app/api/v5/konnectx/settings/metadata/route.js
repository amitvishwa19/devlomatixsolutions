import { NextResponse } from "next/server";
import { requireUserId } from "../../_lib/helpers";

export const dynamic = "force-dynamic";

/**
 * GET / PATCH /api/v5/konnectx/settings/metadata
 *
 * There is no `WorkspaceMetadata` model in the Prisma schema, so the original
 * handler (`findUnique({})` with an empty argument list) threw on every call.
 * Reads now return an empty object instead of a 500, and writes fail loudly
 * rather than silently pretending to persist somewhere.
 */
export async function GET(request) {
    try {
        await requireUserId(request);
        return NextResponse.json({ data: { metadata: {} } });
    } catch (error) {
        if (error?.status) throw error;
        return NextResponse.json({ error: error.message || "Failed to fetch metadata" }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        await requireUserId(request);
        await request.json().catch(() => ({}));

        return NextResponse.json(
            {
                error:
                    "Workspace metadata storage is not configured. Persist these settings on the workspace or credential record instead."
            },
            { status: 501 }
        );
    } catch (error) {
        if (error?.status) throw error;
        return NextResponse.json({ error: error.message || "Failed to update metadata" }, { status: 500 });
    }
}