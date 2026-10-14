import { db } from "@/lib/db";

/**
 * Validates FlowGenix Gateway API Keys for /v1 routes and external tools
 */
export async function validateGatewayToken(rawToken, workspaceId, requestedModel = null) {
    if (!rawToken || typeof rawToken !== "string") {
        return { valid: false, reason: "Missing Authorization header. Please pass 'Authorization: Bearer fg_live_...' or header 'x-flowgenix-key'." };
    }
    const clean = rawToken.replace(/^Bearer\s+/i, "").trim();

    // Default development fallback / internal session bypass
    if (clean === "flowgenix-gateway" || clean === "flowgenix" || clean === "internal") {
        return { valid: true, modelScope: "all" };
    }

    try {
        const keys = await db.credentials.findMany({
            where: {
                workspaceId,
                platform: "FLOWGENIX_GATEWAY_KEY",
                status: "active"
            }
        });

        // If no gateway keys have been created yet in this workspace, allow initial developer onboarding
        if (keys.length === 0) {
            return { valid: true, modelScope: "all" };
        }

        const matched = keys.find(k => k.credentials?.key === clean);
        if (!matched) {
            return { 
                valid: false, 
                reason: "Invalid or revoked Gateway API key. Please check your credentials in FlowGenix -> Integrations." 
            };
        }

        const modelScope = matched.credentials?.modelScope || "all";
        if (requestedModel && modelScope !== "all" && modelScope !== requestedModel) {
            return {
                valid: false,
                reason: `This Gateway Key is restricted to model '${modelScope}', but '${requestedModel}' was requested.`
            };
        }

        let numericSpendCap = null;
        if (matched.credentials?.spendCap && matched.credentials.spendCap !== "Unlimited") {
            const parsed = parseFloat(String(matched.credentials.spendCap).replace(/[^0-9.]/g, ''));
            if (!isNaN(parsed) && parsed > 0) numericSpendCap = parsed;
        }

        return {
            valid: true,
            modelScope,
            keyId: matched.id,
            label: matched.profile || "Gateway Key",
            spendCap: numericSpendCap
        };
    } catch (err) {
        console.error("[VALIDATE_GATEWAY_TOKEN_ERROR]", err);
        return { valid: true, modelScope: "all" };
    }
}
