import { executeGatewayRequest } from "@/app/workspace/[workspaceId]/flowgenix/_lib/combo-router";
import { validateGatewayToken } from "@/app/workspace/[workspaceId]/flowgenix/_lib/gateway-auth";

// Standard CORS options handler
export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-FlowGenix-Key',
        }
    });
}

export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;

        // Extract authorization header (Authorization: Bearer <token> or X-FlowGenix-Key)
        const authHeader = req.headers.get("authorization") || req.headers.get("x-flowgenix-key") || "";

        const body = await req.json();
        const {
            model = "auto",
            messages = [],
            stream = false,
            temperature,
            max_tokens,
            top_p,
            frequency_penalty,
            presence_penalty,
            ...rest
        } = body;

        // Validate Bearer or X-FlowGenix-Key token against active workspace keys
        const authCheck = await validateGatewayToken(authHeader, workspaceId, model);
        if (!authCheck.valid) {
            return new Response(JSON.stringify({
                error: {
                    message: authCheck.reason || "Unauthorized. Invalid or missing FlowGenix Gateway token.",
                    type: "authentication_error",
                    code: "invalid_api_key"
                }
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return new Response(JSON.stringify({
                error: {
                    message: "Invalid payload: 'messages' array is required and cannot be empty.",
                    type: "invalid_request_error",
                    code: "missing_required_parameter"
                }
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        const result = await executeGatewayRequest({
            workspaceId,
            keyId: authCheck.keyId || null,
            keyLabel: authCheck.label || "Gateway Key",
            keyCap: authCheck.spendCap ?? null,
            model,
            messages,
            stream: Boolean(stream),
            temperature,
            max_tokens,
            top_p,
            frequency_penalty,
            presence_penalty,
            ...rest
        });

        if (!result.success) {
            return new Response(JSON.stringify({
                error: {
                    message: result.error || "FlowGenix upstream resolution failed.",
                    type: result.status === 402 ? "spend_guard_error" : "gateway_error",
                    code: result.details?.code || "all_targets_exhausted",
                    details: result.details
                }
            }), {
                status: result.status || 502,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        const upstreamResponse = result.response;

        return new Response(upstreamResponse.body, {
            status: upstreamResponse.status,
            headers: {
                'Content-Type': upstreamResponse.headers.get('Content-Type') || (stream ? 'text/event-stream' : 'application/json'),
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'X-FlowGenix-Cache': result.isCached ? 'HIT' : 'MISS',
                'X-FlowGenix-Resolved-Provider': result.resolvedProvider || '',
                'X-FlowGenix-Resolved-Model': result.resolvedModel || '',
                'X-FlowGenix-Latency-Ms': String(result.latencyMs || 0),
                'X-FlowGenix-Spend-Guard': result.isDowngradedToFree ? 'Downgraded-To-Free-Tier' : 'Normal'
            }
        });

    } catch (error) {
        console.error("[FLOWGENIX_OPENAI_COMPAT_ERROR]", error);
        return new Response(JSON.stringify({
            error: {
                message: error.message || "Internal Gateway Error",
                type: "server_error",
                code: "internal_error"
            }
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}
