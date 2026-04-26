'use client';

import { useState, useEffect } from "react";
import { Key, Plus, ExternalLink } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { listCredentials } from "../../_actions/credentials/actions";

export const NODE_CREDENTIAL_TYPES = {
  http: ["generic", "oauth2", "jwt"],
  slack: ["slack"],
  discord: ["discord"],
  telegram: ["telegram"],
  email: ["smtp", "sendgrid", "generic"],
  "email-trigger": ["smtp", "generic"],
  database: ["postgres", "mysql", "generic"],
  postgres: ["postgres", "generic"],
  mysql: ["mysql", "generic"],
  redis: ["redis", "generic"],
  "google-sheets": ["google", "generic"],
  "google-calendar": ["google", "generic"],
  "google-drive": ["google", "generic"],
  "ai-agent": ["openai", "anthropic", "google-ai", "generic"],
  openai: ["openai", "generic"],
  anthropic: ["anthropic", "generic"],
  "google-ai": ["google-ai", "generic"],
  groq: ["groq", "generic"],
  huggingface: ["huggingface", "generic"],
  github: ["github", "generic"],
  notion: ["notion", "generic"],
  airtable: ["airtable", "generic"],
  jira: ["jira", "generic"],
  trello: ["trello", "generic"],
  twilio: ["twilio", "generic"],
  s3: ["aws", "generic"],
  pinecone: ["pinecone", "generic"],
  "openai-embeddings": ["openai", "generic"],
  "cohere-embeddings": ["cohere", "generic"],
  "google-embeddings": ["google-ai", "generic"],
  "google-analytics": ["google", "generic"],
  segment: ["segment", "generic"],
};

export default function CredentialSelector({ value, onChange, types, label = "Credential" }) {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await listCredentials(workspaceId);
        // Filter by types if needed
        const filtered = types 
          ? data.filter(c => types.includes(c.type))
          : data;
        setCredentials(filtered || []);
      } catch (error) {
        console.error("Failed to fetch credentials:", error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [workspaceId, types?.join(",")]);

  return (
    <div>
      <label className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Key className="h-3 w-3" />
        {label}
      </label>
      <div className="flex gap-1.5 mt-1">
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground"
          disabled={loading}
        >
          <option value="">
            {loading ? "Loading..." : credentials.length === 0 ? "No credentials found" : "— Select credential —"}
          </option>
          {credentials.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.type})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => router.push(`/workspace/${workspaceId}/flowgenix?tab=credentials`)}
          className="px-2 py-1.5 border border-border rounded-md bg-background hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title="Manage credentials"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
