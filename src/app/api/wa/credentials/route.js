import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
import { db } from '@/lib/db';
import { symmetricEncrypt, symmetricDecrypt } from '@/lib/encryption';

/**
 * GET credentials for the current user.
 * Returns masked access token and ids.
 */
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id && !session?.user?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.userId || session.user.id;
  const cred = await db.credentials.findFirst({
    where: { userId, platform: 'WHATSAPP_CLOUD' },
    orderBy: { updatedAt: 'desc' },
  });
  if (!cred) {
    return NextResponse.json({ data: null }, { status: 200 });
  }
  let stored = cred.credentials;
  if (typeof stored === 'string' && stored.includes(':')) {
    try {
      const decrypted = symmetricDecrypt(stored);
      stored = JSON.parse(decrypted);
    } catch (e) {
      console.error('Failed to decrypt credentials', e);
    }
  }
  const mask = (str) => (str ? str.slice(0, 4) + '****' + str.slice(-4) : '');
  const response = {
    phoneNumberId: stored?.phoneNumberId || '',
    wabaId: stored?.wabaId || '',
    accessToken: mask(stored?.accessToken || ''),
  };
  return NextResponse.json({ data: response }, { status: 200 });
}

/**
 * POST saves or updates credentials.
 * Expected body: { phoneNumberId, wabaId, accessToken }
 */
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id && !session?.user?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.userId || session.user.id;
  const body = await req.json();
  const { phoneNumberId, wabaId, accessToken } = body;
  if (!phoneNumberId || !wabaId || !accessToken) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }
  const payload = { phoneNumberId, wabaId, accessToken };
  const encrypted = symmetricEncrypt(JSON.stringify(payload));
  await db.credentials.upsert({
    where: { userId_platform: { userId, platform: 'WHATSAPP_CLOUD' } },
    update: { credentials: encrypted },
    create: { userId, platform: 'WHATSAPP_CLOUD', credentials: encrypted },
  });
  return NextResponse.json({ success: true }, { status: 200 });
}
