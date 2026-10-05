import { NextResponse } from "next/server";
import { requireUserId } from "../../_lib/helpers";
import * as cloudApi from "../../../../../workspace/[workspaceId]/konnectx/_lib/whatsapp-cloud-api";

export const dynamic = "force-dynamic";

/**
 * POST /api/v5/konnectx/credentials/test
 *
 * Verifies a Cloud API token against Meta. Previously reachable without
 * authentication, which turned it into a free oracle for probing tokens.
 */
export async function POST(request) {
    try {
        await requireUserId(request);
        const body = await request.json().catch(() => ({}));
        const { accessToken, phoneNumberId } = body;

        if (!accessToken || !phoneNumberId) {
            return NextResponse.json(
                { error: "accessToken and phoneNumberId are required" },
                { status: 400 }
            );
        }

        const result = await cloudApi.testCloudConnection({ accessToken, phoneNumberId });

        return NextResponse.json(result);
    } catch (error) {
        if (error?.status) throw error;
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}