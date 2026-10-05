import { validateCrmUserToken } from "../../../_lib/auth";
import { apiSuccess, apiError } from "../../../_lib/response";
import { generateDealQuotationAction } from "@/app/workspace/[workspaceId]/crm/_actions/crm-invoice-actions";

/**
 * POST /api/v5/crm/deals/[dealId]/quotation
 * Body: { clientName, clientEmail, clientPhone, companyName, items, taxRate, discount, notes }
 */
export async function POST(request, { params }) {
    try {
        const auth = await validateCrmUserToken(request);
        if (!auth.authenticated) return apiError(auth.error, auth.status);

        const { dealId } = await params;
        const body = await request.json();

        const res = await generateDealQuotationAction(auth.workspaceId, dealId, body);

        if (!res.success) {
            return apiError(res.error || "Failed to generate quotation", 400);
        }

        return apiSuccess(res.data, { message: "Quotation created successfully" }, 201);
    } catch (error) {
        console.error("[API_CRM_QUOTATION_ERROR]", error);
        return apiError(error.message || "Failed to generate quotation", 500);
    }
}
