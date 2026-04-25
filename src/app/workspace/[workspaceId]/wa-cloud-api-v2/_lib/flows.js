// Local catalog of WhatsApp Flows the user has published in Meta Business Manager.
// Stored in localStorage so the Template editor can pick a Flow ID without typing it again.
const KEY = "wa_flows_catalog";

export function getFlows() {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter((f) => f && f.flow_id);
  } catch (_) {
    return [];
  }
}

export function saveFlows(list) {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(list));
  }
}

export function addFlow({ name, flow_id, screen, description, flow_json }) {
  const id = String(flow_id).replace(/[^0-9]/g, "");
  if (!id) throw new Error("Flow ID must be numeric");
  const list = getFlows();
  const next = [
    ...list.filter((f) => String(f.flow_id) !== id),
    {
      name: (name || "").trim() || `Flow ${id}`,
      flow_id: id,
      screen: (screen || "").trim() || "SIGNUP",
      description: (description || "").trim(),
      flow_json: flow_json || null,
      created_at: new Date().toISOString(),
    },
  ];
  saveFlows(next);
  return next;
}

export function removeFlow(flow_id) {
  const next = getFlows().filter((f) => String(f.flow_id) !== String(flow_id));
  saveFlows(next);
  return next;
}

export function isValidFlowId(value) {
  const v = String(value || "").trim();
  return /^[0-9]+$/.test(v) && Number(v) > 0;
}
