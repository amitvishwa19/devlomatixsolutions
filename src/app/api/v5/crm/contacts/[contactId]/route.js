import { prisma } from "@/lib/prisma";
import { validateCrmUserToken } from "../../_lib/auth";
import { apiSuccess, apiError } from "../../_lib/response";

/**
 * GET /api/v5/crm/contacts/[contactId]
 */
export async function GET(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { contactId } = await params;

        const contact = await prisma.contact.findFirst({
            where: { id: contactId, workspaceId: auth.workspaceId },
            include: {
                account: true,
                deals: {
                    include: { stage: true, pipeline: true },
                    orderBy: { updatedAt: 'desc' }
                },
                crmActivities: {
                    include: {
                        user: { select: { id: true, displayName: true, avatar: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!contact) return apiError("Contact not found", 404);

        return apiSuccess(contact);
    } catch (error) {
        console.error("[API_CRM_GET_CONTACT_ERROR]", error);
        return apiError(error.message || "Failed to fetch contact", 500);
    }
}

/**
 * PATCH /api/v5/crm/contacts/[contactId]
 */
export async function PATCH(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { contactId } = await params;
        const body = await request.json();

        const existing = await prisma.contact.findFirst({
            where: { id: contactId, workspaceId: auth.workspaceId }
        });

        if (!existing) return apiError("Contact not found", 404);

        const updateData = {};
        if (body.name !== undefined) updateData.name = body.name.trim();
        if (body.phone !== undefined) updateData.phone = body.phone.replace(/[^0-9]/g, '');
        if (body.email !== undefined) updateData.email = body.email ? body.email.trim().toLowerCase() : null;
        if (body.title !== undefined) updateData.title = body.title ? body.title.trim() : null;
        if (body.type !== undefined) updateData.type = body.type;
        if (body.accountId !== undefined) updateData.accountId = body.accountId || null;
        if (body.address !== undefined) updateData.address = body.address || null;
        if (body.tags !== undefined) updateData.tags = Array.isArray(body.tags) ? body.tags : [];

        const updated = await prisma.contact.update({
            where: { id: contactId },
            data: updateData,
            include: { account: true }
        });

        return apiSuccess(updated, { message: "Contact updated successfully" });
    } catch (error) {
        console.error("[API_CRM_UPDATE_CONTACT_ERROR]", error);
        return apiError(error.message || "Failed to update contact", 500);
    }
}

/**
 * DELETE /api/v5/crm/contacts/[contactId]
 */
export async function DELETE(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { contactId } = await params;

        const existing = await prisma.contact.findFirst({
            where: { id: contactId, workspaceId: auth.workspaceId }
        });

        if (!existing) return apiError("Contact not found", 404);

        await prisma.contact.delete({ where: { id: contactId } });

        return apiSuccess({ id: contactId }, { message: "Contact deleted successfully" });
    } catch (error) {
        console.error("[API_CRM_DELETE_CONTACT_ERROR]", error);
        return apiError(error.message || "Failed to delete contact", 500);
    }
}
