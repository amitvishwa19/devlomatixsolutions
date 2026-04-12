"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle2, Circle, Clock, Plus, UserCheck, FileText, Laptop, BookOpen, Users } from "lucide-react";

const defaultTasks = [
  { id: "t1", title: "Complete I-9 verification", description: "Verify employment eligibility documents", category: "documentation", dueDay: 1, completed: false, assignee: "HR" },
  { id: "t2", title: "Sign employment agreement", description: "Review and sign offer letter and NDA", category: "documentation", dueDay: 1, completed: false, assignee: "HR" },
  { id: "t3", title: "Set up workstation", description: "Laptop, monitors, peripherals, and access badges", category: "equipment", dueDay: 1, completed: false, assignee: "IT" },
  { id: "t4", title: "Create email & accounts", description: "Set up email, Slack, GitHub, Jira, and other tools", category: "equipment", dueDay: 1, completed: false, assignee: "IT" },
  { id: "t5", title: "Benefits enrollment", description: "Health insurance, 401k, and other benefits", category: "documentation", dueDay: 3, completed: false, assignee: "HR" },
  { id: "t6", title: "Company orientation", description: "Company history, values, org structure overview", category: "training", dueDay: 2, completed: false, assignee: "HR" },
  { id: "t7", title: "Security training", description: "Data security, password policies, compliance training", category: "compliance", dueDay: 3, completed: false, assignee: "Security" },
  { id: "t8", title: "Meet the team", description: "Introductions with team members and key stakeholders", category: "team", dueDay: 2, completed: false, assignee: "Manager" },
  { id: "t9", title: "Assign mentor/buddy", description: "Pair with an experienced team member", category: "team", dueDay: 1, completed: false, assignee: "Manager" },
  { id: "t10", title: "30-day check-in scheduled", description: "Schedule first performance check-in", category: "team", dueDay: 5, completed: false, assignee: "Manager" },
  { id: "t11", title: "Product walkthrough", description: "Detailed walkthrough of the product and codebase", category: "training", dueDay: 3, completed: false, assignee: "Tech Lead" },
  { id: "t12", title: "Anti-harassment training", description: "Complete mandatory workplace training", category: "compliance", dueDay: 5, completed: false, assignee: "HR" },
];

const initialHires = [
  {
    id: "h1", name: "Deepika Nair", role: "Senior Frontend Developer", department: "Engineering",
    startDate: "2026-04-15", avatar: "DN", mentor: "Rajesh Kumar",
    tasks: defaultTasks.map((t, i) => ({ ...t, id: `h1-${t.id}`, completed: i < 4 })),
  },
  {
    id: "h2", name: "Meera Krishnan", role: "Product Designer", department: "Design",
    startDate: "2026-04-20", avatar: "MK", mentor: "Priya Sharma",
    tasks: defaultTasks.map((t) => ({ ...t, id: `h2-${t.id}` })),
  },
];

const categoryIcons = {
  documentation: FileText,
  equipment: Laptop,
  training: BookOpen,
  team: Users,
  compliance: CheckCircle2,
};

const categoryColors = {
  documentation: "bg-primary/10 text-primary",
  equipment: "bg-accent/20 text-accent-foreground",
  training: "bg-success/10 text-success",
  team: "bg-warning/10 text-warning",
  compliance: "bg-destructive/10 text-destructive",
};

export default function OnboardingPage() {
  const [hires, setHires] = useState(initialHires);
  const [selectedHire, setSelectedHire] = useState(hires[0]?.id || "");
  const [filterCategory, setFilterCategory] = useState("all");
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", category: "documentation", dueDay: 1, assignee: "" });

  const currentHire = hires.find((h) => h.id === selectedHire);

  const toggleTask = (hireId, taskId) => {
    setHires((prev) =>
      prev.map((h) =>
        h.id === hireId
          ? { ...h, tasks: h.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)) }
          : h
      )
    );
  };

  const addTask = () => {
    if (!newTask.title || !selectedHire) return;
    const task = {
      id: `${selectedHire}-custom-${Date.now()}`,
      ...newTask,
      completed: false,
    };
    setHires((prev) =>
      prev.map((h) => (h.id === selectedHire ? { ...h, tasks: [...h.tasks, task] } : h))
    );
    setNewTask({ title: "", description: "", category: "documentation", dueDay: 1, assignee: "" });
    setAddTaskOpen(false);
    toast.success("Task added to onboarding checklist");
  };

  const getProgress = (hire) => {
    const done = hire.tasks.filter((t) => t.completed).length;
    return Math.round((done / hire.tasks.length) * 100);
  };

  const filteredTasks = currentHire?.tasks.filter((t) => filterCategory === "all" || t.category === filterCategory) || [];

  const daysUntilStart = (startDate) => {
    const diff = Math.ceil((new Date(startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? `Starts in ${diff} days` : diff === 0 ? "Starts today" : `Started ${Math.abs(diff)} days ago`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Onboarding</h1>
          <p className="text-muted-foreground">Track new hire onboarding progress</p>
        </div>
      </div>

      {/* New Hire Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hires.map((hire) => (
          <Card
            key={hire.id}
            className={`cursor-pointer transition-all hover:shadow-md ${selectedHire === hire.id ? "ring-2 ring-primary" : ""}`}
            onClick={() => setSelectedHire(hire.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{hire.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">{hire.name}</div>
                  <div className="text-xs text-muted-foreground">{hire.role}</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{daysUntilStart(hire.startDate)}</span>
                  <span className="font-medium text-foreground">{getProgress(hire)}%</span>
                </div>
                <Progress value={getProgress(hire)} className="h-2" />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <UserCheck className="h-3 w-3" />
                  <span>Mentor: {hire.mentor}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {currentHire && (
        <>
          {/* Filters & Add Task */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="documentation">Documentation</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2"><Plus className="h-4 w-4" /> Add Task</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Onboarding Task</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Task Title</Label>
                    <Input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="e.g., Set up VPN access" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} placeholder="Task details..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={newTask.category} onValueChange={(v) => setNewTask({ ...newTask, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="documentation">Documentation</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="team">Team</SelectItem>
                          <SelectItem value="compliance">Compliance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Due (Day #)</Label>
                      <Input type="number" min={1} value={newTask.dueDay} onChange={(e) => setNewTask({ ...newTask, dueDay: parseInt(e.target.value) || 1 })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Assignee</Label>
                    <Input value={newTask.assignee} onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })} placeholder="e.g., IT, HR, Manager" />
                  </div>
                  <Button onClick={addTask} className="w-full">Add Task</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Task List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Onboarding Checklist — {currentHire.name}</CardTitle>
              <CardDescription>
                {currentHire.tasks.filter((t) => t.completed).length} of {currentHire.tasks.length} tasks completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredTasks.map((task) => {
                  const Icon = categoryIcons[task.category];
                  return (
                    <div
                      key={task.id}
                      className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${task.completed ? "bg-muted/50 opacity-70" : "hover:bg-muted/30"}`}
                    >
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(currentHire.id, task.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {task.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{task.description}</div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant="outline" className={`text-[10px] ${categoryColors[task.category]}`}>
                            <Icon className="h-3 w-3 mr-1" />{task.category}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Day {task.dueDay}
                          </span>
                          <span className="text-[10px] text-muted-foreground">• {task.assignee}</span>
                        </div>
                      </div>
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/40 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
