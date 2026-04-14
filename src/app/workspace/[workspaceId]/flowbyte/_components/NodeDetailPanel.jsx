'use client'

import { memo, useState, useCallback } from "react";
import { Check, X, Copy, ChevronDown, ChevronRight, ArrowDownToLine, ArrowUpFromLine, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CredentialSelector from "./CredentialSelector";

function JsonBlock({ data, label }) {
  const [expanded, setExpanded] = useState(true);
  const json = JSON.stringify(data, null, 2);
  const copy = () => { navigator.clipboard.writeText(json); toast.success("Copied to clipboard"); };

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between px-3 py-2 bg-muted/50 hover:bg-muted transition-colors text-xs font-medium text-muted-foreground">
        <span className="flex items-center gap-1.5">
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          {label}
        </span>
        <span className="text-[10px] opacity-60">{Object.keys(data).length} fields</span>
      </button>
      {expanded && (
        <div className="relative">
          <Button variant="ghost" size="sm" className="absolute top-1 right-1 h-6 w-6 p-0 opacity-60 hover:opacity-100" onClick={copy}>
            <Copy className="h-3 w-3" />
          </Button>
          <pre className="p-3 text-xs font-mono text-foreground bg-background overflow-x-auto max-h-[200px] overflow-y-auto leading-relaxed">{json}</pre>
        </div>
      )}
    </div>
  );
}

// Config panels per node type
function HttpConfig({ config, onChange }) {
  return (
    <div className="space-y-3">
      <CredentialSelector
        value={config.credentialId}
        onChange={(id) => onChange({ ...config, credentialId: id })}
        type="http"
        label="Authentication"
      />
      <div>
        <label className="text-xs text-muted-foreground">Method</label>
        <select value={config.method || "GET"} onChange={(e) => onChange({ ...config, method: e.target.value })}
          className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground">
          <option value="GET">GET</option><option value="POST">POST</option><option value="PUT">PUT</option><option value="PATCH">PATCH</option><option value="DELETE">DELETE</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">URL</label>
        <input value={config.url || ""} onChange={(e) => onChange({ ...config, url: e.target.value })}
          placeholder="https://api.example.com/data" className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Body (JSON)</label>
        <textarea value={config.body || ""} onChange={(e) => onChange({ ...config, body: e.target.value })}
          placeholder='{"key": "value"}' rows={3} className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background font-mono text-foreground" />
      </div>
    </div>
  );
}

function CodeConfig({ config, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground">JavaScript Code</label>
        <textarea value={config.code || "return items;"} onChange={(e) => onChange({ ...config, code: e.target.value })}
          rows={8} className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background font-mono text-foreground" placeholder="return items;" />
      </div>
      <p className="text-[10px] text-muted-foreground">Use <code className="bg-muted px-1 rounded">items</code> for previous node output. <code className="bg-muted px-1 rounded">$input</code> for raw input.</p>
    </div>
  );
}

function IfConfig({ config, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground">Field</label>
        <input value={config.field || ""} onChange={(e) => onChange({ ...config, field: e.target.value })}
          placeholder="data.statusCode" className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Operator</label>
        <select value={config.operator || "equals"} onChange={(e) => onChange({ ...config, operator: e.target.value })}
          className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground">
          <option value="equals">Equals</option><option value="not_equals">Not Equals</option><option value="contains">Contains</option>
          <option value="greater_than">Greater Than</option><option value="less_than">Less Than</option>
          <option value="exists">Exists</option><option value="not_exists">Not Exists</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Value</label>
        <input value={config.value || ""} onChange={(e) => onChange({ ...config, value: e.target.value })}
          placeholder="200" className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground" />
      </div>
    </div>
  );
}

