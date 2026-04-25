// Local equivalent of edge action: upload_media.
import { supabase } from "@/integrations/supabase/client";
import { required, withRetry, GRAPH } from "../_shared/meta";
import { resolveAccount } from "../_shared/credentials";
import { logSendAttempts } from "../_shared/attempts";

export async function uploadMedia(payload) {
  const { account, token } = await resolveAccount(payload);
  const mime = required(payload.mime_type, "mime_type").slice(0, 120);
  const filename = (typeof payload.filename === "string" && payload.filename.trim()) ? payload.filename.trim().slice(0, 200) : "upload";
  const b64 = required(payload.file_base64, "file_base64");
  const cleaned = b64.includes(",") ? b64.split(",").pop() : b64;
  const binary = Uint8Array.from(atob(cleaned), (c) => c.charCodeAt(0));
  if (binary.byteLength > 16 * 1024 * 1024) {
    throw new Error("File too large. Meta limits images to 5MB, video to 16MB, documents to 100MB.");
  }
  const buildForm = () => {
    const form = new FormData();
    form.append("messaging_product", "whatsapp");
    form.append("type", mime);
    form.append("file", new Blob([binary], { type: mime }), filename);
    return form;
  };
  try {
    const { result, attempts } = await withRetry(async () => {
      const upload = await fetch(`${GRAPH}/${account.phone_number_id}/media`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: buildForm(),
      });
      const data = await upload.json().catch(() => ({}));
      return { ok: upload.ok && !!data?.id, status: upload.status, data };
    });
    await logSendAttempts(attempts, {
      stage: "upload", kind: "upload_media", phone_number_id: account.id,
      request_payload: { filename, mime_type: mime, size_bytes: binary.byteLength },
    });
    return { ok: true, media_id: result.id, mime_type: mime, filename, attempts: attempts.length };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const attempts = e?.attempts || [{ attempt_number: 1, status: "failed", http_status: null, latency_ms: 0, error_message: msg, response_payload: {} }];
    await logSendAttempts(attempts, {
      stage: "upload", kind: "upload_media", phone_number_id: account.id,
      request_payload: { filename, mime_type: mime, size_bytes: binary.byteLength },
    });
    throw e;
  }
}

export async function deleteMedia({ id }) {
  const { error } = await supabase.from("wa_media_assets").delete().eq("id", id);
  if (error) throw error;
  return { ok: true };
}