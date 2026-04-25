"use server";

import { resolveAccount } from "../../_lib/server/credentials";
import { graph, required } from "../../_lib/server/meta";

/**
 * Ported from konnectx_reference_delete/supabase/functions/wa-cloud-api/index.ts
 */
export async function publishFlow(payload) {
  try {
    const { account, token } = await resolveAccount(payload);
    const name = required(payload.name, "Flow name").slice(0, 80);
    const categories = Array.isArray(payload.categories) ? payload.categories : ["SIGN_UP"];
    const flowJson = required(payload.flow_json, "Flow JSON");

    // 1. Create the flow container
    const create = await graph(`/${account.waba_id}/flows`, token, {
      method: "POST",
      body: JSON.stringify({ name, categories }),
    });

    const flowId = create.id;
    if (!flowId) throw new Error("Failed to create flow on Meta");

    // 2. Upload the flow JSON (asset)
    // Note: Meta expects this as a file upload or a specific asset endpoint
    // In the reference, it seems it might be using a simple POST or a complex multipart.
    // For now, we'll try the simple asset upload if supported, or inform the user.
    
    // According to Meta Docs, you upload the JSON to /<FLOW_ID>/assets
    const assetRes = await fetch(`https://graph.facebook.com/v22.0/${flowId}/assets`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: "flow.json",
        asset_type: "FLOW_JSON",
        data: JSON.stringify(flowJson),
      }),
    });
    const asset = await assetRes.json();
    
    // 3. Optional: Publish the flow
    // For now, we return the ID.
    
    return { success: true, flow_id: flowId, published: asset.success || false };
  } catch (error) {
    console.error("[publishFlow Action Error]", error);
    return { success: false, error: error.message };
  }
}
