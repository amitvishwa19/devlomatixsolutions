import { decrypt } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * POST /api/v5/auth/logout
 * Clears activeSession from the database for the authenticated user upon logout.
 */
export async function POST(req) {
    try {
        let bodyPayload = {};
        try {
            bodyPayload = await req.json();
        } catch (_) {}

        let accessToken = req?.headers?.get('Authorization') || req?.headers?.get('authorization');
        if (!accessToken) {
            accessToken = bodyPayload?.token || bodyPayload?.accessToken;
        }

        if (accessToken && typeof accessToken === 'string' && accessToken.startsWith('Bearer ')) {
            accessToken = accessToken.slice(7);
        }

        if (accessToken) {
            const decoded = await decrypt(accessToken);
            const userId = decoded?.userId || decoded?.id;
            if (userId) {
                await db.user.update({
                    where: { id: userId },
                    data: { activeSession: null }
                }).catch((err) => {
                    console.warn('[AUTH_LOGOUT_DB_UPDATE_FAILED]', err?.message);
                });
            }
        }

        return NextResponse.json(
            { success: true, message: "Logged out successfully and session terminated" },
            { status: 200 }
        );
    } catch (error) {
        console.warn('[AUTH_LOGOUT_ERROR]', error?.message);
        return NextResponse.json({ success: true }, { status: 200 });
    }
}
