import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { executeGatewayRequest } from "@/app/workspace/[workspaceId]/flowgenix/_lib/combo-router";

export async function POST(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.userId) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { 
                status: 401, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        const body = await req.json();
        const { model = "auto", messages = [], stream = true, compression = { rtk: true, caveman: true }, ...rest } = body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return new Response(JSON.stringify({ error: "Messages array is required" }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        // Execute dynamic gateway request with cascading failover and compression
        const result = await executeGatewayRequest({
            workspaceId,
            model,
            messages,
            stream,
            compression,
            ...rest
        });

        if (!result.success) {
            return new Response(JSON.stringify({ 
                error: result.error, 
                details: result.details 
            }), { 
                status: result.status || 502, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        const upstreamResponse = result.response;

        // Pass-through headers and streaming body
        return new Response(upstreamResponse.body, {
            status: upstreamResponse.status,
            headers: {
                'Content-Type': upstreamResponse.headers.get('Content-Type') || (stream ? 'text/event-stream' : 'application/json'),
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-FlowGenix-Resolved-Provider': result.resolvedProvider || '',
                'X-FlowGenix-Resolved-Model': result.resolvedModel || '',
                'X-FlowGenix-Latency-Ms': String(result.latencyMs || 0)
            }
        });

    } catch (error) {
        console.error("[FLOWGENIX_CHAT_ROUTER_ERROR]", error);
        return new Response(JSON.stringify({ error: error.message || "Internal Gateway Error" }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }
}
