import { useState } from "react";
import {
  LayoutDashboard, Briefcase, Users, Kanban, Calendar, BarChart3,
  UserSearch, FileText, FileCheck, GitCompare, PieChart, Zap, Shield,
  Globe, UsersRound, UserPlus, ScrollText, Settings, Search,
  ChevronRight, BookOpen, ArrowLeft, CheckCircle2, Info, Lightbulb
} from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const sections = [
  {
    id: "overview",
    title: "Platform Overview",
    icon: BookOpen,
    content: {
      description: "HireFlow is a comprehensive Applicant Tracking System (ATS) designed to streamline your entire recruitment workflow — from job posting to candidate onboarding. Built for modern HR teams across India, it brings together hiring pipelines, interview scheduling, analytics, and compliance in one unified platform.",
      features: [
        "End-to-end recruitment lifecycle management",
        "AI-powered candidate matching and resume parsing",
        "Collaborative hiring with team scorecards and notes",
        "Built-in compliance with Indian labour regulations",
        "Customisable career page builder",
        "Real-time analytics and reporting dashboards",
      ],
    },
  },
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    route: "/admin",
    content: {
      description: "The Dashboard provides a real-time snapshot of your hiring activity. It displays key metrics, recent activity, and quick actions to help you stay on top of your recruitment pipeline.",
      features: [
        "Active jobs count with status breakdown",
        "Total candidates and new applications this week",
        "Upcoming interviews for the next 7 days",
        "Hiring funnel conversion metrics",
        "Recent activity feed showing latest actions",
        "Quick action buttons for common tasks",
      ],
      tips: [
        "Check the dashboard first thing each morning to prioritise your day",
        "Use the activity feed to catch up on team actions overnight",
      ],
    },
  },
  {
    id: "jobs",
    title: "Job Management",
    icon: Briefcase,
    route: "/admin/jobs",
    content: {
      description: "Create, manage, and track all your job openings from a single view. Each job listing includes details like department, location, salary range, and required skills. You can publish jobs to your career page or keep them as internal drafts.",
      features: [
        "Create new job postings with detailed descriptions",
        "AI-powered job description generator for faster posting",
        "Set job status: Draft, Active, Paused, or Closed",
        "Assign hiring managers and recruitment teams",
        "Track number of applicants per job",
        "Filter and search jobs by department, location, or status",
        "Duplicate existing jobs to save time",
      ],
      tips: [
        "Use the AI Job Description Generator to create compelling, inclusive job descriptions",
        "Keep closed positions archived for future reference and compliance",
      ],
    },
  },
  {
    id: "candidates",
    title: "Candidate Management",
    icon: Users,
    route: "/admin/candidates",
    content: {
      description: "The Candidates section is your central repository for all applicant information. View, search, filter, and manage candidates across all job openings. Each candidate profile includes their resume, application history, interview notes, scorecards, and communication timeline.",
      features: [
        "Comprehensive candidate profiles with contact details",
        "Resume upload and AI-powered resume parsing",
        "Candidate stage tracking (Applied → Screening → Interview → Offer → Hired)",
        "Star ratings and detailed scorecards",
        "Collaborative notes and team feedback",
        "AI candidate summary for quick evaluation",
        "Bulk actions: move stage, send emails, archive",
        "Advanced filters by skills, experience, location, and rating",
      ],
      tips: [
        "Use the AI Candidate Summary to quickly assess a candidate's fit",
        "Add structured notes after every interaction for team transparency",
      ],
    },
  },
  {
    id: "pipeline",
    title: "Hiring Pipeline",
    icon: Kanban,
    route: "/admin/pipeline",
    content: {
      description: "The Pipeline view provides a Kanban-style board to visualise candidates moving through your hiring stages. Drag and drop candidates between stages, and get a bird's-eye view of where every candidate stands across all open positions.",
      features: [
        "Kanban board with customisable stages",
        "Drag-and-drop candidate movement between stages",
        "Filter pipeline by job, department, or recruiter",
        "Stage-wise candidate count and conversion rates",
        "Quick actions: schedule interview, send email, add notes",
        "Colour-coded cards by priority or rating",
      ],
      tips: [
        "Review the pipeline weekly to identify bottlenecks in your hiring process",
        "Use filters to focus on specific jobs when managing high-volume hiring",
      ],
    },
  },
  {
    id: "interviews",
    title: "Interview Scheduling",
    icon: Calendar,
    route: "/admin/interviews",
    content: {
      description: "Manage all interview schedules, panellists, and feedback from one place. The interview calendar integrates with your hiring pipeline to ensure smooth coordination between recruiters, hiring managers, and candidates.",
      features: [
        "Calendar view for all upcoming interviews",
        "Schedule interviews with date, time, and panellist assignment",
        "AI-generated interview questions based on job requirements",
        "Interview type support: Phone, Video, In-person, Panel",
        "Send interview invitations and reminders",
        "Collect interviewer feedback and scorecards post-interview",
        "Reschedule or cancel with automatic notifications",
      ],
      tips: [
        "Use AI Interview Questions to prepare structured, role-specific question sets",
        "Always confirm panellist availability before sending invites to candidates",
      ],
    },
  },
  {
    id: "talent-pool",
    title: "Talent Pool",
    icon: UserSearch,
    route: "/admin/talent-pool",
    content: {
      description: "Build and maintain a database of potential candidates for future openings. The Talent Pool lets you tag, categorise, and nurture relationships with promising professionals even before a suitable role opens up.",
      features: [
        "Add candidates to talent pools by skill or department",
        "Tag candidates for specific future roles",
        "Search and filter the talent pool by skills, experience, and location",
        "Move talent pool candidates directly into active job pipelines",
        "Track engagement and last contact date",
        "Import candidates from external sources",
      ],
      tips: [
        "Regularly review silver-medal candidates from closed positions — they may be perfect for the next opening",
        "Keep talent pool profiles updated with recent interactions",
      ],
    },
  },
  {
    id: "resumes",
    title: "Resume Bank",
    icon: FileText,
    route: "/admin/resumes",
    content: {
      description: "The Resume Bank is a searchable repository of all uploaded resumes. Use AI-powered parsing to extract skills, experience, and education automatically. Search across your entire resume database to find the right candidate for any role.",
      features: [
        "Centralised resume storage with preview",
        "AI resume parsing: auto-extract name, email, phone, skills, and experience",
        "Full-text search across all resumes",
        "Filter by skills, years of experience, education, and location",
        "Auto-match scores to rank candidates against job requirements",
        "Bulk resume upload support",
      ],
      tips: [
        "Upload resumes in PDF format for best parsing accuracy",
        "Use the Auto-Match Score to quickly shortlist candidates for new openings",
      ],
    },
  },
  {
    id: "offers",
    title: "Offer Management",
    icon: FileCheck,
    route: "/admin/offers",
    content: {
      description: "Streamline your offer process from creation to acceptance. Generate offer letters, track approval workflows, and monitor offer statuses — all within HireFlow.",
      features: [
        "Create and customise offer letters with templates",
        "Set compensation details: CTC, joining bonus, benefits",
        "Multi-level offer approval workflows",
        "Track offer status: Draft, Pending Approval, Sent, Accepted, Declined",
        "Send offers digitally with e-signature support",
        "Set offer expiry dates and send reminders",
        "Compare offers across candidates for the same role",
      ],
      tips: [
        "Always have offers approved by the hiring manager and HR head before sending",
        "Set reasonable expiry dates — typically 5-7 business days",
      ],
    },
  },
  {
    id: "compare",
    title: "Candidate Comparison",
    icon: GitCompare,
    route: "/admin/compare",
    content: {
      description: "Compare candidates side-by-side to make informed hiring decisions. View scorecards, ratings, skills, experience, and interview feedback in a structured comparison view.",
      features: [
        "Side-by-side candidate comparison (up to 4 candidates)",
        "Compare ratings, skills, experience, and education",
        "View aggregated scorecard results",
        "Compare interview feedback across panellists",
        "Highlight strengths and gaps for each candidate",
        "Export comparison report for stakeholder review",
      ],
      tips: [
        "Use comparison view when you have 2-3 strong finalists to present to the hiring manager",
        "Focus on role-specific skills rather than overall scores",
      ],
    },
  },
  {
    id: "analytics",
    title: "Analytics",
    icon: BarChart3,
    route: "/admin/analytics",
    content: {
      description: "Gain deep insights into your recruitment performance with interactive charts and metrics. Track time-to-hire, source effectiveness, pipeline conversion rates, and team productivity.",
      features: [
        "Time-to-hire and time-to-fill metrics by job and department",
        "Source effectiveness: which channels bring the best candidates",
        "Pipeline conversion funnel with stage-wise drop-off analysis",
        "Recruiter productivity and workload distribution",
        "Offer acceptance rate trends",
        "Diversity and inclusion metrics",
        "Custom date range filters",
      ],
      tips: [
        "Review analytics monthly to identify and fix hiring bottlenecks",
        "Track source effectiveness to optimise your recruitment budget",
      ],
    },
  },
  {
    id: "reports",
    title: "Reports",
    icon: PieChart,
    route: "/admin/reports",
    content: {
      description: "Generate detailed recruitment reports for stakeholders, leadership, and compliance. Choose from pre-built report templates or create custom reports with the metrics that matter most to your organisation.",
      features: [
        "Pre-built report templates: Hiring Summary, Pipeline Status, Interview Activity",
        "Custom report builder with drag-and-drop metrics",
        "Export reports as PDF or CSV",
        "Schedule recurring reports via email",
        "Department-wise and location-wise breakdowns",
        "Historical trend analysis",
      ],
      tips: [
        "Schedule weekly pipeline reports for hiring managers automatically",
        "Use PDF exports for board presentations and CSV for further data analysis",
      ],
    },
  },
  {
    id: "onboarding",
    title: "Onboarding",
    icon: UserPlus,
    route: "/admin/onboarding",
    content: {
      description: "Manage the transition from candidate to employee. Create onboarding checklists, assign tasks, collect documents, and ensure every new hire has a smooth first-day experience.",
      features: [
        "Onboarding task checklists by role and department",
        "Document collection: Aadhaar, PAN, bank details, photos",
        "Assign onboarding buddies and mentors",
        "Track onboarding completion status",
        "Welcome email and first-day information packs",
        "IT asset and access provisioning tracking",
        "Probation period reminders",
      ],
      tips: [
        "Start the onboarding checklist as soon as an offer is accepted",
        "Assign an onboarding buddy to help new hires settle in faster",
      ],
    },
  },
  {
    id: "workflows",
    title: "Workflow Automation",
    icon: Zap,
    route: "/admin/workflows",
    content: {
      description: "Automate repetitive recruitment tasks to save time and ensure consistency. Set up triggers and actions for stage changes, email notifications, task assignments, and more.",
      features: [
        "Trigger-based automation: when candidate moves to stage → perform action",
        "Auto-send rejection emails when candidates are archived",
        "Auto-assign reviewers when applications are received",
        "Schedule follow-up reminders for pending actions",
        "Notification rules for team members",
        "Email template integration for automated communications",
        "Workflow templates for common hiring processes",
      ],
      tips: [
        "Start with simple automations like auto-acknowledgement emails, then build up",
        "Review workflow logs regularly to ensure automations are firing correctly",
      ],
    },
  },
  {
    id: "compliance",
    title: "Compliance",
    icon: Shield,
    route: "/admin/compliance",
    content: {
      description: "Stay compliant with Indian labour laws and data protection regulations. Track EEO data, manage consent, handle data retention policies, and generate compliance reports.",
      features: [
        "DPDP Act (Digital Personal Data Protection) compliance tools",
        "Candidate data consent management",
        "Data retention policy configuration and auto-purge",
        "EEO and diversity tracking (optional, anonymised)",
        "Right to erasure: candidate data deletion requests",
        "Audit-ready compliance reports",
        "GDPR compliance for international candidates",
      ],
      tips: [
        "Set up data retention policies early — don't wait until you have thousands of records",
        "Always obtain explicit consent before storing candidate data",
      ],
    },
  },
  {
    id: "career-page",
    title: "Career Page Builder",
    icon: Globe,
    route: "/admin/career-page",
    content: {
      description: "Build a branded career page that showcases your company culture and open positions. Customise the layout, colours, and content to attract top talent directly to your website.",
      features: [
        "Drag-and-drop career page builder",
        "Company branding: logo, colours, and custom messaging",
        "Auto-sync with active job listings",
        "Embedded application forms",
        "Employee testimonials and team photos section",
        "Mobile-responsive design",
        "SEO-optimised job listing pages",
        "Custom domain support",
      ],
      tips: [
        "Add employee testimonials and team photos to humanise your brand",
        "Keep your career page updated — remove filled positions promptly",
      ],
    },
  },
  {
    id: "team-workload",
    title: "Team Workload",
    icon: UsersRound,
    route: "/admin/team-workload",
    content: {
      description: "Monitor how work is distributed across your recruitment team. Track each recruiter's active assignments, interview load, and hiring metrics to ensure balanced and efficient workloads.",
      features: [
        "Recruiter-wise active job assignments",
        "Interview load distribution",
        "Candidates managed per recruiter",
        "Capacity planning and workload alerts",
        "Performance metrics: time-to-fill, candidates processed",
        "Reassign jobs and candidates between team members",
      ],
      tips: [
        "Rebalance workloads when any recruiter exceeds 15 active requisitions",
        "Use workload data during team stand-ups to coordinate priorities",
      ],
    },
  },
  {
    id: "audit-log",
    title: "Audit Log",
    icon: ScrollText,
    route: "/admin/audit-log",
    content: {
      description: "The Audit Log records every action taken in the system with full user attribution and timestamps. It provides a complete trail of who did what, when — essential for accountability, compliance, and troubleshooting.",
      features: [
        "Complete action history with timestamps",
        "User attribution for every action",
        "Filter by action type, user, date range, and entity",
        "Track stage changes, note additions, and score submissions",
        "Settings change tracking",
        "Export audit logs for compliance reviews",
        "Search across all logged events",
      ],
      tips: [
        "Review audit logs during compliance audits to demonstrate due process",
        "Use filters to investigate specific incidents or candidate-related actions",
      ],
    },
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    route: "/admin/settings",
    content: {
      description: "Configure your HireFlow instance to match your organisation's needs. Manage company details, user accounts, email templates, notification preferences, and system-wide defaults.",
      features: [
        "Company profile: name, logo, and contact details",
        "User management: add, edit, and deactivate team members",
        "Role-based access control (Admin, Recruiter, Hiring Manager, Viewer)",
        "Email template management for all communication types",
        "Notification preferences per user",
        "Pipeline stage customisation",
        "Integration settings for third-party tools",
        "Data export and backup options",
      ],
      tips: [
        "Set up role-based access before inviting your full team",
        "Customise email templates to match your company's voice and branding",
      ],
    },
  },
];

