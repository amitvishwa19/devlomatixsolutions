import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/options';
import { db } from '@/lib/db';
import * as cloudApi from '@/app/workspace/[workspaceId]/wa/_lib/whatsapp-cloud-api';
import { symmetricDecrypt } from '@/lib/encryption';

/**
 * POST /api/wa/templates/sync
 * Fetches message templates from Meta and synchronizes them with the local database.
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id && !session?.user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.userId || session.user.id;
    
    const body = await req.json();
    const { id } = body; // credential.id

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

    // 2. Decrypt Credentials
    let credContent = null;
    const stored = credential.credentials;
    if (typeof stored === 'string' && stored.includes(':')) {
      try {
        const decrypted = symmetricDecrypt(stored);
        credContent = JSON.parse(decrypted);
      } catch (e) {
        return NextResponse.json({ error: 'Failed to decrypt credentials' }, { status: 500 });
      }
    } else {
      credContent = typeof stored === 'string' ? JSON.parse(stored) : stored;
    }

    if (!credContent.accessToken || !credContent.wabaId) {
      return NextResponse.json({ error: 'Missing WABA ID or Access Token for template sync' }, { status: 400 });
    }

    // 3. Fetch from Meta
    const result = await cloudApi.fetchTemplates(credContent);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to fetch templates from Meta' }, { status: 502 });
    }

    const metaTemplates = result.data; // Array of templates
    let createdCount = 0;
    let updatedCount = 0;

    // 4. Synchronize with DB
    for (const mt of metaTemplates) {
      const components = mt.components || [];
      const bodyComp = components.find(c => c.type === 'BODY');
      const footerComp = components.find(c => c.type === 'FOOTER');
      const buttonsComp = components.find(c => c.type === 'BUTTONS');
      const headerComp = components.find(c => c.type === 'HEADER');

      const templateData = {
        userId,
        templateId: mt.id, // Meta ID
        name: mt.name,     // Unified name
        templateName: mt.name,
        approved: mt.status === 'APPROVED',
        status: mt.status,
        category: mt.category,
        language: mt.language,
        body: bodyComp?.text || '',
        footer: footerComp?.text || null,
        buttons: buttonsComp ? JSON.stringify(buttonsComp.buttons) : (mt.buttons ? JSON.stringify(mt.buttons) : null),
        metadata: {
           header: headerComp || null,
           raw: mt
        },
        platform: 'WHATSAPP_CLOUD',
        updatedAt: new Date()
      };

      try {
        // Find existing to determine if update or create
        const existing = await db.messageTemplate.findFirst({
          where: { userId, name: mt.name, platform: 'WHATSAPP_CLOUD' }
        });

        if (existing) {
          await db.messageTemplate.update({
            where: { id: existing.id },
            data: templateData
          });
          updatedCount++;
        } else {
          await db.messageTemplate.create({
            data: templateData
          });
          createdCount++;
        }
      } catch (upsertError) {
        console.error(`[WA_SYNC_UPSET_ERROR] for ${mt.name}:`, upsertError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sync complete: ${createdCount} imported, ${updatedCount} updated.`,
      stats: { created: createdCount, updated: updatedCount }
    });

  } catch (error) {
    console.error('[WA_TEMPLATE_SYNC_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
