import { supabase } from "@/lib/supabase";

/**
 * For each node kind, declare which config fields are sensitive.
 * Sensitive fields are stored separately (node_secrets table) and
 * the workflow JSON keeps only `__secretId`. Runtime resolves them
 * back into the config before executing the node.
 */
export const SECRET_FIELDS = {
  "util.slack": ["webhookUrl"],
  "util.http": ["headers"], // headers commonly contain Authorization
  "trigger.webhook": ["token"],
  // Email uses Resend connector → no secret in config.
  // Supabase nodes use the session → no secret in config.
};

/** Split a node config into (non-secret, secret) parts based on the kind. */
export function splitConfig(
  kind,
  config,
) {
  const fields = (kind && SECRET_FIELDS[kind]) ?? [];
  const plain = {};
  const secrets = {};
  for (const [k, v] of Object.entries(config)) {
    if (fields.includes(k) && v !== undefined && v !== "" && v !== null) {
      secrets[k] = v;
    } else {
      plain[k] = v;
    }
  }
  return { plain, secrets };
}

export function hasSecretFields(kind) {
  return Boolean(kind && (SECRET_FIELDS[kind]?.length ?? 0) > 0);
}

// ---------- CRUD ----------

export async function listCredentials(kind) {
  let q = supabase.from("node_credentials").select("*").order("updated_at", { ascending: false });
  if (kind) q = q.eq("kind", kind);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getSecret(secretId) {
  const { data, error } = await supabase
    .from("node_secrets")
    .select("*")
    .eq("id", secretId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function saveCredentialPreset(opts) {
  const { plain, secrets } = splitConfig(opts.kind, opts.config);
  let secretId = null;
  if (Object.keys(secrets).length > 0) {
    const { data: s, error: se } = await supabase
      .from("node_secrets")
      .insert({ kind: opts.kind, name: opts.name, secrets: secrets })
      .select("*")
      .single();
    if (se) throw se;
    secretId = s.id;
  }
  const { data, error } = await supabase
    .from("node_credentials")
    .insert({ kind: opts.kind, name: opts.name, config: plain, secret_id: secretId })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCredential(id) {
  const { data: cred } = await supabase.from("node_credentials").select("secret_id").eq("id", id).maybeSingle();
  const secretId = cred?.secret_id;
  const { error } = await supabase.from("node_credentials").delete().eq("id", id);
  if (error) throw error;
  if (secretId) await supabase.from("node_secrets").delete().eq("id", secretId);
}

/** Hydrate a saved preset into a fully-populated config object. */
export async function applyCredential(cred) {
  const merged = { ...cred.config };
  if (cred.secret_id) {
    const sec = await getSecret(cred.secret_id);
    if (sec) Object.assign(merged, sec.secrets);
    merged.__secretId = cred.secret_id;
  }
  return merged;
}

/**
 * Used by the workflow runtime: resolve any `__secretId` reference inside a
 * config to the actual sensitive values. Sensitive values themselves are
 * never persisted in the workflow JSON.
 */
export async function resolveConfigSecrets(
  config,
) {
  const secretId = config.__secretId;
  if (typeof secretId !== "string" || !secretId) return config;
  try {
    const sec = await getSecret(secretId);
    if (!sec) return config;
    return { ...config, ...sec.secrets };
  } catch {
    return config;
  }
}

/**
 * Strip ephemeral secret values from a config before saving the workflow.
 * Keeps `__secretId` reference if present; removes any inlined sensitive fields.
 */
export function stripSecretsForStorage(
  kind,
  config,
) {
  const fields = (kind && SECRET_FIELDS[kind]) ?? [];
  if (fields.length === 0) return config;
  const out = {};
  for (const [k, v] of Object.entries(config)) {
    if (fields.includes(k)) continue; // drop sensitive inline values
    out[k] = v;
  }
  return out;
}
