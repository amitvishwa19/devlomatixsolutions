import { useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  Bot,
  Calculator,
  Database,
  GitBranch,
  Globe,
  HandMetal,
  HardDriveDownload,
  Hash,
  Mail,
  MessageSquare,
  Network,
  Repeat,
  Search,
  Server,
  Slack,
  Timer,
  Webhook,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NodeKind = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  category: "Triggers" | "Core" | "Tools" | "Utilities" | "Integrations" | "Data";
  type: "trigger" | "agent" | "utility" | "tool";
};

const ALL_KINDS: NodeKind[] = [
  // triggers
  { id: "trigger.manual", label: "Manual Trigger", description: "Run the workflow on demand from a button.", icon: HandMetal, category: "Triggers", type: "trigger" },
  { id: "trigger.chat", label: "Chat Input", description: "Trigger when a user sends a chat message.", icon: MessageSquare, category: "Triggers", type: "trigger" },
  { id: "trigger.webhook", label: "Webhook", description: "Trigger via a public HTTP URL (POST).", icon: Webhook, category: "Triggers", type: "trigger" },
  // core
  { id: "core.agent", label: "AI Agent", description: "LLM with system prompt, tools, and memory.", icon: Bot, category: "Core", type: "agent" },
  // tools
  { id: "tool.calculator", label: "Calculator", description: "Lets the agent evaluate math expressions.", icon: Calculator, category: "Tools", type: "tool" },
  { id: "tool.websearch", label: "Web Search", description: "Lets the agent search the web for fresh info.", icon: Globe, category: "Tools", type: "tool" },
  { id: "tool.memory", label: "Memory", description: "Persistent conversation memory for the agent.", icon: Database, category: "Tools", type: "tool" },
  // utilities
  { id: "util.http", label: "HTTP Request", description: "Call any HTTP endpoint directly from the browser.", icon: Network, category: "Utilities", type: "utility" },
  { id: "util.if", label: "If / Condition", description: "Branch the workflow based on a JS expression.", icon: GitBranch, category: "Utilities", type: "utility" },
  { id: "util.repeat", label: "Repeat N times", description: "Run the downstream subgraph N times in sequence.", icon: Repeat, category: "Utilities", type: "utility" },
  { id: "util.delay", label: "Delay / Wait", description: "Pause execution for N milliseconds before continuing.", icon: Timer, category: "Utilities", type: "utility" },
  // integrations
  { id: "util.email", label: "Send Email", description: "Send an email via Resend connector.", icon: Mail, category: "Integrations", type: "utility" },
  { id: "util.slack", label: "Slack Post", description: "Post a message to Slack via incoming webhook URL.", icon: Slack, category: "Integrations", type: "utility" },
  // data
  { id: "util.db", label: "Database Query", description: "Read rows from a Supabase table with filters.", icon: HardDriveDownload, category: "Data", type: "utility" },
  { id: "util.supabase", label: "Supabase CRUD", description: "Insert / select / update / delete rows on a Supabase table.", icon: Server, category: "Data", type: "utility" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "first" | "after" | "tool" | "all";
  onPick: (kind: NodeKind) => void;
}

export const NodePickerSheet = ({ open, onOpenChange, mode, onPick }: Props) => {
  const [q, setQ] = useState("");

  const visible = useMemo(() => {
    let list = ALL_KINDS;
    if (mode === "tool") list = list.filter((k) => k.type === "tool");
    if (mode === "first") list = list.filter((k) => k.type === "trigger");
    if (mode === "after") list = list.filter((k) => k.type !== "trigger");
    // "all" → no filter

    if (!q.trim()) return list;
    const needle = q.toLowerCase();
    return list.filter(
      (k) => k.label.toLowerCase().includes(needle) || k.description.toLowerCase().includes(needle),
    );
  }, [mode, q]);

  const grouped = useMemo(() => {
    const order: NodeKind["category"][] = ["Triggers", "Core", "Utilities", "Integrations", "Data", "Tools"];
    const map = new Map<string, NodeKind[]>();
    for (const k of visible) {
      if (!map.has(k.category)) map.set(k.category, []);
      map.get(k.category)!.push(k);
    }
    return order.filter((c) => map.has(c)).map((c) => [c, map.get(c)!] as const);
  }, [visible]);

  const title =
    mode === "first" ? "Choose a trigger" : mode === "tool" ? "Add a tool" : mode === "all" ? "Add a node" : "What happens next?";
  const subtitle =
    mode === "first"
      ? "Workflows start with a trigger. Pick how this one should fire."
      : mode === "tool"
        ? "Tools extend what the AI Agent can do."
        : mode === "all"
          ? "Browse every available node and add one to the canvas."
          : "Pick the next step in your workflow.";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-mono text-sm">{title}</SheetTitle>
          <SheetDescription className="font-mono text-xs">{subtitle}</SheetDescription>
        </SheetHeader>

        <div className="relative my-4">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search nodes…"
            className="h-9 pl-8 font-mono text-xs"
            autoFocus
          />
        </div>

        <div className="space-y-5 pb-6">
          {grouped.length === 0 && (
            <p className="font-mono text-xs text-muted-foreground">// no matches</p>
          )}
          {grouped.map(([cat, items]) => (
            <div key={cat}>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {cat}
              </p>
              <div className="space-y-1.5">
                {items.map((k) => {
                  const Icon = k.icon;
                  return (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => onPick(k)}
                      className="group flex w-full items-start gap-3 rounded-md border border-border bg-secondary/30 p-3 text-left transition-colors hover:border-primary/60 hover:bg-secondary/60"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs">{k.label}</p>
                        <p className="mt-0.5 font-mono text-[10px] leading-relaxed text-muted-foreground">
                          {k.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <span className="hidden"><Hash /></span>
      </SheetContent>
    </Sheet>
  );
};

export { ALL_KINDS };