function SetConfig({ config, onChange }) {
  const assignments = config.assignments || [];
  const updateAssignment = (i, key, val) => {
    const updated = [...assignments];
    updated[i] = { ...updated[i], [key]: val };
    onChange({ ...config, assignments: updated });
  };
  const addAssignment = () => onChange({ ...config, assignments: [...assignments, { field: "", value: "" }] });
  const removeAssignment = (i) => onChange({ ...config, assignments: assignments.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-3">
      <label className="text-xs text-muted-foreground">Assignments</label>
      {assignments.map((a, i) => (
        <div key={i} className="flex gap-2 items-start">
          <div className="flex-1 space-y-1">
            <input value={a.field} onChange={(e) => updateAssignment(i, "field", e.target.value)}
              placeholder="fieldName" className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground" />
            <input value={a.value} onChange={(e) => updateAssignment(i, "value", e.target.value)}
              placeholder="value or {{$input.field}}" className="w-full px-2 py-1 text-xs border border-border rounded bg-background font-mono text-foreground" />
          </div>
          <button onClick={() => removeAssignment(i)} className="text-muted-foreground hover:text-destructive mt-1"><Trash2 className="h-3 w-3" /></button>
        </div>
      ))}
      <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={addAssignment}><Plus className="h-3 w-3" /> Add Field</Button>
    </div>
  );
}

function WaitConfig({ config, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground">Duration (seconds)</label>
        <input type="number" value={Number(config.duration) || 1} onChange={(e) => onChange({ ...config, duration: Number(e.target.value) })}
          min={1} max={60} className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground" />
      </div>
    </div>
  );
}

function SlackConfig({ config, onChange }) {
  return (
    <div className="space-y-3">
      <CredentialSelector
        value={config.credentialId}
        onChange={(id) => onChange({ ...config, credentialId: id })}
        type="slack"
        label="Slack Account"
      />
      <div>
        <label className="text-xs text-muted-foreground">Channel</label>
        <input value={config.channel || ""} onChange={(e) => onChange({ ...config, channel: e.target.value })}
          placeholder="#general" className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Message</label>
        <textarea value={config.text || ""} onChange={(e) => onChange({ ...config, text: e.target.value })}
          placeholder="Hello from workflow!" rows={3} className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground" />
      </div>
    </div>
  );
}

function EmailConfig({ config, onChange }) {
  return (
    <div className="space-y-3">
      <CredentialSelector
        value={config.credentialId}
        onChange={(id) => onChange({ ...config, credentialId: id })}
        type="email"
        label="Email Account"
      />
      <div>
        <label className="text-xs text-muted-foreground">To</label>
        <input value={config.to || ""} onChange={(e) => onChange({ ...config, to: e.target.value })}
          placeholder="user@example.com" className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Subject</label>
        <input value={config.subject || ""} onChange={(e) => onChange({ ...config, subject: e.target.value })}
          placeholder="Notification" className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Body</label>
        <textarea value={config.body || ""} onChange={(e) => onChange({ ...config, body: e.target.value })}
          placeholder="Email body..." rows={3} className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground" />
      </div>
    </div>
  );
}

function DatabaseConfig({ config, onChange }) {
  return (
    <div className="space-y-3">
      <CredentialSelector
        value={config.credentialId}
        onChange={(id) => onChange({ ...config, credentialId: id })}
        type="database"
        label="Database Connection"
      />
      <div>
        <label className="text-xs text-muted-foreground">Query</label>
        <textarea value={config.query || ""} onChange={(e) => onChange({ ...config, query: e.target.value })}
          placeholder="SELECT * FROM users LIMIT 10" rows={4} className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background font-mono text-foreground" />
      </div>
    </div>
  );
}

function AgentConfig({ config, onChange }) {
  const builtinLlm = config.builtinLlm || "gpt-4";
  const builtinMemory = config.builtinMemory || "none";
  const systemPrompt = config.systemPrompt || "";

  return (
    <div className="space-y-4">
      {/* Built-in LLM */}
      <div className="p-3 border border-border rounded-md bg-muted/30 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-foreground">Built-in Chat Model</span>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Model</label>
          <select
            value={builtinLlm}
            onChange={(e) => onChange({ ...config, builtinLlm: e.target.value })}
            className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground"
          >
            <optgroup label="OpenAI">
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </optgroup>
            <optgroup label="Anthropic">
              <option value="claude-3-opus">Claude 3 Opus</option>
              <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              <option value="claude-3-haiku">Claude 3 Haiku</option>
            </optgroup>
            <optgroup label="Google">
              <option value="gemini-pro">Gemini Pro</option>
              <option value="gemini-flash">Gemini Flash</option>
            </optgroup>
            <optgroup label="Open Source">
              <option value="llama-3">Llama 3</option>
              <option value="mixtral-8x7b">Mixtral 8x7B</option>
            </optgroup>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Temperature</label>
          <input
            type="number"
            min={0}
            max={2}
            step={0.1}
            value={Number(config.temperature) || 0.7}
            onChange={(e) => onChange({ ...config, temperature: Number(e.target.value) })}
            className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground"
          />
        </div>
      </div>

      {/* Built-in Memory */}
      <div className="p-3 border border-border rounded-md bg-muted/30 space-y-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${builtinMemory !== "none" ? "bg-teal-500" : "bg-muted-foreground/40"}`} />
          <span className="text-xs font-semibold text-foreground">Built-in Memory</span>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Type</label>
          <select
            value={builtinMemory}
            onChange={(e) => onChange({ ...config, builtinMemory: e.target.value })}
            className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground"
          >
            <option value="none">None (Stateless)</option>
            <option value="buffer">Buffer Memory</option>
            <option value="window">Window Memory (last N messages)</option>
            <option value="summary">Summary Memory</option>
          </select>
        </div>
        {builtinMemory === "window" && (
          <div>
            <label className="text-xs text-muted-foreground">Window Size</label>
            <input
              type="number"
              min={1}
              max={50}
              value={Number(config.windowSize) || 10}
              onChange={(e) => onChange({ ...config, windowSize: Number(e.target.value) })}
              className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground"
            />
          </div>
        )}
      </div>

      {/* System Prompt */}
      <div>
        <label className="text-xs text-muted-foreground">System Prompt</label>
        <textarea
          value={systemPrompt}
          onChange={(e) => onChange({ ...config, systemPrompt: e.target.value })}
          placeholder="You are a helpful assistant..."
          rows={4}
          className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground"
        />
      </div>

      {/* Max Iterations */}
      <div>
        <label className="text-xs text-muted-foreground">Max Iterations</label>
        <input
          type="number"
          min={1}
          max={20}
          value={Number(config.maxIterations) || 5}
          onChange={(e) => onChange({ ...config, maxIterations: Number(e.target.value) })}
          className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground"
        />
      </div>
    </div>
  );
}

function SwitchConfig({ config, onChange }) {
  const rules = config.rules || [];
  const addRule = () => onChange({ ...config, rules: [...rules, { field: "", operator: "equals", value: "", output: `Output ${rules.length}` }] });
  const updateRule = (i, key, val) => {
    const updated = [...rules];
    updated[i] = { ...updated[i], [key]: val };
    onChange({ ...config, rules: updated });
  };
  const removeRule = (i) => onChange({ ...config, rules: rules.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-3">
      <label className="text-xs text-muted-foreground">Routing Rules</label>
      {rules.map((r, i) => (
        <div key={i} className="p-2 border border-border rounded-md space-y-2 bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-muted-foreground">Rule {i + 1}</span>
            <button onClick={() => removeRule(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
          </div>
          <input value={r.field} onChange={(e) => updateRule(i, "field", e.target.value)} placeholder="Field path" className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground" />
          <select value={r.operator} onChange={(e) => updateRule(i, "operator", e.target.value)} className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground">
            <option value="equals">Equals</option><option value="not_equals">Not Equals</option><option value="contains">Contains</option>
            <option value="greater_than">Greater Than</option><option value="less_than">Less Than</option>
          </select>
          <input value={r.value} onChange={(e) => updateRule(i, "value", e.target.value)} placeholder="Compare value" className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground" />
          <input value={r.output} onChange={(e) => updateRule(i, "output", e.target.value)} placeholder="Output label" className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground" />
        </div>
      ))}
      <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={addRule}><Plus className="h-3 w-3" /> Add Rule</Button>
      <div>
        <label className="text-xs text-muted-foreground">Fallback Output</label>
        <input value={config.fallback || "Default"} onChange={(e) => onChange({ ...config, fallback: e.target.value })}
          className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground" />
      </div>
    </div>
  );
}

function LoopConfig({ config, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground">Batch Size</label>
        <input type="number" value={Number(config.batchSize) || 1} onChange={(e) => onChange({ ...config, batchSize: Number(e.target.value) })}
          min={1} max={1000} className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Max Iterations</label>
        <input type="number" value={Number(config.maxIterations) || 100} onChange={(e) => onChange({ ...config, maxIterations: Number(e.target.value) })}
          min={1} max={10000} className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground" />
      </div>
    </div>
  );
}

function ErrorTriggerConfig({ config, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground">Error Types to Catch</label>
        <div className="mt-1 space-y-1">
          {["all", "node_error", "timeout", "auth_error"].map((t) => (
            <label key={t} className="flex items-center gap-2 text-xs text-foreground">
              <input type="checkbox" checked={(config.errorTypes || ["all"]).includes(t)}
                onChange={(e) => {
                  const current = config.errorTypes || ["all"];
                  const updated = e.target.checked ? [...current, t] : current.filter((x) => x !== t);
                  onChange({ ...config, errorTypes: updated });
                }}
                className="rounded border-border" />
              {t.replace("_", " ")}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Continue on Error</label>
        <select value={String(config.continueOnError ?? "false")} onChange={(e) => onChange({ ...config, continueOnError: e.target.value === "true" })}
          className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground">
          <option value="false">Stop Workflow</option>
          <option value="true">Continue to Next Node</option>
        </select>
      </div>
    </div>
  );
}

function GoogleSheetsConfig({ config, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground">Operation</label>
        <select value={config.operation || "read"} onChange={(e) => onChange({ ...config, operation: e.target.value })}
          className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground">
          <option value="read">Read Rows</option><option value="append">Append Row</option><option value="update">Update Row</option><option value="delete">Delete Row</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Spreadsheet ID</label>
        <input value={config.spreadsheetId || ""} onChange={(e) => onChange({ ...config, spreadsheetId: e.target.value })}
          placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms" className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background font-mono text-xs text-foreground" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Range</label>
        <input value={config.range || ""} onChange={(e) => onChange({ ...config, range: e.target.value })}
          placeholder="Sheet1!A1:D10" className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground" />
      </div>
    </div>
  );
}

function FilterConfig({ config, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground">Field to Filter</label>
        <input value={config.field || ""} onChange={(e) => onChange({ ...config, field: e.target.value })}
          placeholder="data.status" className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Condition</label>
        <select value={config.operator || "exists"} onChange={(e) => onChange({ ...config, operator: e.target.value })}
          className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground">
          <option value="exists">Exists</option><option value="not_exists">Does Not Exist</option>
          <option value="equals">Equals</option><option value="not_equals">Not Equals</option>
          <option value="contains">Contains</option><option value="greater_than">Greater Than</option>
          <option value="less_than">Less Than</option>
        </select>
      </div>
      {["equals", "not_equals", "contains", "greater_than", "less_than"].includes(config.operator || "") && (
        <div>
          <label className="text-xs text-muted-foreground">Value</label>
          <input value={config.value || ""} onChange={(e) => onChange({ ...config, value: e.target.value })}
            placeholder="Compare value" className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground" />
        </div>
      )}
    </div>
  );
}

function WebhookConfig({ config, onChange }) {
  const webhookUrl = "Save workflow first to generate webhook URL";

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground">Webhook URL</label>
        <div className="mt-1 p-2 bg-muted/50 border border-border rounded-md">
          <code className="text-[10px] text-foreground break-all font-mono">{webhookUrl}</code>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">Send POST/GET requests to this URL to trigger the workflow.</p>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Accepted Methods</label>
        <select value={config.method || "POST"} onChange={(e) => onChange({ ...config, method: e.target.value })}
          className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground">
          <option value="POST">POST</option><option value="GET">GET</option><option value="ANY">Any</option>
        </select>
      </div>
    </div>
  );
}

const CONFIG_PANELS = {
  http: HttpConfig,
  code: CodeConfig,
  if: IfConfig,
  switch: SwitchConfig,
  set: SetConfig,
  wait: WaitConfig,
  slack: SlackConfig,
  discord: SlackConfig,
  telegram: SlackConfig,
  email: EmailConfig,
  "email-trigger": EmailConfig,
  database: DatabaseConfig,
  postgres: DatabaseConfig,
  mysql: DatabaseConfig,
  filter: FilterConfig,
  loop: LoopConfig,
  "error-trigger": ErrorTriggerConfig,
  "google-sheets": GoogleSheetsConfig,
  "ai-agent": AgentConfig,
  webhook: WebhookConfig,
};

function NodeDetailPanel({ node, executionResult, onClose, onUpdateConfig }) {
  const data = node.data;
  const nodeType = data.type;
  const [activeTab, setActiveTab] = useState(executionResult ? "output" : "params");
  const [config, setConfig] = useState(data.config || {});

  const handleConfigChange = useCallback((newConfig) => {
    setConfig(newConfig);
    onUpdateConfig(node.id, newConfig);
  }, [node.id, onUpdateConfig]);

  const ConfigPanel = CONFIG_PANELS[nodeType];

  const tabs = [
    { id: "params", label: "Parameters" },
    { id: "input", label: "Input", hasData: !!executionResult },
    { id: "output", label: "Output", hasData: !!executionResult },
  ];

  return (
    <div className="absolute top-12 right-0 w-80 h-[calc(100%-3rem)] bg-card border-l border-border overflow-y-auto shadow-lg flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-semibold text-sm truncate text-foreground">{data.label}</h3>
          {executionResult && (
            <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
              executionResult.status === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
            }`}>
              {executionResult.status === "success" ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
              {executionResult.status === "success" ? "Success" : "Error"}
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg">×</button>
      </div>

      {executionResult && (
        <div className="px-4 py-2 border-b border-border flex items-center gap-4 text-[11px] text-muted-foreground bg-muted/30 shrink-0">
          <span>Duration: <strong className="text-foreground">{executionResult.duration}ms</strong></span>
          <span>Type: <strong className="text-foreground">{executionResult.nodeType}</strong></span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border shrink-0">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors relative ${
              activeTab === tab.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}>
            <span className="flex items-center justify-center gap-1">
              {tab.label}
              {tab.hasData && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
            </span>
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "params" && (
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Configuration</label>
            <div className="mt-2 space-y-3">
              {ConfigPanel ? (
                <ConfigPanel config={config} onChange={handleConfigChange} />
              ) : (
                <div className="p-3 bg-muted rounded-md text-foreground">
                  <p className="text-xs text-muted-foreground">No configuration needed for this node type.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "input" && (
          executionResult ? <JsonBlock data={executionResult.input} label="Input Data" /> : (
            <div className="text-center py-8">
              <ArrowDownToLine className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">Execute workflow to see input data</p>
            </div>
          )
        )}

        {activeTab === "output" && (
          executionResult ? (
            <div className="space-y-3">
              {executionResult.error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-xs font-medium text-destructive mb-1">Error</p>
                  <p className="text-xs text-destructive/80 font-mono">{executionResult.error}</p>
                </div>
              )}
              {Object.keys(executionResult.output).length > 0 && <JsonBlock data={executionResult.output} label="Output Data" />}
            </div>
          ) : (
            <div className="text-center py-8">
              <ArrowUpFromLine className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">Execute workflow to see output data</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default memo(NodeDetailPanel);
