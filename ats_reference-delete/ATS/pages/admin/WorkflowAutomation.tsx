import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Zap, ArrowRight, Mail, UserPlus, Clock, Filter, GitBranch, Plus, Play, Pause, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";

interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  conditions: string[];
  actions: string[];
  enabled: boolean;
  executionCount: number;
  lastExecuted?: string;
}

const initialRules: WorkflowRule[] = [
  {
    id: "w1", name: "Auto-Acknowledge Applications", description: "Send confirmation email when a candidate applies",
    trigger: "candidate_applies", conditions: [], actions: ["Send acknowledgment email", "Add to screening queue"],
    enabled: true, executionCount: 142, lastExecuted: "2 min ago",
  },
  {
    id: "w2", name: "High-Score Auto-Advance", description: "Automatically move candidates with score > 4.0 to interview stage",
    trigger: "score_submitted", conditions: ["Weighted score > 4.0"], actions: ["Move to Interview stage", "Notify hiring manager"],
    enabled: true, executionCount: 23, lastExecuted: "1 hour ago",
  },
  {
    id: "w3", name: "Interview Reminder", description: "Send reminder 24 hours before scheduled interview",
    trigger: "time_based", conditions: ["Interview in 24 hours"], actions: ["Email candidate reminder", "Email interviewer reminder", "Slack notification"],
    enabled: true, executionCount: 89, lastExecuted: "3 hours ago",
  },
  {
    id: "w4", name: "Rejection Follow-up", description: "Send feedback survey 3 days after rejection",
    trigger: "stage_change_rejected", conditions: ["3 days after rejection"], actions: ["Send candidate experience survey"],
    enabled: false, executionCount: 34, lastExecuted: "2 days ago",
  },
  {
    id: "w5", name: "Stale Application Alert", description: "Alert recruiter when application has been in same stage for 7+ days",
    trigger: "time_based", conditions: ["No stage change for 7 days"], actions: ["Email assigned recruiter", "Add warning flag"],
    enabled: true, executionCount: 15, lastExecuted: "5 hours ago",
  },
  {
    id: "w6", name: "Offer Expiry Warning", description: "Notify when offer is about to expire",
    trigger: "time_based", conditions: ["Offer expires in 48 hours", "Offer not accepted"], actions: ["Email HR manager", "Email candidate reminder"],
    enabled: true, executionCount: 7, lastExecuted: "1 day ago",
  },
];

const triggers = [
  { value: "candidate_applies", label: "Candidate Applies" },
  { value: "stage_change", label: "Stage Changes" },
  { value: "score_submitted", label: "Score Submitted" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "time_based", label: "Time-Based" },
  { value: "offer_sent", label: "Offer Sent" },
];

const actionOptions = [
  "Send email to candidate", "Send email to recruiter", "Send email to hiring manager",
  "Move to next stage", "Add tag/flag", "Slack notification", "Create task",
  "Schedule follow-up", "Add to talent pool",
];

const WorkflowAutomation = () => {
  const [rules, setRules] = useState<WorkflowRule[]>(initialRules);
  const [addOpen, setAddOpen] = useState(false);
  const [newRule, setNewRule] = useState({ name: "", description: "", trigger: "candidate_applies", condition: "", action: "" });

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
    const rule = rules.find((r) => r.id === id);
    toast.success(`${rule?.name} ${rule?.enabled ? "disabled" : "enabled"}`);
  };

  const deleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    toast.success("Workflow rule deleted");
  };

  const addRule = () => {
    if (!newRule.name) return;
    const rule: WorkflowRule = {
      id: `w${Date.now()}`,
      name: newRule.name,
      description: newRule.description,
      trigger: newRule.trigger,
      conditions: newRule.condition ? [newRule.condition] : [],
      actions: newRule.action ? [newRule.action] : [],
      enabled: true,
      executionCount: 0,
    };
    setRules((prev) => [rule, ...prev]);
    setNewRule({ name: "", description: "", trigger: "candidate_applies", condition: "", action: "" });
    setAddOpen(false);
    toast.success("Workflow rule created");
  };

  const activeCount = rules.filter((r) => r.enabled).length;
  const totalExecutions = rules.reduce((sum, r) => sum + r.executionCount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workflow Automation</h1>
          <p className="text-muted-foreground">Automate repetitive hiring tasks</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Create Rule</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Workflow Rule</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rule Name</Label>
                <Input value={newRule.name} onChange={(e) => setNewRule({ ...newRule, name: e.target.value })} placeholder="e.g., Auto-reject after 30 days" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={newRule.description} onChange={(e) => setNewRule({ ...newRule, description: e.target.value })} placeholder="What does this rule do?" />
              </div>
              <div className="space-y-2">
                <Label>Trigger</Label>
                <Select value={newRule.trigger} onValueChange={(v) => setNewRule({ ...newRule, trigger: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {triggers.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Condition (optional)</Label>
                <Input value={newRule.condition} onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })} placeholder="e.g., Score > 3.5" />
              </div>
              <div className="space-y-2">
                <Label>Action</Label>
                <Select value={newRule.action} onValueChange={(v) => setNewRule({ ...newRule, action: v })}>
                  <SelectTrigger><SelectValue placeholder="Select action" /></SelectTrigger>
                  <SelectContent>
                    {actionOptions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addRule} className="w-full">Create Rule</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Zap className="h-5 w-5 text-primary" /></div>
            <div>
              <div className="text-2xl font-bold text-foreground">{activeCount}</div>
              <div className="text-xs text-muted-foreground">Active Rules</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10"><CheckCircle2 className="h-5 w-5 text-success" /></div>
            <div>
              <div className="text-2xl font-bold text-foreground">{totalExecutions}</div>
              <div className="text-xs text-muted-foreground">Total Executions</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10"><Clock className="h-5 w-5 text-warning" /></div>
            <div>
              <div className="text-2xl font-bold text-foreground">~4.2h</div>
              <div className="text-xs text-muted-foreground">Time Saved / Week</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rules */}
      <div className="space-y-3">
        {rules.map((rule) => (
          <Card key={rule.id} className={`transition-opacity ${!rule.enabled ? "opacity-60" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 ${rule.enabled ? "bg-primary/10" : "bg-muted"}`}>
                    <GitBranch className={`h-4 w-4 ${rule.enabled ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">{rule.name}</span>
                      <Badge variant={rule.enabled ? "default" : "secondary"} className="text-[10px]">
                        {rule.enabled ? "Active" : "Paused"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">{rule.description}</div>

                    {/* Flow visualization */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap text-xs">
                      <Badge variant="outline" className="bg-accent/10 text-accent-foreground">
                        <Zap className="h-3 w-3 mr-1" />
                        {triggers.find((t) => t.value === rule.trigger)?.label}
                      </Badge>
                      {rule.conditions.map((c, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="outline" className="bg-warning/10 text-warning">
                            <Filter className="h-3 w-3 mr-1" />{c}
                          </Badge>
                        </span>
                      ))}
                      {rule.actions.map((a, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="outline" className="bg-success/10 text-success">
                            <Mail className="h-3 w-3 mr-1" />{a}
                          </Badge>
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                      <span>Executed {rule.executionCount} times</span>
                      {rule.lastExecuted && <span>• Last run: {rule.lastExecuted}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                  <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WorkflowAutomation;
