import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  Bot,
  BookTemplate,
  ChevronRight,
  ClipboardList,
  ContactRound,
  ExternalLink,
  FileSpreadsheet,
  Filter,
  Image as ImageIcon,
  Inbox,
  KeyRound,
  LineChart,
  MessageSquare,
  MessagesSquare,
  Merge,
  PlugZap,
  Rocket,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Wallet,
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
      { id: "connect-meta", label: "Connect a WhatsApp number" },
      { id: "credentials", label: "Access tokens & credentials" },
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
      { id: "inbox", label: "Inbox & conversations" },
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
      { id: "ai-tagging", label: "AI tagging & sentiment" },
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
      { id: "shortcuts", label: "Keyboard shortcuts" },
      { id: "glossary", label: "Glossary" },
      { id: "faq", label: "FAQ" },
    ],
  },
];

// Flat list of all docs entries with searchable text + content renderers.
const articles = [
  {
    id: "overview",
    title: "Overview",
    section: "Getting started",
    summary: "What KonnectX does and how the pieces fit together.",
    body: () => (
      <Prose>
        <p>
          KonnectX is a WhatsApp business suite built on the Meta Cloud API. It centralises sending,
          conversations, contacts, templates, automation, and analytics for one or more business
          phone numbers.
        </p>
        <h3>Key building blocks</h3>
        <ul>
          <li><b>Phone number</b> — a WhatsApp Business number linked to a Meta WABA.</li>
          <li><b>Contacts</b> — people you message, with tags, custom fields, and lifecycle stage.</li>
          <li><b>Templates</b> — pre-approved message formats required for marketing/utility sends.</li>
          <li><b>Conversations</b> — threaded inbox where two-way messaging happens.</li>
          <li><b>Campaigns</b> — bulk template sends to a segment with pacing & variants.</li>
          <li><b>Automations</b> — keyword-triggered auto-replies and flows.</li>
        </ul>
        <Callout tone="info">
          New here? Jump to <KbdLink>Quickstart</KbdLink> below for a 10-minute setup.
        </Callout>
      </Prose>
    ),
  },
  {
    id: "quickstart",
    title: "Quickstart",
    section: "Getting started",
    summary: "Get from zero to your first sent message in under 10 minutes.",
    body: () => (
      <Prose>
        <ol>
          <li>
            <b>Connect a WhatsApp number.</b> Open <PathPill>Settings → WhatsApp accounts</PathPill> and
            paste your Meta WABA ID, phone number ID, and a permanent access token.
          </li>
          <li>
            <b>Add a test number.</b> In <PathPill>Settings → Test numbers</PathPill>, add a phone
            you control with country code (e.g. <code>+15551234567</code>).
          </li>
          <li>
            <b>Sync templates.</b> Go to <PathPill>Templates</PathPill> and hit <b>Sync from Meta</b>.
            Approved templates will appear with status <Badge variant="secondary">APPROVED</Badge>.
          </li>
          <li>
            <b>Send a test.</b> Open any approved template, click <b>Send test</b>, pick your test
            number, fill any variables, and submit.
          </li>
          <li>
            <b>Check Inbox.</b> Replies land in <PathPill>Inbox</PathPill> in real time via the
            webhook.
          </li>
        </ol>
        <Callout tone="success">
          Once you can send and receive a test message, you're ready to import contacts and run
          your first campaign.
        </Callout>
      </Prose>
    ),
  },
  {
    id: "concepts",
    title: "Core concepts",
    section: "Getting started",
    summary: "Conversations, sessions, templates, and the 24-hour window.",
    body: () => (
      <Prose>
        <h3>The 24-hour window</h3>
        <p>
          When a user messages your business, you can reply with any message type for 24 hours
          (a <i>customer service window</i>). Outside that window you can only initiate with an
          approved <b>template</b>.
        </p>
        <h3>Template categories</h3>
        <ul>
          <li><b>MARKETING</b> — promotional content (opt-in required).</li>
          <li><b>UTILITY</b> — transactional updates (orders, appointments).</li>
          <li><b>AUTHENTICATION</b> — one-time passwords.</li>
        </ul>
        <h3>Conversation pricing</h3>
        <p>
          Meta charges per <b>conversation</b> (a 24-hour window) by category. KonnectX records
          each billable event in <PathPill>Usage & billing</PathPill>.
        </p>
      </Prose>
    ),
  },

  // Setup
  {
    id: "connect-meta",
    title: "Connect a WhatsApp number",
    section: "Setup & accounts",
    summary: "Link a Meta-verified phone number to KonnectX.",
    body: () => (
      <Prose>
        <ol>
          <li>In Meta Business Manager, finish phone verification and ensure the number has a display name.</li>
          <li>Generate a <b>permanent system user access token</b> with <code>whatsapp_business_messaging</code> and <code>whatsapp_business_management</code> scopes.</li>
          <li>Copy your <b>WABA ID</b>, <b>Phone number ID</b>, and the token.</li>
          <li>Paste them into <PathPill>Settings → WhatsApp accounts → Add account</PathPill>.</li>
          <li>Set the new account as default if you only manage one number.</li>
        </ol>
        <Callout tone="warn">
          Tokens are sensitive. KonnectX shows only a <code>•••• last4</code> preview after saving.
        </Callout>
      </Prose>
    ),
  },
  {
    id: "credentials",
    title: "Access tokens & credentials",
    section: "Setup & accounts",
    summary: "How tokens are stored, rotated, and validated.",
    body: () => (
      <Prose>
        <ul>
          <li>Tokens are stored in <code>wa_account_credentials</code> and never returned to the browser in full.</li>
          <li>Use <b>Verify</b> in Settings to ping the Graph API and refresh phone metadata.</li>
          <li>To rotate a token, replace it in the same form — the old value is overwritten.</li>
          <li>Removing an account disables sending but preserves history.</li>
        </ul>
      </Prose>
    ),
  },
  {
    id: "test-numbers",
    title: "Test numbers",
    section: "Setup & accounts",
    summary: "Manage allowed recipients for template testing.",
    body: () => (
      <Prose>
        <p>
          Test numbers appear in the <b>Send test</b> dialog on every template. Add them in
          <PathPill>Settings → Test numbers</PathPill>. Use international format with the
          <code>+</code> prefix.
        </p>
        <p>You can paste a CSV of <code>label,phone</code> pairs or upload a file.</p>
      </Prose>
    ),
  },

  // Messaging
  {
    id: "send",
    title: "Send a message",
    section: "Messaging",
    summary: "Free-form messages, templates, and media sends.",
    body: () => (
      <Prose>
        <p>From <PathPill>Send</PathPill> you can:</p>
        <ul>
          <li><b>Free-form text</b> — only valid inside the 24-hour window.</li>
          <li><b>Template</b> — choose an approved template, pick variables, and recipients.</li>
          <li><b>Media</b> — attach an image, document, video, or audio file.</li>
        </ul>
        <p>Every send is logged in <code>wa_send_attempts</code> with the request payload, status, and any provider error.</p>
      </Prose>
    ),
  },
  {
    id: "templates",
    title: "Templates",
    section: "Messaging",
    summary: "Create, sync, preview, and submit templates to Meta.",
    body: () => (
      <Prose>
        <ul>
          <li><b>Sync from Meta</b> pulls approved/pending/rejected templates and their components.</li>
          <li><b>Create local draft</b> lets you build header/body/footer/buttons in a guided editor.</li>
          <li><b>Submit for review</b> sends a draft to Meta. Approval typically takes minutes to hours.</li>
          <li>Variables use <code>{`{{1}}`}</code>, <code>{`{{2}}`}</code> placeholders. KonnectX validates count against your sample.</li>
        </ul>
      </Prose>
    ),
  },
  {
    id: "media",
    title: "Media library",
    section: "Messaging",
    summary: "Reusable images, videos, and documents for templates and sends.",
    body: () => (
      <Prose>
        <p>
          Upload once, attach anywhere. KonnectX stores the source asset and Meta's
          <code>media_id</code>. The library tracks <b>usage count</b> so you can find what's actually
          being used.
        </p>
        <p>Limits per Meta: images ≤ 5 MB, video ≤ 16 MB, documents ≤ 100 MB.</p>
      </Prose>
    ),
  },
  {
    id: "inbox",
    title: "Inbox & conversations",
    section: "Messaging",
    summary: "Two-way messaging with assignment, labels, and quick replies.",
    body: () => (
      <Prose>
        <ul>
          <li>Inbound messages create or update a conversation keyed by <code>external_contact_phone</code>.</li>
          <li>Assign threads to teammates from <PathPill>Settings → Assignees</PathPill>.</li>
          <li>Use <b>Quick replies</b> with <code>/shortcut</code> to insert canned responses.</li>
          <li>Labels (e.g. <Badge variant="outline">vip</Badge>) help filter and route conversations.</li>
        </ul>
      </Prose>
    ),
  },

  // Audience
  {
    id: "contacts",
    title: "Contacts",
    section: "Audience",
    summary: "The single source of truth for everyone you message.",
    body: () => (
      <Prose>
        <p>Each contact has:</p>
        <ul>
          <li><b>Phone number</b> — unique key, normalized to E.164.</li>
          <li><b>Name, tags, custom fields</b> — for personalisation and filtering.</li>
          <li><b>Lifecycle stage</b> — lead, customer, churned, etc.</li>
          <li><b>Opt-in status</b> — required for MARKETING templates.</li>
        </ul>
      </Prose>
    ),
  },
  {
    id: "import-export",
    title: "Import / Export",
    section: "Audience",
    summary: "Bulk-load contacts and templates from CSV.",
    body: () => (
      <Prose>
        <p>Open <PathPill>Contacts → Import / Export</PathPill> and pick a tab.</p>
        <h3>Contacts CSV</h3>
        <ul>
          <li>Required: <code>phone_number</code>.</li>
          <li>Standard: <code>name</code>, <code>tags</code> (semicolon-separated), <code>email</code>, <code>lifecycle_stage</code>.</li>
          <li>Any other column becomes a <code>custom_fields</code> entry.</li>
          <li>Existing rows are matched by phone and updated; new rows are inserted.</li>
        </ul>
        <h3>Templates CSV</h3>
        <ul>
          <li>Imported as <Badge variant="secondary">LOCAL</Badge> drafts. Submit them to Meta from Templates.</li>
        </ul>
      </Prose>
    ),
  },
  {
    id: "duplicates",
    title: "Duplicate merge",
    section: "Audience",
    summary: "Find and merge contacts with the same phone or email.",
    body: () => (
      <Prose>
        <p>
          KonnectX groups contacts by normalised phone (or email) and lets you pick a master record.
          Tags, custom fields, conversations, and messages are merged into the master; duplicates are deleted.
        </p>
        <Callout tone="warn">Merging is irreversible — review each group before confirming.</Callout>
      </Prose>
    ),
  },
  {
    id: "segments",
    title: "Segments",
    section: "Audience",
    summary: "Saved filters used as audiences for campaigns.",
    body: () => (
      <Prose>
        <p>Build conditions on tags, lifecycle stage, custom fields, and last-message recency. Save the segment, then use it as the audience for a campaign or automation.</p>
      </Prose>
    ),
  },

  // Automation
  {
    id: "rules",
    title: "Auto-reply rules",
    section: "Automation",
    summary: "Trigger replies on keywords, with cooldowns and office hours.",
    body: () => (
      <Prose>
        <ul>
          <li><b>Match modes</b>: any keyword, all keywords, exact phrase.</li>
          <li><b>Cooldown</b> prevents the same contact triggering the same rule repeatedly.</li>
          <li><b>Office hours</b> restrict when a rule fires (per weekday + timezone).</li>
          <li>Reply with free-form text or a template (variables supported).</li>
        </ul>
      </Prose>
    ),
  },
  {
    id: "flows",
    title: "Flows",
    section: "Automation",
    summary: "Multi-step automations triggered by events or keywords.",
    body: () => (
      <Prose>
        <p>Build a step-by-step flow: send → wait → branch on reply → send again. Each run is logged so you can debug stuck contacts.</p>
      </Prose>
    ),
  },
  {
    id: "ai-tagging",
    title: "AI tagging & sentiment",
    section: "Automation",
    summary: "Automatic classification of inbound messages.",
    body: () => (
      <Prose>
        <p>
          Inbound messages are sent to the <code>wa-classify-message</code> function, which uses the
          configured AI model to assign:
        </p>
        <ul>
          <li><b>Tags</b> — e.g. <Badge variant="secondary">lead</Badge>, <Badge variant="secondary">support</Badge>, <Badge variant="secondary">complaint</Badge>.</li>
          <li><b>Sentiment</b> — positive, neutral, negative.</li>
        </ul>
        <p>Configure the model in <PathPill>Settings → AI</PathPill>. Lovable AI is the default; you can plug in a custom OpenAI-compatible endpoint with your own API key.</p>
      </Prose>
    ),
  },

  // Growth
  {
    id: "campaigns",
    title: "Campaigns",
    section: "Growth",
    summary: "Bulk template sends with pacing, variants, and reporting.",
    body: () => (
      <Prose>
        <ol>
          <li>Pick a template and audience (segment or filter).</li>
          <li>Map template variables to contact fields.</li>
          <li>Optionally add A/B variants (auto-pick winner by read rate).</li>
          <li>Set pacing (msgs/min) to stay under Meta rate limits.</li>
          <li>Schedule or send now. Track sent / delivered / read / failed live.</li>
        </ol>
      </Prose>
    ),
  },
  {
    id: "analytics",
    title: "Analytics",
    section: "Growth",
    summary: "Conversation volume, response time, and template performance.",
    body: () => (
      <Prose>
        <ul>
          <li><b>Volume</b> — inbound vs outbound by day.</li>
          <li><b>Response time</b> — median and p90 to first agent reply.</li>
          <li><b>Template performance</b> — sent, read rate, reply rate per template.</li>
          <li><b>Tag mix</b> — distribution of AI auto-tags over time.</li>
        </ul>
      </Prose>
    ),
  },
  {
    id: "billing",
    title: "Usage & billing",
    section: "Growth",
    summary: "Conversation counts and estimated Meta cost.",
    body: () => (
      <Prose>
        <p>
          Each conversation Meta opens (marketing / utility / authentication / service) is captured
          in <code>wa_billing_events</code>. The page shows monthly totals, a 6-month trend, and an
          estimated cost based on Meta's current rate card for your country.
        </p>
        <Callout tone="info">Estimates ≠ invoice. Always reconcile with the Meta billing dashboard.</Callout>
      </Prose>
    ),
  },

  // Developer
  {
    id: "outbound-webhooks",
    title: "Outbound webhooks",
    section: "Developer",
    summary: "Push events to your own systems.",
    body: () => (
      <Prose>
        <p>Configure URLs in <PathPill>Webhooks out</PathPill>. Each webhook has:</p>
        <ul>
          <li>A signing <b>secret</b> (rotate any time).</li>
          <li>A list of <b>events</b> to subscribe to (e.g. <code>message.received</code>).</li>
          <li>Automatic <b>retries</b> with exponential backoff (3 attempts).</li>
        </ul>
      </Prose>
    ),
  },
  {
    id: "webhook-payloads",
    title: "Webhook payloads",
    section: "Developer",
    summary: "Schema and signing for outbound webhook calls.",
    body: () => (
      <Prose>
        <h3>Headers</h3>
        <CodeBlock>{`X-Konnectx-Event: message.received
X-Konnectx-Signature: sha256=<hex>
X-Konnectx-Delivery: <uuid>
Content-Type: application/json`}</CodeBlock>
        <h3>Body example — <code>message.received</code></h3>
        <CodeBlock>{`{
  "event": "message.received",
  "occurred_at": "2026-04-24T10:12:33Z",
  "data": {
    "conversation_id": "…",
    "contact": { "phone_number": "+15551234567", "name": "Alice" },
    "message": { "id": "…", "type": "text", "body": "Hi!" }
  }
}`}</CodeBlock>
        <h3>Verifying the signature</h3>
        <CodeBlock>{`const expected = "sha256=" + crypto
  .createHmac("sha256", SECRET)
  .update(rawBody)
  .digest("hex");
if (expected !== req.headers["x-konnectx-signature"]) reject();`}</CodeBlock>
      </Prose>
    ),
  },
  {
    id: "errors",
    title: "Errors & retries",
    section: "Developer",
    summary: "How KonnectX handles Meta errors and webhook failures.",
    body: () => (
      <Prose>
        <ul>
          <li>Meta send errors are stored on <code>wa_send_attempts.error_code</code> and surfaced in the inbox.</li>
          <li>Outbound webhook deliveries retry on non-2xx with backoff: 30s, 2m, 10m.</li>
          <li>After 3 failed attempts a webhook is flagged with <code>last_status=failed</code> — fix and re-test.</li>
        </ul>
      </Prose>
    ),
  },

  // Reference
  {
    id: "shortcuts",
    title: "Keyboard shortcuts",
    section: "Reference",
    summary: "Move faster around KonnectX.",
    body: () => (
      <Prose>
        <table>
          <thead><tr><th>Shortcut</th><th>Action</th></tr></thead>
          <tbody>
            <tr><td><Kbd>/</Kbd></td><td>Focus search</td></tr>
            <tr><td><Kbd>g</Kbd> <Kbd>i</Kbd></td><td>Go to Inbox</td></tr>
            <tr><td><Kbd>g</Kbd> <Kbd>c</Kbd></td><td>Go to Contacts</td></tr>
            <tr><td><Kbd>g</Kbd> <Kbd>t</Kbd></td><td>Go to Templates</td></tr>
            <tr><td><Kbd>n</Kbd></td><td>New message / contact (context)</td></tr>
            <tr><td><Kbd>?</Kbd></td><td>Show this list</td></tr>
          </tbody>
        </table>
        <p className="text-xs text-muted-foreground">Some shortcuts are still rolling out.</p>
      </Prose>
    ),
  },
  {
    id: "glossary",
    title: "Glossary",
    section: "Reference",
    summary: "Plain-English definitions of WhatsApp Cloud API terms.",
    body: () => (
      <Prose>
        <dl className="space-y-2">
          <div><dt className="font-semibold">WABA</dt><dd>WhatsApp Business Account — the Meta entity that owns one or more phone numbers.</dd></div>
          <div><dt className="font-semibold">Phone number ID</dt><dd>Meta's identifier for a single WhatsApp business number.</dd></div>
          <div><dt className="font-semibold">Conversation</dt><dd>A 24-hour billing window between your number and one user.</dd></div>
          <div><dt className="font-semibold">Template</dt><dd>A pre-approved message format required for outbound initiation.</dd></div>
          <div><dt className="font-semibold">Quality rating</dt><dd>Meta's health score for your number (Green / Yellow / Red).</dd></div>
        </dl>
      </Prose>
    ),
  },
  {
    id: "faq",
    title: "FAQ",
    section: "Reference",
    summary: "Answers to the questions we hear most often.",
    body: () => (
      <Prose>
        <h3>Why was my template rejected?</h3>
        <p>Common reasons: promotional content in UTILITY category, missing variable samples, or links to disallowed domains. See the rejection reason on the template card.</p>
        <h3>Can I message a user without a template?</h3>
        <p>Only inside the 24-hour customer service window after their last inbound message.</p>
        <h3>How do opt-outs work?</h3>
        <p>Set <code>opted_out_at</code> on a contact (manually or via an automation rule on keywords like "STOP"). Opted-out contacts are excluded from MARKETING campaigns.</p>
        <h3>Where are my secrets stored?</h3>
        <p>In the database, server-side. They never appear in the browser bundle or in API responses.</p>
      </Prose>
    ),
  },
];

