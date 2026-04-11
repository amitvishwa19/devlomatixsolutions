import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
import { db } from '@/lib/db';
import { symmetricEncrypt, symmetricDecrypt } from '@/lib/encryption';

/**
 * GET credentials for the current user.
 * Returns an array of accounts with masked access tokens.
 */
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id && !session?.user?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.userId || session.user.id;

  const creds = await db.credentials.findMany({
    where: { userId, platform: 'WHATSAPP_CLOUD' },
    orderBy: { updatedAt: 'desc' },
  });

  const mask = (str) => (str ? str.slice(0, 4) + '****' + str.slice(-4) : '');

  const data = creds.map(cred => {
    let stored = cred.credentials;
    if (typeof stored === 'string' && stored.includes(':')) {
      try {
        const decrypted = symmetricDecrypt(stored);
        stored = JSON.parse(decrypted);
      } catch (e) {
        console.error('Failed to decrypt credentials', e);
      }
    }

    return {
      id: cred.id,
      profile: cred.profile || 'Default Account',
      phoneNumberId: stored?.phoneNumberId || '',
      wabaId: stored?.wabaId || '',
      accessToken: mask(stored?.accessToken || ''),
      updatedAt: cred.updatedAt
    };
  });

  return NextResponse.json({ data }, { status: 200 });
}

/**
 * POST saves or updates credentials.
 * Expected body: { id?, phoneNumberId, wabaId, accessToken, profile? }
 */
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id && !session?.user?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.userId || session.user.id;
  const body = await req.json();
  const { id, phoneNumberId, wabaId, accessToken, profile } = body;

  if (!phoneNumberId || !wabaId || !accessToken) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  const payload = { phoneNumberId, wabaId, accessToken };
  const encrypted = symmetricEncrypt(JSON.stringify(payload));

  if (id) {
    // Update existing
    await db.credentials.update({
      where: { id, userId },
      data: { 
        credentials: encrypted,
        profile: profile || 'Cloud Account',
        updatedAt: new Date()
      },
    });
  } else {
    // Create new
    await db.credentials.create({
      data: { 
        userId, 
        platform: 'WHATSAPP_CLOUD', 
        credentials: encrypted,
        profile: profile || 'Cloud Account',
        status: 'connected'
      },
    });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

/**
 * DELETE removes a specific credential set.
 * Expected query param: ?id=xxx
 */
export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id && !session?.user?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.userId || session.user.id;
  
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    await db.credentials.delete({
      where: { id, userId }
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete credential', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
