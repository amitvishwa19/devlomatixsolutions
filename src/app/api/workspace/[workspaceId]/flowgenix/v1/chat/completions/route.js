import { executeGatewayRequest } from "@/app/workspace/[workspaceId]/flowgenix/_lib/combo-router";

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

        // Extract authorization header or query token
        const authHeader = req.headers.get("authorization") || "";
        const token = authHeader.replace(/^Bearer\s+/i, "").trim();

        // Optional: Can validate token or allow direct workspace context access
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
                    type: "gateway_error",
                    code: "all_targets_exhausted",
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
                'X-FlowGenix-Resolved-Provider': result.resolvedProvider || '',
                'X-FlowGenix-Resolved-Model': result.resolvedModel || '',
                'X-FlowGenix-Latency-Ms': String(result.latencyMs || 0)
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
