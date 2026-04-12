import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, Eye, Save, Plus, Edit2, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: "rejection" | "interview_invite" | "offer" | "follow_up" | "custom";
  variables: string[];
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: "1",
    name: "Rejection — General",
    subject: "Update on your application for {{job_title}} at {{company_name}}",
    body: `Dear {{candidate_name}},

Thank you for your interest in the {{job_title}} position at {{company_name}} and for taking the time to apply.

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely align with our current needs.

We truly appreciate your interest in joining our team and encourage you to apply for future openings that match your skills and experience.

We wish you the best in your career journey.

Warm regards,
{{sender_name}}
{{company_name}} Recruiting Team`,
    category: "rejection",
    variables: ["candidate_name", "job_title", "company_name", "sender_name"],
  },
  {
    id: "2",
    name: "Interview Invitation — Technical",
    subject: "Interview Invitation: {{job_title}} at {{company_name}}",
    body: `Dear {{candidate_name}},

We were impressed by your application for the {{job_title}} position and would like to invite you for a {{interview_type}} interview.

📅 Date: {{interview_date}}
🕐 Time: {{interview_time}}
⏱️ Duration: {{interview_duration}}
👤 Interviewer: {{interviewer_name}}

{{#if meeting_link}}
📎 Meeting Link: {{meeting_link}}
{{/if}}

Please confirm your availability by replying to this email. If the proposed time doesn't work, please suggest alternative slots.

We look forward to speaking with you!

Best regards,
{{sender_name}}
{{company_name}} Recruiting Team`,
    category: "interview_invite",
    variables: ["candidate_name", "job_title", "company_name", "interview_type", "interview_date", "interview_time", "interview_duration", "interviewer_name", "meeting_link", "sender_name"],
  },
  {
    id: "3",
    name: "Offer Letter",
    subject: "Congratulations! Offer for {{job_title}} at {{company_name}}",
    body: `Dear {{candidate_name}},

We are thrilled to extend an offer for the position of {{job_title}} at {{company_name}}!

Here are the details of your offer:

📋 Position: {{job_title}}
🏢 Department: {{department}}
📍 Location: {{location}}
💰 Salary: {{salary}}
📅 Start Date: {{start_date}}

This offer is contingent upon the successful completion of background verification and other standard pre-employment procedures.

Please review the attached offer letter and let us know your decision by {{response_deadline}}.

If you have any questions, please don't hesitate to reach out.

We're excited about the prospect of having you join our team!

Best regards,
{{sender_name}}
{{company_name}} Recruiting Team`,
    category: "offer",
    variables: ["candidate_name", "job_title", "company_name", "department", "location", "salary", "start_date", "response_deadline", "sender_name"],
  },
  {
    id: "4",
    name: "Follow-Up After Interview",
    subject: "Thank you for interviewing — {{job_title}} at {{company_name}}",
    body: `Dear {{candidate_name}},

Thank you for taking the time to interview for the {{job_title}} position on {{interview_date}}.

We enjoyed learning more about your experience and qualifications. Our team is currently reviewing all candidates and we expect to make a decision by {{decision_date}}.

If you have any questions in the meantime, please feel free to reach out.

Thank you again for your interest in {{company_name}}.

Best regards,
{{sender_name}}
{{company_name}} Recruiting Team`,
    category: "follow_up",
    variables: ["candidate_name", "job_title", "company_name", "interview_date", "decision_date", "sender_name"],
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  rejection: "Rejection",
  interview_invite: "Interview Invite",
  offer: "Offer Letter",
  follow_up: "Follow-Up",
  custom: "Custom",
};

const CATEGORY_COLORS: Record<string, string> = {
  rejection: "bg-destructive/10 text-destructive",
  interview_invite: "bg-primary/10 text-primary",
  offer: "bg-success/10 text-success",
  follow_up: "bg-warning/10 text-warning",
  custom: "bg-muted text-muted-foreground",
};

const ALL_VARIABLES = [
  "candidate_name", "candidate_email", "job_title", "company_name",
  "department", "location", "salary", "sender_name", "interview_type",
  "interview_date", "interview_time", "interview_duration", "interviewer_name",
  "meeting_link", "start_date", "response_deadline", "decision_date",
];

