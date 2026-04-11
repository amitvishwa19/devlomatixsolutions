import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/options';
import { db } from '@/lib/db';
import * as cloudApi from '@/app/workspace/[workspaceId]/wa/_lib/whatsapp-cloud-api';
import { symmetricDecrypt } from '@/lib/encryption';

/**
 * POST /api/wa/credentials/test
 * Tests the connection for a specific WhatsApp Cloud API credential set.
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

    // 1. Fetch credentials from DB
    const credential = await db.credentials.findFirst({
      where: { id, userId, platform: 'WHATSAPP_CLOUD' }
    });

    if (!credential || !credential.credentials) {
      return NextResponse.json({ error: 'Credentials not found' }, { status: 404 });
    }

    // 2. Decrypt and Parse Credentials
    let credContent = null;
    const stored = credential.credentials;

    if (typeof stored === 'string') {
      if (stored.includes(':')) {
        // Encypted format: iv:data
        try {
          const decrypted = symmetricDecrypt(stored);
          credContent = JSON.parse(decrypted);
        } catch (e) {
          console.error('[WA_TEST_DECRYPT_ERROR]', e);
          return NextResponse.json({ error: 'Failed to decrypt credentials' }, { status: 500 });
        }
      } else {
        // Might be plain JSON string (unencrypted - older format)
        try {
          credContent = JSON.parse(stored);
        } catch (e) {
          console.error('[WA_TEST_PARSE_ERROR]', e);
          return NextResponse.json({ error: 'Invalid credential format' }, { status: 400 });
        }
      }
    } else {
      credContent = stored;
    }

    if (!credContent || !credContent.accessToken || !credContent.phoneNumberId) {
      return NextResponse.json({ error: 'Incomplete credentials found' }, { status: 400 });
    }

    // 3. Perform the connection test
    const result = await cloudApi.testCloudConnection(credContent);

    if (result.success) {
      // Update status in DB if successful
      await db.credentials.update({
        where: { id },
        data: { status: 'connected' }
      });
      return NextResponse.json({ 
        success: true, 
        message: 'Connection verified successfully!',
        details: result.data 
      });
    } else {
      // Update status in DB as disconnected
      await db.credentials.update({
        where: { id },
        data: { status: 'disconnected' }
      });
      return NextResponse.json({ 
        success: false, 
        error: result.error || 'Connection failed' 
      }, { status: 422 });
    }

  } catch (error) {
    console.error('[WA_CRED_TEST_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
