/**
 * Per-kind test logic. Two flavors:
 *  - "ping"  : cheap provider check, no side effects (preferred when possible)
 *  - "dryrun": run the actual node body once with the provided sample input
 *
 * Returns a structured result the UI can display inline.
 */
import { supabase } from "@/lib/supabase";
import { resolveConfigSecrets } from "./node-credentials";

function timed(fn) {
  const t0 = performance.now();
  return fn().then((value) => ({ value, durationMs: Math.round(performance.now() - t0) }));
}

export async function testNode(
  kind,
  rawConfig,
  sampleInput,
) {
  const cfg = await resolveConfigSecrets(rawConfig);

  // ---- pings (no side effects) ----
  if (kind === "util.slack") {
    const url = String(cfg.webhookUrl ?? "");
    if (!url) return res(false, "ping", "Slack webhook URL is empty", 0);
    if (!/^https:\/\/hooks\.slack\.com\//.test(url)) return res(false, "ping", "URL doesn't look like a Slack incoming webhook", 0);
    return res(true, "ping", "Webhook URL looks valid (no message sent)", 0);
  }

  if (kind === "util.http") {
    const url = String(cfg.url ?? "");
    if (!url) return res(false, "ping", "URL is empty", 0);
    try {
      const { value, durationMs } = await timed(async () => {
        const r = await fetch(url, { method: "HEAD" });
        return r.status;
      });
      return res(value < 500, "ping", `HEAD ${url} → ${value}`, durationMs);
    } catch (e) {
      return res(false, "ping", `Network error: ${e instanceof Error ? e.message : "unknown"}`, 0);
    }
  }

  if (kind === "util.supabase" || kind === "util.db") {
    const table = String(cfg.table ?? "");
    if (!table) return res(false, "ping", "Table name required", 0);
    try {
      const { value, durationMs } = await timed(async () =>
        await supabase.from(table).select("*", { head: true, count: "exact" }).limit(1),
      );
      if (value.error) return res(false, "ping", value.error.message, durationMs);
      return res(true, "ping", `Reachable (${value.count ?? 0} row${value.count === 1 ? "" : "s"})`, durationMs);
    } catch (e) {
      return res(false, "ping", e instanceof Error ? e.message : String(e), 0);
    }
  }

  if (kind === "util.email") {
    const to = String(cfg.to ?? "");
    const subject = String(cfg.subject ?? "");
    if (!to || !subject) return res(false, "ping", "'to' and 'subject' required to send", 0);
    return res(true, "ping", `Config OK — would send to ${to} (no email sent)`, 0);
  }

  if (kind === "trigger.webhook") {
    return res(true, "ping", "Webhook trigger — execute the workflow to test the URL.", 0);
  }

  if (kind === "trigger.manual" || kind === "trigger.chat") {
    return res(true, "ping", "Trigger node — no test needed.", 0);
  }

  // ---- dry-run for the rest (in-process) ----
  try {
    const { value, durationMs } = await timed(async () => {
      const { runNodeBodyStandalone } = await import("./workflow-runtime");
      return runNodeBodyStandalone(kind, cfg, sampleInput);
    });
    return res(true, "dryrun", "Executed once with sample input", durationMs, value);
  } catch (e) {
    return res(false, "dryrun", e instanceof Error ? e.message : String(e), 0);
  }
}

function res(ok, mode, message, durationMs, detail) {
  return { ok, mode, message, durationMs, detail };
}
