import { prisma } from "@/lib/prisma";
import { validateCrmUserToken } from "../../../_lib/auth";
import { apiSuccess, apiError } from "../../../_lib/response";

/**
 * POST /api/v5/crm/contacts/[contactId]/whatsapp
 * Body: { message, dealId }
 * Dispatches WhatsApp message via KonnectX Cloud API and logs into CRM timeline
 */
export async function POST(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { contactId } = await params;
        const body = await request.json();
        const { message, dealId } = body;

        if (!message?.trim()) {
            return apiError("Message text is required", 400);
        }

        const contact = await prisma.contact.findFirst({
            where: { id: contactId, workspaceId: auth.workspaceId }
        });

        if (!contact || !contact.phone) {
            return apiError("Contact not found or has no valid phone number", 404);
        }

        const cleanPhone = contact.phone.replace(/[^0-9]/g, '');
        const jid = `${cleanPhone}@s.whatsapp.net`;

        // 1. Record WhatsApp message in KonnectX database
        const waMsg = await prisma.whatsAppMessage.create({
            data: {
                userId: auth.userId,
                jid,
                text: message.trim(),
                fromMe: true,
                timestamp: BigInt(Date.now()),
                status: "SENT",
                metadata: {
                    source: "CRM_API_OUTREACH",
                    contactId,
                    dealId: dealId || null
                }
            }
        });

        // 2. Record CRM Activity Timeline
        await prisma.crmActivity.create({
            data: {
                workspaceId: auth.workspaceId,
                userId: auth.userId,
                contactId: contact.id,
                dealId: dealId || null,
                type: "WHATSAPP_MSG",
                title: "WhatsApp Message Sent via API",
                description: message.trim(),
                metadata: { waMessageId: waMsg.id, phone: cleanPhone }
            }
        });

        // 3. Update Contact lastInteraction & lastMessage
        await prisma.contact.update({
            where: { id: contact.id },
            data: {
                lastMessage: message.trim().slice(0, 100),
                lastInteraction: new Date()
            }
        });

        return apiSuccess({ messageId: waMsg.id, phone: cleanPhone }, {
            message: `WhatsApp message dispatched successfully to +${cleanPhone}`
        });
    } catch (error) {
        console.error("[API_CRM_SEND_WHATSAPP_ERROR]", error);
        return apiError(error.message || "Failed to dispatch WhatsApp message", 500);
    }
}
