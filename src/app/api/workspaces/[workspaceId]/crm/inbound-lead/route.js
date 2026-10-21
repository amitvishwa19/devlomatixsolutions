import { NextResponse } from 'next/server';
import { ingestInboundLeadAction } from '@/app/workspace/[workspaceId]/crm/_actions/crm-inbound-lead-actions';

/**
 * Public/Authorized Inbound Webhook Endpoint for CRM Lead Capture
 * POST /api/workspaces/[workspaceId]/crm/inbound-lead
 */
export async function POST(request, context) {
    try {
        const params = await context.params;
        const workspaceId = params?.workspaceId;

        if (!workspaceId) {
            return NextResponse.json({ success: false, error: "Workspace ID is required" }, { status: 400 });
        }

        const body = await request.json().catch(() => ({}));

        // Normalize various common webhook schemas (Meta Lead Ads, Zapier, Typeform, Webflow)
        const name = body.name || body.full_name || body.fullName || `${body.first_name || ''} ${body.last_name || ''}`.trim();
        const phone = body.phone || body.phoneNumber || body.phone_number || body.mobile;
        const email = body.email || body.work_email || body.emailAddress;
        const companyName = body.company || body.company_name || body.companyName || body.organization;
        const source = body.source || body.utm_source || body.lead_source || "WEBHOOK_INBOUND";
        const notes = body.notes || body.message || body.inquiry || body.requirement || body.comment;
        const dealValue = parseFloat(body.dealValue || body.budget || body.value || 0);

        if (!name && !phone && !email) {
            return NextResponse.json({
                success: false,
                error: "Invalid payload. Provide at least name, phone, or email."
            }, { status: 422 });
        }

        const result = await ingestInboundLeadAction(workspaceId, {
            name,
            phone,
            email,
            companyName,
            source,
            dealTitle: body.dealTitle,
            dealValue,
            notes,
            tags: Array.isArray(body.tags) ? body.tags : ["WEBHOOK_LEAD"],
            pipelineId: body.pipelineId,
            stageId: body.stageId,
            autoWhatsAppWelcome: body.autoWhatsAppWelcome ?? true,
            customFields: {
                rawWebhookPayload: body,
                ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
            }
        });

        if (!result.success) {
            return NextResponse.json(result, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: "Inbound lead ingested successfully into CRM",
            data: result.data
        }, { status: 201 });
    } catch (error) {
        console.error("[INBOUND_LEAD_WEBHOOK_ERROR]", error);
        return NextResponse.json({
            success: false,
            error: error.message || "Failed to process inbound lead"
        }, { status: 500 });
    }
}