const EmailTemplateEditor = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", subject: "", body: "", category: "custom" as EmailTemplate["category"] });
  const [previewData, setPreviewData] = useState<Record<string, string>>({});
  const [filterCategory, setFilterCategory] = useState("all");

  const filtered = filterCategory === "all" ? templates : templates.filter((t) => t.category === filterCategory);

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{(\w+)\}\}/g) || [];
    return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, "")))];
  };

  const renderPreview = (template: EmailTemplate) => {
    let rendered = template.body;
    const sampleData: Record<string, string> = {
      candidate_name: "Ananya Gupta",
      candidate_email: "ananya.gupta@example.com",
      job_title: "Senior Frontend Developer",
      company_name: "HireFlow Inc.",
      department: "Engineering",
      location: "Remote",
      salary: "₹18L - ₹28L",
      sender_name: "Rajesh Kumar",
      interview_type: "Technical",
      interview_date: "April 15, 2026",
      interview_time: "10:00 AM IST",
      interview_duration: "60 minutes",
      interviewer_name: "Priya Sharma",
      meeting_link: "https://meet.google.com/abc-defg-hij",
      start_date: "May 1, 2026",
      response_deadline: "April 20, 2026",
      decision_date: "April 18, 2026",
      ...previewData,
    };
    for (const [key, val] of Object.entries(sampleData)) {
      rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val);
    }
    rendered = rendered.replace(/\{\{#if \w+\}\}/g, "").replace(/\{\{\/if\}\}/g, "");
    return rendered;
  };

  const handleSave = () => {
    const variables = extractVariables(editForm.subject + " " + editForm.body);
    if (selectedTemplate && editMode) {
      setTemplates((prev) =>
        prev.map((t) => t.id === selectedTemplate.id ? { ...t, ...editForm, variables } : t)
      );
      toast.success("Template updated");
    } else {
      const newTemplate: EmailTemplate = {
        id: String(Date.now()),
        ...editForm,
        variables,
      };
      setTemplates((prev) => [...prev, newTemplate]);
      toast.success("Template created");
    }
    setEditMode(false);
    setSelectedTemplate(null);
  };

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (selectedTemplate?.id === id) setSelectedTemplate(null);
    toast.success("Template deleted");
  };

  const handleDuplicate = (template: EmailTemplate) => {
    const dup: EmailTemplate = { ...template, id: String(Date.now()), name: `${template.name} (Copy)` };
    setTemplates((prev) => [...prev, dup]);
    toast.success("Template duplicated");
  };

  const startEdit = (template?: EmailTemplate) => {
    if (template) {
      setSelectedTemplate(template);
      setEditForm({ name: template.name, subject: template.subject, body: template.body, category: template.category });
    } else {
      setSelectedTemplate(null);
      setEditForm({ name: "", subject: "", body: "", category: "custom" });
    }
    setEditMode(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Email Templates</h2>
          <p className="text-sm text-muted-foreground">Manage automated candidate communications</p>
        </div>
        <div className="flex gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => startEdit()} className="gap-2">
            <Plus className="h-4 w-4" /> New Template
          </Button>
        </div>
      </div>

      {editMode ? (
        <Card>
          <CardHeader>
            <CardTitle>{selectedTemplate ? "Edit Template" : "Create Template"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="e.g. Rejection — Senior Roles" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={editForm.category} onValueChange={(v) => setEditForm({ ...editForm, category: v as EmailTemplate["category"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subject Line</Label>
              <Input value={editForm.subject} onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })} placeholder="e.g. Update on your application for {{job_title}}" />
            </div>
            <div className="space-y-2">
              <Label>Email Body</Label>
              <Textarea value={editForm.body} onChange={(e) => setEditForm({ ...editForm, body: e.target.value })} rows={14} placeholder="Write your email template... Use {{variable_name}} for placeholders." className="font-mono text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Available Variables (click to insert)</Label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {ALL_VARIABLES.map((v) => (
                  <Badge key={v} variant="outline" className="cursor-pointer text-xs hover:bg-primary/10"
                    onClick={() => setEditForm({ ...editForm, body: editForm.body + `{{${v}}}` })}>
                    {`{{${v}}}`}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" /> Save Template</Button>
              <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((template) => (
            <Card key={template.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium text-foreground text-sm">{template.name}</h3>
                  </div>
                  <Badge className={`text-[10px] ${CATEGORY_COLORS[template.category]}`}>
                    {CATEGORY_LABELS[template.category]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2 truncate">Subject: {template.subject}</p>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{template.body.slice(0, 120)}...</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.variables.slice(0, 5).map((v) => (
                    <span key={v} className="text-[10px] bg-muted rounded px-1.5 py-0.5 text-muted-foreground">{`{{${v}}}`}</span>
                  ))}
                  {template.variables.length > 5 && <span className="text-[10px] text-muted-foreground">+{template.variables.length - 5} more</span>}
                </div>
                <div className="flex gap-1.5">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => setSelectedTemplate(template)}>
                        <Eye className="h-3 w-3" /> Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Email Preview — {template.name}</DialogTitle>
                      </DialogHeader>
                      <div className="border rounded-lg p-6 bg-card">
                        <div className="text-xs text-muted-foreground mb-1">Subject</div>
                        <div className="font-medium text-foreground mb-4">{renderPreview({ ...template, body: template.subject })}</div>
                        <div className="border-t pt-4 whitespace-pre-wrap text-sm text-foreground leading-relaxed">{renderPreview(template)}</div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => startEdit(template)}>
                    <Edit2 className="h-3 w-3" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => handleDuplicate(template)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-1 text-xs h-7 text-destructive hover:text-destructive" onClick={() => handleDelete(template.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmailTemplateEditor;