const faqs = [
  {
    question: "How do I add a new candidate?",
    answer: "Go to Candidates → click 'Add Candidate' button. Fill in the candidate's details including name, email, phone, and upload their resume. You can also add candidates directly from the Pipeline view.",
  },
  {
    question: "How do I move a candidate to the next stage?",
    answer: "You can move candidates in two ways: (1) From the Pipeline view, drag and drop the candidate card to the next stage column. (2) From the Candidate Detail page, click the stage progress bar and select the new stage.",
  },
  {
    question: "How do I schedule an interview?",
    answer: "Navigate to Interviews → click 'Schedule Interview'. Select the candidate, choose the interview type (Phone, Video, In-person), set the date and time, and assign panellists. The system will send invitations automatically.",
  },
  {
    question: "Can I bulk import candidates?",
    answer: "Yes, go to Candidates → click 'Bulk Actions' → 'Import'. Upload a CSV file with candidate details. The system will parse and create candidate profiles automatically. You can also bulk upload resumes via the Resume Bank.",
  },
  {
    question: "How do I generate reports?",
    answer: "Go to Reports → select a pre-built template or create a custom report. Set your date range and filters, then click 'Generate'. Reports can be exported as PDF or CSV, and you can schedule recurring reports.",
  },
  {
    question: "How do I set up workflow automations?",
    answer: "Navigate to Workflows → click 'Create Workflow'. Define a trigger (e.g., 'When candidate moves to Interview stage') and an action (e.g., 'Send interview prep email'). Save and activate the workflow.",
  },
  {
    question: "How do I customise my career page?",
    answer: "Go to Career Page → use the drag-and-drop builder to add sections, update your company branding, add team photos and testimonials. Active jobs are automatically synced. Preview your page before publishing.",
  },
  {
    question: "How do I manage team permissions?",
    answer: "Go to Settings → User Management. Each user can be assigned a role: Admin (full access), Recruiter (manage candidates and jobs), Hiring Manager (view and evaluate assigned candidates), or Viewer (read-only access).",
  },
];

