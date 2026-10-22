import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { decrypt } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(req) {
    try {
        let accessToken = req.headers?.get('Authorization') || req.headers?.get('authorization');
        if (!accessToken) {
            const headersList = await headers();
            accessToken = headersList.get('Authorization') || headersList.get('authorization');
        }

        const body = await req.json().catch(() => ({}));
        const { expoPushToken, deviceToken } = body;

        if (!accessToken && body.accessToken) {
            accessToken = body.accessToken;
        }

        if (!accessToken) {
            return NextResponse.json({ message: 'Unauthorized: missing authorization header', status: 401 }, { status: 401 });
        }

        const decoded = await decrypt(accessToken);
        const userId = decoded?.userId || decoded?.id;

        if (!userId) {
            return NextResponse.json({ message: 'Invalid or expired token', status: 401 }, { status: 401 });
        }

        const updateData = {};
        if (expoPushToken) updateData.expoPushToken = expoPushToken;
        if (deviceToken) updateData.deviceToken = deviceToken;

        if (Object.keys(updateData).length > 0) {
            await db.user.update({
                where: { id: userId },
                data: updateData,
            });
            console.log(`[PUSH_TOKEN_UPDATED] User ${userId} updated tokens:`, updateData);
        }

        return NextResponse.json({ status: 200, message: 'Push tokens updated successfully' });
    } catch (error) {
        console.error('[PUSH_TOKEN_UPDATE_ERROR]', error);
        return NextResponse.json({ message: 'Internal server error', status: 500 }, { status: 500 });
    }
}
