/**
 * Per-kind test logic. Two flavors:
 *  - "ping"  : cheap provider check, no side effects (preferred when possible)
 *  - "dryrun": run the actual node body once with the provided sample input
 *
 * Returns a structured result the UI can display inline.
 */
import { supabase } from "@/integrations/supabase/client";
import { resolveConfigSecrets } from "./node-credentials";

export type TestResult = {
  ok: boolean;
  mode: "ping" | "dryrun" | "skip";
  message: string;
  detail?: unknown;
  durationMs: number;
};

function timed<T>(fn: () => Promise<T>): Promise<{ value: T; durationMs: number }> {
  const t0 = performance.now();
  return fn().then((value) => ({ value, durationMs: Math.round(performance.now() - t0) }));
}

export async function testNode(
  kind: string | undefined,
  rawConfig: Record<string, unknown>,
  sampleInput: unknown,
): Promise<TestResult> {
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from(table as never) as any).select("*", { head: true, count: "exact" }).limit(1),
      );
      const v = value as { error: { message: string } | null; count: number | null };
      if (v.error) return res(false, "ping", v.error.message, durationMs);
      return res(true, "ping", `Reachable (${v.count ?? 0} row${v.count === 1 ? "" : "s"})`, durationMs);
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

function res(ok: boolean, mode: TestResult["mode"], message: string, durationMs: number, detail?: unknown): TestResult {
  return { ok, mode, message, durationMs, detail };
}
