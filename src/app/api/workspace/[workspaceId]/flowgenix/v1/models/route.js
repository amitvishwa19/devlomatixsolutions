import { db } from "@/lib/db";
import { ROUTING_PRESETS } from "@/app/workspace/[workspaceId]/flowgenix/_lib/combo-router";
import { getCombosAction } from "@/app/workspace/[workspaceId]/flowgenix/_action/combo-actions";

export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    });
}

export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;

        // 1. Fetch DB configured models
        const dbModels = await db.agentModel.findMany({
            where: { workspaceId, isActive: true },
            select: { id: true, name: true, provider: true, label: true, createdAt: true }
        });

        // 2. Fetch custom combos
        const customCombosRes = await getCombosAction(workspaceId);
        const customCombos = customCombosRes.data || [];

        const modelsList = [];

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
                type: "provider_model"
            });
        });

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
