import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/options';
import { db } from '@/lib/db';
import { symmetricDecrypt } from '@/lib/encryption';

/**
 * GET /api/wa/credentials/token
 * Returns the full decrypted credential fields for the default (or first) account.
 * Used to pre-fill all inputs in the Meta Cloud API test panel.
 */
export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id && !session?.user?.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.userId || session.user.id;

    // Prefer default account, fallback to first
    const cred = await db.credentials.findFirst({
        where: { userId, platform: 'WHATSAPP_CLOUD' },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });

    if (!cred) {
        return NextResponse.json({ error: 'No credentials found' }, { status: 404 });
    }

    let stored = cred.credentials;
    if (typeof stored === 'string' && stored.includes(':')) {
        try {
            const decrypted = symmetricDecrypt(stored);
            stored = JSON.parse(decrypted);
        } catch (e) {
            return NextResponse.json({ error: 'Failed to decrypt credentials' }, { status: 500 });
        }
    }

    return NextResponse.json({
        accessToken:   stored?.accessToken   || '',
        phoneNumberId: stored?.phoneNumberId || '',
        wabaId:        stored?.wabaId        || '',
        profile:       cred.profile          || 'Default Account',
        isDefault:     cred.isDefault,
    });
}
