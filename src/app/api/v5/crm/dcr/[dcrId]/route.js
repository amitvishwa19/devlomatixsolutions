import { prisma } from "@/lib/prisma";
import { validateCrmUserToken } from "../../_lib/auth";
import { apiSuccess, apiError } from "../../_lib/response";
import { updateDcrRecordAction, deleteDcrRecordAction } from "@/app/workspace/[workspaceId]/crm/_actions/dcr-actions";

/**
 * GET /api/v5/crm/dcr/[dcrId]
 * Fetch a single DCR record
 */
export async function GET(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status || 401);

        const { dcrId } = await params;
        const record = await prisma.crmActivity.findFirst({
            where: { id: dcrId, workspaceId: auth.workspaceId },
            include: {
                user: { select: { id: true, displayName: true, email: true, avatar: true } },
                contact: { select: { id: true, name: true, phone: true, email: true, title: true } },
                account: { select: { id: true, name: true, phone: true, email: true } },
                deal: { select: { id: true, title: true, value: true, currency: true } }
            }
        });

        if (!record) return apiError("DCR record not found", 404);

        const meta = (typeof record.metadata === 'object' && record.metadata) ? record.metadata : {};
        const enriched = {
            id: record.id,
            title: record.title,
            description: record.description || '',
            type: record.type,
            createdAt: record.createdAt,
            userId: record.userId,
            user: record.user,
            clientName: meta.clientName || record.account?.name || record.contact?.name || 'Client',
            contactPerson: meta.contactPerson || record.contact?.name || '',
            phone: meta.phone || record.contact?.phone || '',
            email: meta.email || record.contact?.email || '',
            callType: meta.callType || record.type || 'PHONE_CALL',
            callPurpose: meta.callPurpose || meta.purpose || record.title || 'Discussion',
            outcome: meta.outcome || 'FOLLOWUP_SCHEDULED',
            nextFollowUpDate: meta.nextFollowUpDate || null,
            nextFollowUpAction: meta.nextFollowUpAction || '',
            dealValue: meta.dealValue ? parseFloat(meta.dealValue) : (record.deal?.value ? parseFloat(record.deal.value) : 0),
            location: meta.location || '',
            geolocation: meta.geolocation || null,
            images: Array.isArray(meta.images) ? meta.images : (meta.images ? [meta.images] : []),
            durationMinutes: meta.durationMinutes ? parseInt(meta.durationMinutes) : 15,
            objections: meta.objections || '',
            rawMetadata: meta,
            contact: record.contact,
            account: record.account,
            deal: record.deal
        };

        return apiSuccess(enriched);
    } catch (err) {
        console.error("[API_CRM_GET_DCR_ERROR]", err);
        return apiError(err.message || "Failed to fetch DCR record", 500);
    }
}

/**
 * PATCH /api/v5/crm/dcr/[dcrId]
 * Update a DCR record
 */
export async function PATCH(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status || 401);

        const { dcrId } = await params;
        const body = await request.json();

        // Normalize latitude / longitude to geolocation object if sent flat
        if ((body.latitude !== undefined || body.longitude !== undefined) && !body.geolocation) {
            body.geolocation = {
                latitude: body.latitude,
                longitude: body.longitude,
                capturedAt: new Date().toISOString()
            };
        }

        const res = await updateDcrRecordAction(auth.workspaceId, dcrId, body);
        if (!res.success) {
            return apiError(res.error || "Failed to update DCR record", 400);
        }

        return apiSuccess(res.data, { message: "DCR record updated successfully" });
    } catch (err) {
        console.error("[API_CRM_PATCH_DCR_ERROR]", err);
        return apiError(err.message || "Failed to update DCR record", 500);
    }
}

/**
 * DELETE /api/v5/crm/dcr/[dcrId]
 * Delete a DCR record
 */
export async function DELETE(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status || 401);

        const { dcrId } = await params;
        const res = await deleteDcrRecordAction(auth.workspaceId, dcrId);
        if (!res.success) {
            return apiError(res.error || "Failed to delete DCR record", 400);
        }

        return apiSuccess({ id: dcrId }, { message: "DCR record deleted successfully" });
    } catch (err) {
        console.error("[API_CRM_DELETE_DCR_ERROR]", err);
        return apiError(err.message || "Failed to delete DCR record", 500);
    }
}
