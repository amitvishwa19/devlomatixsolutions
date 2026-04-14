import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { waManager } from '@/app/workspace/[workspaceId]/wa/_lib/whatsapp-v2';

export async function POST(request, { params }) {
    try {
        const { id } = params;
        // Find campaign
        const campaign = await db.campaign.findUnique({
            where: { id: id },
            include: { recipients: { where: { status: 'PENDING' } } }
        });

        if (!campaign) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        if (campaign.recipients.length === 0) {
            return NextResponse.json({ error: 'No pending recipients to process' }, { status: 400 });
        }

        // Update campaign status
        await db.campaign.update({
            where: { id: id },
            data: { status: 'RUNNING' }
        });

        // Fire and forget processing to avoid blocking the HTTP request
        processCampaign(campaign.id, campaign.recipients, campaign.messageTemplate)
            .catch(err => console.error("Campaign background process error:", err));

        return NextResponse.json({ 
            success: true, 
            message: `Campaign execution started for ${campaign.recipients.length} recipients.`,
            campaignId: campaign.id 
        });

    } catch (error) {
        console.error('Failed to execute campaign:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Background processing function with anti-ban delays
async function processCampaign(campaignId, recipients, messageTemplate) {
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    for (const recipient of recipients) {
        let errorLog = null;
        let finalStatus = 'SENT';

        try {
            // Format phone number to JID
            let jid = recipient.phone.replace(/\D/g, '');
            if (!jid.endsWith('@s.whatsapp.net')) {
                jid = `${jid}@s.whatsapp.net`;
            }

            // Route standard text or interactive list formatting
            let sendPayload = {};
            if (typeof messageTemplate === 'string') {
                sendPayload.text = messageTemplate;
            } else if (messageTemplate?.text) {
                sendPayload.text = messageTemplate.text;
                if (messageTemplate.interactive) {
                    sendPayload.interactive = messageTemplate.interactive;
                }
            } else {
                sendPayload = messageTemplate;
            }

            // Dispatch via Baileys WhatsApp singleton
            await waManager.sendMessage(jid, sendPayload);

            // Wait 3 to 5 seconds between messages (Meta threshold)
            await delay(3000 + Math.random() * 2000);

        } catch (error) {
            finalStatus = 'FAILED';
            errorLog = error.message ? error.message.substring(0, 255) : 'Unknown Error';
        }

        // Update individual recipient status
        await db.campaignRecipient.update({
            where: { id: recipient.id },
            data: { 
                status: finalStatus,
                errorLog,
                sentAt: finalStatus === 'SENT' ? new Date() : null
            }
        });
    }

    // Mark entire campaign as completed
    await db.campaign.update({
        where: { id: campaignId },
        data: { status: 'COMPLETED' }
    });
}
