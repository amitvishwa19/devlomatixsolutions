import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/options';
import { db } from '@/lib/db';

/**
 * POST /api/wa/credentials/default
 * Sets a specific WhatsApp Cloud API credential as the default for the user.
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id && !session?.user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.userId || session.user.id;
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Credential ID is required' }, { status: 400 });
    }

    // 1. Verify existence and ownership
    const target = await db.credentials.findFirst({
      where: { id, userId, platform: 'WHATSAPP_CLOUD' }
    });

    if (!target) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }

    // 2. Transact: Unset all, Set one
    await db.$transaction([
      db.credentials.updateMany({
        where: { userId, platform: 'WHATSAPP_CLOUD' },
        data: { isDefault: false }
      }),
      db.credentials.update({
        where: { id },
        data: { isDefault: true }
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      message: `${target.profile || 'Account'} set as default.` 
    });

  } catch (error) {
    console.error('[WA_CREDENTIALS_DEFAULT_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