const HelpDocumentation = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("overview");

  const filteredSections = sections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.content.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.content.features.some((f) =>
        f.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentSection = sections.find((s) => s.id === activeSection);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left navigation */}
      <div className="w-72 border-r border-border bg-muted/30 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Documentation</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-0.5">
            {filteredSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{section.title}</span>
                  {isActive && <ChevronRight className="h-3 w-3 ml-auto flex-shrink-0" />}
                </button>
              );
            })}
            <div className="pt-3 pb-1 px-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Support
              </p>
            </div>
            <button
              onClick={() => setActiveSection("faq")}
              className={`flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeSection === "faq"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Info className="h-4 w-4 flex-shrink-0" />
              <span>FAQs</span>
            </button>
          </nav>
        </ScrollArea>
      </div>

      {/* Right content */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto p-8">
          {activeSection === "faq" ? (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Frequently Asked Questions
                </h1>
                <p className="text-muted-foreground">
                  Quick answers to common questions about using HireFlow.
                </p>
              </div>
              <Accordion type="single" collapsible className="space-y-2">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`faq-${index}`}
                    className="border border-border rounded-lg px-4"
                  >
                    <AccordionTrigger className="text-sm font-medium text-left hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </>
          ) : currentSection ? (
            <>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <currentSection.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {currentSection.title}
                    </h1>
                    {currentSection.route && (
                      <Link
                        to={currentSection.route}
                        className="text-xs text-primary hover:underline"
                      >
                        Go to {currentSection.title} →
                      </Link>
                    )}
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {currentSection.content.description}
                </p>
              </div>

              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Key Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {currentSection.content.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {currentSection.content.tips && (
                <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
                      <Lightbulb className="h-4 w-4" />
                      Pro Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {currentSection.content.tips.map((tip, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : null}
        </div>
      </ScrollArea>
    </div>
  );
};

export default HelpDocumentation;
