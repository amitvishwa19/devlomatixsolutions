import { db } from "@/lib/db";
import { ROUTING_PRESETS } from "@/app/workspace/[workspaceId]/flowgenix/_lib/combo-router";
import { validateGatewayToken } from "@/app/workspace/[workspaceId]/flowgenix/_lib/gateway-auth";

export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-FlowGenix-Key',
        }
    });
}

export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const authHeader = req.headers.get("authorization") || req.headers.get("x-flowgenix-key") || "";

        // Validate API Key if provided
        let modelScope = "all";
        if (authHeader) {
            const authCheck = await validateGatewayToken(authHeader, workspaceId);
            if (!authCheck.valid) {
                return new Response(JSON.stringify({
                    error: {
                        message: authCheck.reason || "Unauthorized. Invalid FlowGenix Gateway token.",
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
            modelScope = authCheck.modelScope || "all";
        }

        // 1. Fetch DB configured models
        const dbModels = await db.agentModel.findMany({
            where: { workspaceId, isActive: true },
            select: { id: true, name: true, provider: true, label: true, createdAt: true }
        });

        // 2. Fetch custom combos directly from DB
        let customCombos = [];
        try {
            const config = await db.agentConfig.findFirst({
                where: { workspaceId, name: "workspace_combos_manifest" }
            });
            if (config?.systemPrompt) {
                const parsed = JSON.parse(config.systemPrompt);
                if (Array.isArray(parsed)) customCombos = parsed;
            }
        } catch {}

        let modelsList = [];

        // Add System Presets
        Object.keys(ROUTING_PRESETS).forEach(presetId => {
            modelsList.push({
                id: presetId,
                object: "model",
                created: Math.floor(Date.now() / 1000),
                owned_by: "flowgenix-gateway",
                permission: [],
                root: presetId,
                parent: null,
                type: "preset_combo"
            });
        });

        // Add Custom Combos
        customCombos.forEach(combo => {
            modelsList.push({
                id: combo.name,
                object: "model",
                created: Math.floor(Date.now() / 1000),
                owned_by: "custom-combo",
                permission: [],
                root: combo.name,
                parent: null,
                type: "custom_combo"
            });
        });

        // Add Configured Provider Models
        dbModels.forEach(m => {
            modelsList.push({
                id: `${m.provider}/${m.name}`,
                object: "model",
                created: Math.floor(new Date(m.createdAt).getTime() / 1000),
                owned_by: m.provider,
                permission: [],
                root: m.name,
                parent: null,
            });
        });

        // Apply model scoping if the key is restricted to a single model or combo
        if (modelScope && modelScope !== "all") {
            modelsList = modelsList.filter(m => m.id === modelScope || m.root === modelScope);
        }

        return new Response(JSON.stringify({
            object: "list",
            data: modelsList
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error("[FLOWGENIX_MODELS_LIST_ERROR]", error);
        return new Response(JSON.stringify({
            error: {
                message: error.message || "Failed to retrieve models list",
                type: "server_error"
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
