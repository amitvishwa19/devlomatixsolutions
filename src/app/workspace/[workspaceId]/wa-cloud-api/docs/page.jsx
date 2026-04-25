"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronRight,
  ContactRound,
  MessageSquare,
  PlugZap,
  Rocket,
  Search,
  Sparkles,
  Webhook,
  Workflow,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const sections = [
  {
    id: "getting-started",
    label: "Getting started",
    icon: Sparkles,
    items: [
      { id: "overview", label: "Overview" },
      { id: "quickstart", label: "Quickstart" },
      { id: "concepts", label: "Core concepts" },
    ],
  },
  {
    id: "setup",
    label: "Setup & accounts",
    icon: PlugZap,
    items: [
      { id: "connect-meta", label: "Connect a number" },
      { id: "credentials", label: "Credentials" },
      { id: "test-numbers", label: "Test numbers" },
    ],
  },
  {
    id: "messaging",
    label: "Messaging",
    icon: MessageSquare,
    items: [
      { id: "send", label: "Send a message" },
      { id: "templates", label: "Templates" },
      { id: "media", label: "Media library" },
      { id: "inbox", label: "Inbox" },
    ],
  },
  {
    id: "audience",
    label: "Audience",
    icon: ContactRound,
    items: [
      { id: "contacts", label: "Contacts" },
      { id: "import-export", label: "Import / Export" },
      { id: "duplicates", label: "Duplicate merge" },
      { id: "segments", label: "Segments" },
    ],
  },
  {
    id: "automation",
    label: "Automation",
    icon: Workflow,
    items: [
      { id: "rules", label: "Auto-reply rules" },
      { id: "flows", label: "Flows" },
      { id: "ai-tagging", label: "AI tagging" },
    ],
  },
  {
    id: "growth",
    label: "Growth",
    icon: Rocket,
    items: [
      { id: "campaigns", label: "Campaigns" },
      { id: "analytics", label: "Analytics" },
      { id: "billing", label: "Usage & billing" },
    ],
  },
  {
    id: "developer",
    label: "Developer",
    icon: Webhook,
    items: [
      { id: "outbound-webhooks", label: "Outbound webhooks" },
      { id: "webhook-payloads", label: "Webhook payloads" },
      { id: "errors", label: "Errors & retries" },
    ],
  },
  {
    id: "reference",
    label: "Reference",
    icon: BookOpen,
    items: [
      { id: "shortcuts", label: "Shortcuts" },
      { id: "glossary", label: "Glossary" },
      { id: "faq", label: "FAQ" },
    ],
  },
];

const articles = [
  {
    id: "overview",
    title: "Overview",
    section: "Getting started",
    summary: "What KonnectX does and how the pieces fit together.",
    body: () => (
      <Prose>
        <p>
          KonnectX is a WhatsApp business suite built on the Meta Cloud API.
        </p>
        <h3>Key building blocks</h3>
        <ul>
          <li><b>Phone number</b> — linked to a Meta WABA.</li>
          <li><b>Contacts</b> — with tags, custom fields, and lifecycle stage.</li>
          <li><b>Templates</b> — pre-approved message formats.</li>
          <li><b>Conversations</b> — threaded inbox.</li>
          <li><b>Campaigns</b> — bulk template sends.</li>
          <li><b>Automations</b> — keyword-triggered auto-replies.</li>
        </ul>
      </Prose>
    ),
  },
  {
    id: "quickstart",
    title: "Quickstart",
    section: "Getting started",
    summary: "From zero to first message in 10 minutes.",
    body: () => (
      <Prose>
        <ol>
          <li><b>Connect account.</b> Add WABA ID and Token in Settings.</li>
          <li><b>Add test number.</b> Enter your own number for testing.</li>
          <li><b>Sync templates.</b> Pull approved formats from Meta.</li>
          <li><b>Send test.</b> Use the gallery to fire a message.</li>
        </ol>
      </Prose>
    ),
  },
  {
    id: "concepts",
    title: "Core concepts",
    section: "Getting started",
    summary: "Sessions, templates, and the 24-hour window.",
    body: () => (
      <Prose>
        <h3>The 24-hour window</h3>
        <p>
          Meta allows free-form replies for 24 hours after a user messages you.
          Outside this window, only <b>templates</b> are allowed.
        </p>
      </Prose>
    ),
  },
];

function Prose({ children }) {
  return (
    <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-headings:font-bold prose-h3:mt-6 prose-h3:mb-2 prose-p:leading-relaxed prose-li:my-1 prose-strong:text-foreground prose-a:text-primary">
      {children}
    </div>
  );
}

export default function DocsPage() {
  const [active, setActive] = useState("overview");
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return articles.filter((a) =>
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.section.toLowerCase().includes(q)
    );
  }, [query]);

  const article = articles.find((a) => a.id === active) || articles[0];

  return (
    <div className="space-y-6 pb-8">
      <div className="overflow-hidden rounded-md border border-border/60 bg-gradient-to-br from-primary/5 to-background p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Documentation</h1>
            <p className="text-sm text-muted-foreground">Guides and references for KonnectX.</p>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="pl-9 h-9"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <ScrollArea className="h-[calc(100vh-280px)] pr-4">
            <nav className="space-y-6">
              {sections.map((sec) => (
                <div key={sec.id} className="space-y-2">
                  <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <sec.icon className="h-3 w-3" />
                    {sec.label}
                  </div>
                  <ul className="space-y-1">
                    {sec.items.map((it) => (
                      <li key={it.id}>
                        <button
                          onClick={() => { setActive(it.id); setQuery(""); }}
                          className={`w-full rounded-md px-2 py-1.5 text-left text-xs font-medium transition-colors ${active === it.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"}`}
                        >
                          {it.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </ScrollArea>
        </aside>

        <main className="min-w-0">
          {results ? (
            <Card className="rounded-md border-border/60">
              <CardHeader className="p-4">
                <CardTitle className="text-sm">Search results</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { setActive(r.id); setQuery(""); }}
                    className="flex w-full items-center justify-between gap-3 rounded-md border border-border/60 p-3 text-left hover:bg-muted/30"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{r.title}</span>
                        <Badge variant="outline" className="text-[10px] h-4">{r.section}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.summary}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{article.section}</p>
                <h2 className="text-xl font-bold tracking-tight">{article.title}</h2>
              </div>
              <Card className="rounded-md border-border/60">
                <CardContent className="p-6">
                  {article.body()}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
