'use client'

import React, { memo, useState, useCallback } from "react";
import { Check, X, Copy, ChevronDown, ChevronRight, ArrowDownToLine, ArrowUpFromLine, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CredentialSelector, { NODE_CREDENTIAL_TYPES } from "./CredentialSelector";

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
        <span className="text-[10px] opacity-60 font-mono">{Object.keys(data || {}).length} fields</span>
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
        types={NODE_CREDENTIAL_TYPES.http}
        label="Authentication"
      />
      <div>
        <label className="text-xs text-muted-foreground">Method</label>
        <select value={config.method || "GET"} onChange={(e) => onChange({ ...config, method: e.target.value })}
          className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-transparent">
          <option value="GET" className="bg-background">GET</option>
          <option value="POST" className="bg-background">POST</option>
          <option value="PUT" className="bg-background">PUT</option>
          <option value="PATCH" className="bg-background">PATCH</option>
          <option value="DELETE" className="bg-background">DELETE</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">URL</label>
        <input value={config.url || ""} onChange={(e) => onChange({ ...config, url: e.target.value })}
          placeholder="https://api.example.com/data" className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-transparent" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Body (JSON)</label>
        <textarea value={config.body || ""} onChange={(e) => onChange({ ...config, body: e.target.value })}
          placeholder='{"key": "value"}' rows={3} className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-transparent font-mono" />
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
          rows={8} className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-transparent font-mono" placeholder="return items;" />
      </div>
      <p className="text-[10px] text-muted-foreground">Use <code className="bg-muted px-1 rounded">items</code> for previous node output. <code className="bg-muted px-1 rounded">$input</code> for raw input.</p>
    </div>
  );
}

function AgentConfig({ config, onChange }) {
  return (
    <div className="space-y-4">
      <CredentialSelector
        value={config.credentialId}
        onChange={(id) => onChange({ ...config, credentialId: id })}
        types={NODE_CREDENTIAL_TYPES["ai-agent"]}
        label="API Key"
      />
      <div className="p-3 border border-border rounded-md bg-muted/30 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-foreground">Built-in Chat Model</span>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Model</label>
          <select
            value={config.builtinLlm || "gpt-4"}
            onChange={(e) => onChange({ ...config, builtinLlm: e.target.value })}
            className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-transparent"
          >
            <option value="gpt-4" className="bg-background">GPT-4</option>
            <option value="gpt-4-turbo" className="bg-background">GPT-4 Turbo</option>
            <option value="claude-3-opus" className="bg-background">Claude 3 Opus</option>
            <option value="gemini-pro" className="bg-background">Gemini Pro</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Temperature</label>
          <input
            type="number" min={0} max={2} step={0.1}
            value={config.temperature ?? 0.7}
            onChange={(e) => onChange({ ...config, temperature: Number(e.target.value) })}
            className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-transparent"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">System Prompt</label>
        <textarea
          value={config.systemPrompt || ""}
          onChange={(e) => onChange({ ...config, systemPrompt: e.target.value })}
          placeholder="You are a helpful assistant..."
          rows={4}
          className="w-full mt-1 px-3 py-1.5 text-sm border border-border rounded-md bg-transparent"
        />
      </div>
    </div>
  );
}

const CONFIG_PANELS = {
  http: HttpConfig,
  code: CodeConfig,
  "ai-agent": AgentConfig,
};

const NodeDetailPanel = ({ node, executionResult, onClose, onUpdateConfig }) => {
  const data = node.data;
  const nodeType = data.type;
  const [activeTab, setActiveTab] = useState(executionResult ? "output" : "params");
  const [config, setConfig] = useState(data.config || {});

  const handleConfigChange = useCallback((newConfig) => {
    setConfig(newConfig);
    onUpdateConfig(node.id, newConfig);
  }, [node.id, onUpdateConfig]);

  const ConfigPanel = CONFIG_PANELS[nodeType];

  return (
    <div className="absolute top-12 right-0 w-80 h-[calc(100%-3rem)] bg-card border-l border-border overflow-y-auto shadow-lg flex flex-col z-20">
      <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-semibold text-sm truncate">{data.label}</h3>
          {executionResult && (
            <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
              executionResult.status === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
            }`}>
              {executionResult.status === "success" ? "Success" : "Error"}
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg">×</button>
      </div>

      <div className="flex border-b border-border shrink-0">
        {["params", "input", "output"].map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors relative capitalize ${
              activeTab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}>
            {t}
            {activeTab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "params" && (
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Configuration</label>
            <div className="mt-2 space-y-3">
              {ConfigPanel ? <ConfigPanel config={config} onChange={handleConfigChange} /> : (
                <div className="p-3 bg-muted rounded-md text-xs text-muted-foreground text-center">
                  No configuration needed.
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === "input" && (
          executionResult ? <JsonBlock data={executionResult.input} label="Input Data" /> : (
            <div className="text-center py-8 text-xs text-muted-foreground">
              Execute workflow to see input data.
            </div>
          )
        )}
        {activeTab === "output" && (
          executionResult ? <JsonBlock data={executionResult.output} label="Output Data" /> : (
            <div className="text-center py-8 text-xs text-muted-foreground">
              Execute workflow to see output data.
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default memo(NodeDetailPanel);
