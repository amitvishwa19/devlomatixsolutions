// Local equivalent of edge action: publish_flow (create + upload JSON + publish).
import { graph, required, GRAPH } from "../_shared/meta";
import { resolveAccount } from "../_shared/credentials";

export async function publishFlow(payload) {
  const { account, token } = await resolveAccount(payload);
  const name = required(payload.name, "Flow name").slice(0, 200);
  const categories = Array.isArray(payload.categories) && payload.categories.length ? payload.categories : ["SIGN_UP"];
  const flowJson = payload.flow_json;
  if (!flowJson || typeof flowJson !== "object") throw new Error("flow_json is required");

  const created = await graph(`/${account.waba_id}/flows`, token, {
    method: "POST", body: JSON.stringify({ name, categories, endpoint_uri: undefined }),
  });
  const flowId = created?.id;
  if (!flowId) throw new Error(`Meta did not return a flow id: ${JSON.stringify(created)}`);

  const form = new FormData();
  form.append("name", "flow.json");
  form.append("asset_type", "FLOW_JSON");
  form.append("file", new Blob([JSON.stringify(flowJson)], { type: "application/json" }), "flow.json");
  const upload = await fetch(`${GRAPH}/${flowId}/assets`, {
    method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form,
  });
  const uploadData = await upload.json().catch(() => ({}));
  if (!upload.ok) {
    const err = new Error(`Flow created (${flowId}) but JSON upload failed: ${JSON.stringify(uploadData)}`);
    err.flow_id = flowId;
    throw err;
  }
  if (Array.isArray(uploadData?.validation_errors) && uploadData.validation_errors.length) {
    const err = new Error(`Flow JSON validation failed: ${JSON.stringify(uploadData.validation_errors)}`);
    err.flow_id = flowId;
    throw err;
  }

  let published = false;
  let publishError = null;
  try {
    await graph(`/${flowId}/publish`, token, { method: "POST" });
    published = true;
  } catch (e) {
    publishError = e instanceof Error ? e.message : String(e);
  }
  return { ok: true, flow_id: flowId, published, publish_error: publishError, upload: uploadData };
}