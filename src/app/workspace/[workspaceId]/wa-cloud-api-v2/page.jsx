"use client";

import { Activity, ArrowUpRight, BookTemplate, ContactRound, Image as ImageIcon, MessageSquare, Rocket, Send, Settings as SettingsIcon, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./_components/StatusBadge";
import { formatNumber, formatDate } from "./_lib/validators";
import { useV2Data } from "./layout";
import { useRouter, useParams } from "next/navigation";

function FeatureCard({ icon: Icon, tone, title, description, stats, onClick }) {
  const tones = {
    primary: "bg-primary/10 text-primary ring-primary/30",
    success: "bg-green-500/10 text-green-500 ring-green-500/30",
    info: "bg-blue-500/10 text-blue-500 ring-blue-500/30",
    warning: "bg-yellow-500/10 text-yellow-500 ring-yellow-500/30",
    violet: "bg-violet-500/10 text-violet-500 ring-violet-500/30",
    rose: "bg-rose-500/10 text-rose-500 ring-rose-500/30",
  };
  return (
    <button
      onClick={onClick}
      className="group relative flex h-full flex-col overflow-hidden rounded-md border border-border/60 bg-card p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-md ring-1 ${tones[tone] || tones.primary}`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-6 text-base font-bold tracking-tight text-foreground">{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">{description}</p>
      <div className="mt-auto grid grid-cols-2 gap-3 border-t border-border/50 pt-4">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-sm font-bold text-foreground tabular-nums">{s.value}</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </button>
  );
}

export default function DashboardPage() {
  const data = useV2Data();
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId;
  const base = `/workspace/${workspaceId}/wa-cloud-api-v2`;

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

  const nav = (path) => router.push(`${base}${path}`);

  return (
    <div className="space-y-6 pb-8">
      <div className="relative overflow-hidden rounded-md border border-border/60 bg-gradient-to-br from-primary/5 via-background to-background p-6 shadow-sm sm:p-8">
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
            <Zap className="h-3.5 w-3.5" /> KonnectX Engine V2
          </span>
          <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl italic">
            Welcome to your Command Center.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Monitor interactions, automate responses, and scale your WhatsApp Business presence with enterprise-grade tools and real-time analytics.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FeatureCard
          tone="info"
          icon={MessageSquare}
          title="Inbox"
          description="Omnichannel communication with delivery tracking and AI assistance."
          stats={[
            { label: "Threads", value: formatNumber(conversations.length) },
            { label: "Unread", value: formatNumber(conversations.reduce((s, c) => s + (c.unread_count || 0), 0)) },
          ]}
          onClick={() => nav("/inbox")}
        />
        <FeatureCard
          tone="success"
          icon={Rocket}
          title="Campaigns"
          description="High-volume template messaging with live tracking and pacing."
          stats={[
            { label: "Total", value: formatNumber(campaigns.length) },
            { label: "Reach", value: formatNumber(delivered) },
          ]}
          onClick={() => nav("/campaigns")}
        />
        <FeatureCard
          tone="primary"
          icon={BookTemplate}
          title="Templates"
          description="Manage approved Meta message formats and interactive components."
          stats={[
            { label: "Synced", value: formatNumber(templates.length) },
            { label: "Approved", value: formatNumber(approved) },
          ]}
          onClick={() => nav("/template")}
        />
        <FeatureCard
          tone="warning"
          icon={ImageIcon}
          title="Media library"
          description="Secure cloud storage for images, videos, and document assets."
          stats={[
            { label: "Files", value: formatNumber(media.length) },
            { label: "Storage", value: `${totalMediaMb} MB` },
          ]}
          onClick={() => nav("/media")}
        />
        <FeatureCard
          tone="violet"
          icon={ContactRound}
          title="Contacts"
          description="Global directory with segmentation, tags, and lifecycle stages."
          stats={[
            { label: "Contacts", value: formatNumber(contacts.length) },
            { label: "Audiences", value: formatNumber(data.segments?.data?.length || 0) },
          ]}
          onClick={() => nav("/contacts")}
        />
        <FeatureCard
          tone="rose"
          icon={Send}
          title="Broadcast"
          description="Compose and fire direct messages or template tests instantly."
          stats={[
            { label: "Activity", value: formatNumber(sent) },
            { label: "Status", value: data.defaultNumber ? "Active" : "Idle" },
          ]}
          onClick={() => nav("/send")}
        />
        <FeatureCard
          tone="info"
          icon={SettingsIcon}
          title="Infrastructure"
          description="Global configuration, access tokens, and webhook routing."
          stats={[
            { label: "Accounts", value: formatNumber(numbers.length) },
            { label: "Sync", value: "Realtime" },
          ]}
          onClick={() => nav("/settings")}
        />
        <FeatureCard
          tone="success"
          icon={Activity}
          title="Live Stream"
          description="Real-time event monitor for every inbound and outbound interaction."
          stats={[
            { label: "Latency", value: "< 200ms" },
            { label: "Uptime", value: "99.9%" },
          ]}
          onClick={() => nav("/stream")}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card className="rounded-md border-border/60 bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-border/60">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-widest">Recent Activity</CardTitle>
            </div>
            <Button size="sm" variant="ghost" onClick={() => data.refetchAll()} className="h-8 w-8 p-0">
              <Activity className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {(data.events?.data || []).slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-tight">{event.event_type}</p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">{event.provider_message_id || "System event"}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">{formatDate(event.received_at)}</span>
                </div>
              ))}
              {!(data.events?.data || []).length && (
                <div className="p-12 text-center text-xs text-muted-foreground font-bold uppercase tracking-widest">No recent interactions detected</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-md border-border/60 bg-card shadow-sm">
          <CardHeader className="py-4 border-b border-border/60">
            <CardTitle className="text-sm font-bold uppercase tracking-widest">Core Infrastructure</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {[
              { label: "Default WABA", value: data.defaultNumber ? "Operational" : "Offline", ok: !!data.defaultNumber },
              { label: "Webhook Bridge", value: (data.events?.data || []).length ? "Active" : "Listening", ok: true },
              { label: "AI Assist", value: "Connected", ok: true },
              { label: "Media CDN", value: "Ready", ok: true },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 px-4 py-3">
                <span className="text-xs font-bold uppercase tracking-tight">{row.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{row.value}</span>
                  <div className={`h-2 w-2 rounded-full ${row.ok ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-yellow-500"}`} />
                </div>
              </div>
            ))}
            {data.defaultNumber && (
              <div className="mt-4 rounded-md border border-primary/20 bg-primary/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Active Channel</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold">{data.defaultNumber.display_name}</span>
                  <StatusBadge status={data.defaultNumber.quality_rating || "active"} />
                </div>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">{data.defaultNumber.phone_number_id}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
