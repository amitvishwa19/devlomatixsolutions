export const DOCUMENT_TEMPLATES = [
    {
        id: "meeting-notes",
        title: "Meeting Notes & Action Items",
        description: "Capture objectives, discussion takeaways, decisions, and clear action owners.",
        category: "GENERAL",
        icon: "Users",
        content: `<h2>🎯 Meeting Objectives & Agenda</h2>
<p><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} | <strong>Time:</strong> 10:00 AM - 11:00 AM</p>
<p><strong>Attendees:</strong> @TeamLead, @ProductManager, @TechLead, @Designer</p>
<p><strong>Goal:</strong> Align on product milestones, unblock pending deliverables, and review sprint roadmap.</p>
<hr/>
<h2>💬 Key Discussion Points</h2>
<ul>
  <li><strong>Milestone Progress:</strong> Core features are 80% completed; QA testing scheduled for next sprint.</li>
  <li><strong>Customer Feedback:</strong> Users requested faster search response and mobile layout optimizations.</li>
  <li><strong>Technical Architecture:</strong> Evaluated database caching strategies to reduce latency.</li>
</ul>
<hr/>
<h2>✅ Decisions Made</h2>
<ul>
  <li>Approved the v2 redesign roadmap with focus on AI workspace tools.</li>
  <li>Agreed on deploying beta release by Friday next week.</li>
</ul>
<hr/>
<h2>📋 Action Items & Next Steps</h2>
<p>• <strong>[High Priority]</strong> Finalize API endpoints by Wednesday — <em>@TechLead</em></p>
<p>• <strong>[Medium Priority]</strong> Update design system tokens in Figma — <em>@Designer</em></p>
<p>• <strong>[Medium Priority]</strong> Prepare QA test cases and staging environment — <em>@QA</em></p>`
    },
    {
        id: "prd-spec",
        title: "Product Requirement Document (PRD)",
        description: "Comprehensive product blueprint outlining problem, requirements, user stories, and rollout.",
        category: "SPECIFICATION",
        icon: "FileCode",
        content: `<h1>🚀 Product Requirement Document (PRD)</h1>
<p><strong>Document Owner:</strong> Product Management Team | <strong>Status:</strong> DRAFT | <strong>Target Release:</strong> Q3 2026</p>
<hr/>
<h2>1. Executive Summary & Problem Statement</h2>
<p>Modern workspace teams struggle with fragmented documentation, slow manual search, and disconnected AI tools. This initiative unifies asset management with embedded AI intelligence and seamless cross-module workflows.</p>

<h2>2. Goals & Success Metrics (KPIs)</h2>
<ul>
  <li>Increase team document discovery speed by <strong>45%</strong>.</li>
  <li>Achieve <strong>90%+</strong> daily active collaborator adoption within 30 days of launch.</li>
  <li>Maintain 99.9% uptime for cloud storage and file streaming.</li>
</ul>

<h2>3. User Personas & Core User Stories</h2>
<ul>
  <li><strong>As a Project Manager:</strong> I want to organize team assets in colored folders so I can access sprint docs quickly.</li>
  <li><strong>As an Engineer:</strong> I want to extract summaries and action items using AI so I can implement requirements without reading 20-page briefs.</li>
  <li><strong>As an Executive:</strong> I want to export clean PDF status reports with 1 click.</li>
</ul>

<h2>4. Functional Requirements & Scope</h2>
<ul>
  <li><strong>AI Document Hub:</strong> Instant summary, action items extraction, and interactive Q&A.</li>
  <li><strong>Templates Library:</strong> One-click scaffolding for meetings, specs, and reports.</li>
  <li><strong>Export Suite:</strong> High-fidelity PDF, Markdown, and HTML downloads.</li>
</ul>

<h2>5. Rollout Timeline & Milestones</h2>
<p>• <strong>Phase 1 (Alpha):</strong> Internal team dogfooding and QA verification.</p>
<p>• <strong>Phase 2 (Beta):</strong> Pilot release to 50 active workspace power users.</p>
<p>• <strong>Phase 3 (GA):</strong> General availability rollout and documentation.</p>`
    },
    {
        id: "tech-spec",
        title: "Technical Architecture Spec",
        description: "Engineering design doc detailing system architecture, data models, and API interfaces.",
        category: "SPECIFICATION",
        icon: "Layers",
        content: `<h1>📑 Technical Architecture & System Design</h1>
<p><strong>Author:</strong> Engineering Team | <strong>Reviewers:</strong> Lead Architect | <strong>System:</strong> Document Microservice</p>
<hr/>
<h2>1. Architecture Overview</h2>
<p>This service provides high-performance document indexing, multi-tier storage caching, and asynchronous AI vector embeddings.</p>

<h2>2. Data Model & Schema Design</h2>
<pre><code>model WorkspaceDocument {
  id          String   @id @default(cuid())
  name        String
  content     String?  @db.Text
  fileUrl     String?
  parentId    String?
  isFolder    Boolean  @default(false)
  category    String?  @default("GENERAL")
  status      String   @default("APPROVED")
  tags        String[]
}</code></pre>

<h2>3. Server Action Interfaces</h2>
<ul>
  <li><code>createDocument(workspaceId, data)</code> — Upload file or create structured rich note.</li>
  <li><code>runDocumentAi(workspaceId, docId, { action })</code> — Run Gemini AI summarization and Q&A.</li>
  <li><code>duplicateDocument(workspaceId, docId)</code> — Clone document with full attributes.</li>
</ul>

<h2>4. Security & Access Permissions</h2>
<p>All server actions enforce session-based authentication and workspace RBAC policies (Viewer, Editor, Owner).</p>`
    },
    {
        id: "weekly-report",
        title: "Weekly Executive Status Report",
        description: "Concise weekly update for leadership covering highlights, metrics, blockers, and goals.",
        category: "REPORT",
        icon: "BarChart3",
        content: `<h1>📊 Weekly Executive Status Report</h1>
<p><strong>Week Ending:</strong> ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} | <strong>Department:</strong> Product & Engineering</p>
<hr/>
<h2>🌟 Key Highlights & Major Wins</h2>
<ul>
  <li>Shipped v2 Document Management Hub with folder-level uploads and nested hierarchies.</li>
  <li>Decreased cloud file upload latency by 35% across all file types.</li>
  <li>Integrated Google Gemini AI for instant summaries and action item extractions.</li>
</ul>

<h2>📈 Core Metrics & Performance</h2>
<ul>
  <li><strong>Active Documents Created:</strong> 142 (+28% WoW)</li>
  <li><strong>Storage Utilized:</strong> 4.8 GB / 50 GB Quota</li>
  <li><strong>AI Queries Processed:</strong> 310 queries with 99.4% accuracy rating</li>
</ul>

<h2>🚧 Active Blockers & Risks</h2>
<ul>
  <li><em>None currently. Staging infrastructure is operating normally.</em></li>
</ul>

<h2>🎯 Next Week Priorities</h2>
<ul>
  <li>Deploy automated document OCR text extraction.</li>
  <li>Roll out multi-user live co-editing beta test.</li>
</ul>`
    },
    {
        id: "sop-guide",
        title: "Standard Operating Procedure (SOP)",
        description: "Step-by-step operational guide ensuring consistent team execution and quality standards.",
        category: "GENERAL",
        icon: "FileText",
        content: `<h1>🛠️ Standard Operating Procedure (SOP)</h1>
<p><strong>SOP ID:</strong> SOP-DOC-001 | <strong>Effective Date:</strong> ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} | <strong>Version:</strong> 1.0</p>
<hr/>
<h2>1. Purpose & Objectives</h2>
<p>To establish standardized conventions for file naming, categorization, and version control across all workspace assets.</p>

<h2>2. Scope & Applicability</h2>
<p>Applies to all team members creating, uploading, or sharing documents within this workspace.</p>

<h2>3. Step-by-Step Guidelines</h2>
<ol>
  <li><strong>Naming Convention:</strong> Use <code>[Category]_[ProjectName]_[YYYY-MM]</code> (e.g. <code>SPEC_CheckoutRedesign_2026-08</code>).</li>
  <li><strong>Tagging:</strong> Attach at least 2 relevant tags (e.g. <code>#frontend</code>, <code>#q3-launch</code>).</li>
  <li><strong>Folder Structure:</strong> Place deliverables in designated department directories rather than the root directory.</li>
  <li><strong>Status Management:</strong> Move documents to <code>REVIEW</code> before sharing with clients or team leads.</li>
</ol>`
    }
];