const articleById = Object.fromEntries(articles.map((a) => [a.id, a]));

// --- Small presentational helpers (kept in-file for a single-import page) ---
function Prose({ children }) {
  return (
    <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-headings:font-semibold prose-h3:mt-6 prose-h3:mb-2 prose-p:leading-relaxed prose-li:my-1 prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.85em] prose-code:before:content-none prose-code:after:content-none prose-strong:text-foreground prose-a:text-primary">
      {children}
    </div>
  );
}

function PathPill({ children }) {
  return <span className="inline-flex items-center rounded-md border border-border bg-muted/50 px-1.5 py-0.5 text-[0.8em] font-medium text-foreground">{children}</span>;
}

function Kbd({ children }) {
  return <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.8em] text-foreground shadow-sm">{children}</kbd>;
}

function KbdLink({ children }) {
  return <span className="font-medium text-primary">{children}</span>;
}

function Callout({ tone = "info", children }) {
  const styles = {
    info: "border-primary/30 bg-primary/5 text-foreground",
    success: "border-success/30 bg-success/5 text-foreground",
    warn: "border-warning/40 bg-warning/5 text-foreground",
  }[tone];
  return <div className={`my-3 rounded-lg border ${styles} p-3 text-sm`}>{children}</div>;
}

function CodeBlock({ children }) {
  return (
    <pre className="my-3 overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

export function Docs() {
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

  // keyboard: "/" focuses search
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        document.getElementById("docs-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const article = articleById[active];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-6 lg:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary" className="gap-1"><BookOpen className="h-3 w-3" /> Documentation</Badge>
            <h1 className="text-3xl font-bold tracking-tight">KonnectX docs</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Everything you need to set up WhatsApp, send your first campaign, automate replies, and integrate with your stack.
            </p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="docs-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search docs (press /)"
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Body grid */}
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar nav */}
        <aside className="hidden lg:block">
          <div className="sticky top-2 rounded-xl border border-border bg-card/50">
            <ScrollArea className="h-[calc(100dvh-220px)]">
              <nav className="space-y-4 p-3">
                {sections.map((sec) => (
                  <div key={sec.id}>
                    <div className="mb-1.5 flex items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <sec.icon className="h-3.5 w-3.5" />
                      {sec.label}
                    </div>
                    <ul className="space-y-0.5">
                      {sec.items.map((it) => {
                        const isActive = active === it.id;
                        return (
                          <li key={it.id}>
                            <button
                              onClick={() => { setActive(it.id); setQuery(""); }}
                              className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors ${isActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}
                            >
                              <span className="truncate">{it.label}</span>
                              {isActive && <ChevronRight className="h-3.5 w-3.5" />}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </nav>
            </ScrollArea>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0">
          {results ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Search results for "{query}"</CardTitle>
                <CardDescription>{results.length} match{results.length === 1 ? "" : "es"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {results.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nothing matched. Try a different keyword.</p>
                )}
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { setActive(r.id); setQuery(""); }}
                    className="flex w-full items-start justify-between gap-3 rounded-lg border border-border bg-background p-3 text-left transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{r.title}</span>
                        <Badge variant="outline" className="text-[10px]">{r.section}</Badge>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{r.summary}</p>
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </CardContent>
            </Card>
          ) : article ? (
            <article className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{article.section}</p>
                <h2 className="text-2xl font-bold tracking-tight">{article.title}</h2>
                <p className="text-sm text-muted-foreground">{article.summary}</p>
              </div>
              <Separator />
              <Card>
                <CardContent className="pt-6">
                  {article.body()}
                </CardContent>
              </Card>

              {/* Related */}
              <RelatedNav activeId={active} onSelect={setActive} />
            </article>
          ) : null}

          {/* Help footer */}
          <Card className="mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Need more help?</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm" className="gap-1">
                <a href="https://developers.facebook.com/docs/whatsapp/cloud-api" target="_blank" rel="noreferrer">
                  Meta Cloud API <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-1">
                <a href="https://business.whatsapp.com/policy" target="_blank" rel="noreferrer">
                  WhatsApp Business policy <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

function RelatedNav({ activeId, onSelect }) {
  const idx = articles.findIndex((a) => a.id === activeId);
  const prev = idx > 0 ? articles[idx - 1] : null;
  const next = idx >= 0 && idx < articles.length - 1 ? articles[idx + 1] : null;
  if (!prev && !next) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {prev ? (
        <button onClick={() => onSelect(prev.id)} className="group rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted/40">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Previous</p>
          <p className="mt-0.5 font-medium group-hover:text-primary">{prev.title}</p>
        </button>
      ) : <span />}
      {next ? (
        <button onClick={() => onSelect(next.id)} className="group rounded-lg border border-border bg-card p-3 text-right transition-colors hover:bg-muted/40">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Next</p>
          <p className="mt-0.5 font-medium group-hover:text-primary">{next.title}</p>
        </button>
      ) : <span />}
    </div>
  );
}
