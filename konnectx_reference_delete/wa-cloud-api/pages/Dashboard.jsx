import { Activity, ArrowUpRight, BookTemplate, ContactRound, Image as ImageIcon, MessageSquare, Rocket, Send, Settings as SettingsIcon, Shield, Sparkles, XCircle, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "../components/StatusBadge";
import { formatNumber, formatDate } from "../lib/validators";

function FeatureCard({ icon: Icon, tone, title, description, stats, onClick }) {
  const tones = {
    primary: "bg-primary/10 text-primary ring-primary/30",
    success: "bg-success/10 text-success ring-success/30",
    info: "bg-info/10 text-info ring-info/30",
    warning: "bg-warning/10 text-warning ring-warning/30",
    violet: "bg-[hsl(265_85%_65%/0.12)] text-[hsl(265_85%_72%)] ring-[hsl(265_85%_65%/0.3)]",
    rose: "bg-[hsl(340_85%_62%/0.12)] text-[hsl(340_85%_70%)] ring-[hsl(340_85%_62%/0.3)]",
  };
  return (
    <button
      onClick={onClick}
      className="group relative flex h-full flex-col overflow-hidden rounded-md border border-border/60 bg-gradient-card p-5 text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/5 blur-3xl transition-opacity group-hover:opacity-100" />
      <div className={`flex h-11 w-11 items-center justify-center rounded-md ring-1 ${tones[tone] || tones.primary}`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-8 text-lg font-bold tracking-tight text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border/50 pt-4">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-sm font-bold text-foreground">{s.value}</p>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </button>
  );
}

export function Dashboard({ data, setView }) {
  const conversations = data.conversations.data || [];
  const campaigns = data.campaigns.data || [];
  const contacts = data.contacts.data || [];
  const templates = data.templates.data || [];
  const media = data.media.data || [];
  const numbers = data.phoneNumbers.data || [];

  const sent = campaigns.reduce((sum, item) => sum + (item.sent_count || 0), 0);
  const delivered = campaigns.reduce((sum, item) => sum + (item.delivered_count || 0), 0);
  const approved = templates.filter((t) => t.status === "APPROVED").length;
  const totalMediaMb = (media.reduce((sum, m) => sum + (m.file_size || 0), 0) / 1024 / 1024).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-md border border-border/60 bg-gradient-card p-6 shadow-card sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[hsl(265_85%_65%/0.08)] blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Zap className="h-3.5 w-3.5" /> Multi-Account Engine
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome to your <span className="bg-gradient-primary bg-clip-text text-transparent italic">Workspace.</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Control your entire WhatsApp Business presence from one centralized command center. Manage conversations, automate campaigns, and secure your credentials with ease.
          </p>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FeatureCard
          tone="info"
          icon={MessageSquare}
          title="Inbox"
          description="Two-way conversations with delivery, read receipts, and threaded history."
          stats={[
            { label: "Threads", value: formatNumber(conversations.length) },
            { label: "Unread", value: formatNumber(conversations.reduce((s, c) => s + (c.unread_count || 0), 0)) },
          ]}
          onClick={() => setView("inbox")}
        />
        <FeatureCard
          tone="success"
          icon={Rocket}
          title="Campaigns"
          description="Bulk template messaging with pacing, audience filters, and live progress."
          stats={[
            { label: "Total", value: formatNumber(campaigns.length) },
            { label: "Delivered", value: formatNumber(delivered) },
          ]}
          onClick={() => setView("campaigns")}
        />
        <FeatureCard
          tone="primary"
          icon={BookTemplate}
          title="Templates"
          description="Sync, review, and reuse approved Meta templates across all accounts."
          stats={[
            { label: "Synced", value: formatNumber(templates.length) },
            { label: "Approved", value: formatNumber(approved) },
          ]}
          onClick={() => setView("templates")}
        />
        <FeatureCard
          tone="warning"
          icon={ImageIcon}
          title="Media Library"
          description="Securely store and reuse images, video, and documents for messaging."
          stats={[
            { label: "Files", value: formatNumber(media.length) },
            { label: "Storage", value: `${totalMediaMb} MB` },
          ]}
          onClick={() => setView("media")}
        />
        <FeatureCard
          tone="violet"
          icon={ContactRound}
          title="Contacts & CRM"
          description="Centralized directory for leads, active customers, and segmented audiences."
          stats={[
            { label: "Contacts", value: formatNumber(contacts.length) },
            { label: "Tags", value: formatNumber(new Set(contacts.flatMap((c) => c.tags || [])).size) },
          ]}
          onClick={() => setView("contacts")}
        />
        <FeatureCard
          tone="rose"
          icon={Send}
          title="Send Message"
          description="Compose direct text, media, or template messages from the default account."
          stats={[
            { label: "Messages", value: formatNumber(sent) },
            { label: "Account", value: data.defaultNumber ? "Ready" : "Setup" },
          ]}
          onClick={() => setView("send")}
        />
        <FeatureCard
          tone="info"
          icon={SettingsIcon}
          title="System & Access"
          description="Manage WhatsApp accounts, access tokens, webhooks, and platform configuration."
          stats={[
            { label: "Accounts", value: formatNumber(numbers.length) },
            { label: "Default", value: data.defaultNumber ? "Set" : "—" },
          ]}
          onClick={() => setView("settings")}
        />
        <FeatureCard
          tone="success"
          icon={Sparkles}
          title="Automation"
          description="Auto-replies, smart routing, and template-driven flows for incoming chats."
          stats={[
            { label: "Status", value: "Coming" },
            { label: "Beta", value: "Soon" },
          ]}
          onClick={() => setView("inbox")}
        />
      </div>

      {/* Activity + Health */}
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card className="rounded-md border-border/60 bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Activity className="h-4 w-4 text-primary" /> Activity Overview
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Real-time webhook events from Meta</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => data.refetchAll()} className="gap-1">
              Refresh <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {(data.events.data || []).slice(0, 6).map((event) => (
              <div key={event.id} className="flex items-center justify-between gap-4 rounded-md border border-border/50 bg-card/40 p-3 transition-colors hover:border-primary/30">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{event.event_type}</p>
                    <p className="truncate text-xs text-muted-foreground">{event.provider_message_id || event.provider_object || "Meta webhook event"}</p>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{formatDate(event.received_at)}</span>
              </div>
            ))}
            {!(data.events.data || []).length && (
              <div className="flex items-center gap-3 rounded-md border border-dashed border-border/60 p-5 text-sm text-muted-foreground">
                <XCircle className="h-4 w-4" /> No webhook events yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-md border-border/60 bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Shield className="h-4 w-4 text-success" /> System Health
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Account & integration status</p>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {[
              { label: "Default Account", value: data.defaultNumber ? "Operational" : "Not set", ok: !!data.defaultNumber },
              { label: "Templates Sync", value: approved > 0 ? "Operational" : "Pending", ok: approved > 0 },
              { label: "Webhook Receiver", value: (data.events.data || []).length ? "Receiving" : "Idle", ok: true },
              { label: "Cloud Storage", value: "Operational", ok: true },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-md border border-border/50 bg-card/40 px-3 py-3">
                <span className="text-sm font-medium">{row.label}</span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">{row.value}</span>
                  <span className={`h-2 w-2 rounded-full ${row.ok ? "bg-success shadow-[0_0_8px_hsl(var(--success))]" : "bg-warning shadow-[0_0_8px_hsl(var(--warning))]"}`} />
                </div>
              </div>
            ))}
            {data.defaultNumber && (
              <div className="mt-2 rounded-md border border-primary/20 bg-primary/5 p-3">
                <p className="text-[11px] uppercase tracking-wider text-primary">Active account</p>
                <p className="mt-1 text-sm font-semibold">{data.defaultNumber.display_name}</p>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">{data.defaultNumber.phone_number_id}</p>
                <div className="mt-2"><StatusBadge status={data.defaultNumber.quality_rating || "active"} /></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
