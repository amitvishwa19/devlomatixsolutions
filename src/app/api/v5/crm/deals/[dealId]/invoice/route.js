import { validateCrmUserToken } from "../../../_lib/auth";
import { apiSuccess, apiError } from "../../../_lib/response";
import { convertDealToPayFlowInvoiceAction } from "@/app/workspace/[workspaceId]/crm/_actions/crm-invoice-actions";

/**
 * POST /api/v5/crm/deals/[dealId]/invoice
 * Body: { clientName, clientEmail, clientPhone, items, taxRate, notes, dueDays }
 */
export async function POST(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { dealId } = await params;
        const body = await request.json();

        const res = await convertDealToPayFlowInvoiceAction(auth.workspaceId, dealId, body);

        if (!res.success) {
            return apiError(res.error || "Failed to generate PayFlow invoice", 400);
        }

        return apiSuccess(res.data, { message: "PayFlow Invoice issued successfully" }, 201);
    } catch (error) {
        console.error("[API_CRM_INVOICE_ERROR]", error);
        return apiError(error.message || "Failed to issue invoice", 500);
    }
}
