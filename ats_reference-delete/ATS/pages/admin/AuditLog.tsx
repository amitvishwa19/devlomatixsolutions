import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Filter, Clock, User, ArrowRightLeft, MessageSquare, Star, Settings, FileText, Mail, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  userRole: string;
  action: string;
  category: "stage_change" | "note" | "score" | "settings" | "candidate" | "job" | "interview" | "email" | "offer" | "system";
  target: string;
  details: string;
  ipAddress: string;
}

const auditData: AuditEntry[] = [
  { id: "a1", timestamp: "2026-04-12T14:32:00", user: "Rajesh Kumar", userRole: "Admin", action: "Stage Change", category: "stage_change", target: "Ananya Gupta", details: "Moved from Screening → Interview for Senior Frontend Developer", ipAddress: "192.168.1.10" },
  { id: "a2", timestamp: "2026-04-12T14:15:00", user: "Priya Sharma", userRole: "Recruiter", action: "Score Submitted", category: "score", target: "Meera Krishnan", details: "Submitted scorecard: Design Skills 5/5, UX Thinking 5/5, Overall 5.0", ipAddress: "192.168.1.22" },
  { id: "a3", timestamp: "2026-04-12T13:45:00", user: "Rajesh Kumar", userRole: "Admin", action: "Note Added", category: "note", target: "Ananya Gupta", details: 'Added note: "Strong React experience, passed technical screen"', ipAddress: "192.168.1.10" },
  { id: "a4", timestamp: "2026-04-12T13:20:00", user: "System", userRole: "System", action: "Email Sent", category: "email", target: "Ananya Gupta", details: "Interview confirmation email sent automatically", ipAddress: "—" },
  { id: "a5", timestamp: "2026-04-12T12:50:00", user: "Amit Verma", userRole: "Hiring Manager", action: "Interview Scheduled", category: "interview", target: "Aditya Joshi", details: "Culture Fit interview on Apr 13 at 11:00 AM with Amit Verma", ipAddress: "192.168.1.35" },
  { id: "a6", timestamp: "2026-04-12T11:30:00", user: "Neha Kapoor", userRole: "Recruiter", action: "Candidate Added", category: "candidate", target: "Sanjay Thakur", details: "New candidate added for Sales Representative position via Naukri", ipAddress: "192.168.1.40" },
  { id: "a7", timestamp: "2026-04-12T11:00:00", user: "Rajesh Kumar", userRole: "Admin", action: "Job Published", category: "job", target: "Data Analyst", details: "Job posting published: Data Analyst — Analytics — Hyderabad, TG", ipAddress: "192.168.1.10" },
  { id: "a8", timestamp: "2026-04-12T10:15:00", user: "Rajesh Kumar", userRole: "Admin", action: "Settings Updated", category: "settings", target: "Notification Preferences", details: "Enabled weekly digest notifications for all team members", ipAddress: "192.168.1.10" },
  { id: "a9", timestamp: "2026-04-11T16:45:00", user: "HR Manager", userRole: "Admin", action: "Offer Sent", category: "offer", target: "Meera Krishnan", details: "Offer letter sent: Product Designer — ₹20L — Start date Apr 20", ipAddress: "192.168.1.15" },
  { id: "a10", timestamp: "2026-04-11T16:00:00", user: "HR Manager", userRole: "Admin", action: "Stage Change", category: "stage_change", target: "Meera Krishnan", details: "Moved from Interview → Offer for Product Designer", ipAddress: "192.168.1.15" },
  { id: "a11", timestamp: "2026-04-11T15:30:00", user: "Rajesh Kumar", userRole: "Admin", action: "Stage Change", category: "stage_change", target: "Rohit Verma", details: "Moved to Rejected — Insufficient experience for DevOps Engineer", ipAddress: "192.168.1.10" },
  { id: "a12", timestamp: "2026-04-11T15:35:00", user: "System", userRole: "System", action: "Email Sent", category: "email", target: "Rohit Verma", details: "Rejection email sent automatically via workflow rule", ipAddress: "—" },
  { id: "a13", timestamp: "2026-04-11T14:20:00", user: "Priya Sharma", userRole: "Recruiter", action: "Rating Changed", category: "score", target: "Karthik Iyer", details: "Rating updated from 3 to 4 stars", ipAddress: "192.168.1.22" },
  { id: "a14", timestamp: "2026-04-11T11:00:00", user: "HR Manager", userRole: "Admin", action: "Stage Change", category: "stage_change", target: "Deepika Nair", details: "Moved from Offer → Hired for Senior Frontend Developer", ipAddress: "192.168.1.15" },
  { id: "a15", timestamp: "2026-04-11T10:00:00", user: "CTO", userRole: "Hiring Manager", action: "Score Submitted", category: "score", target: "Deepika Nair", details: "Final round scorecard: Technical 5/5, Problem Solving 5/5, Overall 4.8", ipAddress: "192.168.1.50" },
  { id: "a16", timestamp: "2026-04-10T16:30:00", user: "Rajesh Kumar", userRole: "Admin", action: "Workflow Created", category: "settings", target: "Auto-Acknowledge Applications", details: "New automation rule: send confirmation email on application", ipAddress: "192.168.1.10" },
  { id: "a17", timestamp: "2026-04-10T14:00:00", user: "Rajesh Kumar", userRole: "Admin", action: "Score Submitted", category: "score", target: "Aditya Joshi", details: "Scorecard submitted: Skills 4/5, Experience 4/5, Overall 4.0", ipAddress: "192.168.1.10" },
  { id: "a18", timestamp: "2026-04-10T09:00:00", user: "System", userRole: "System", action: "Bulk Import", category: "system", target: "Candidates", details: "3 candidates imported from CSV upload", ipAddress: "—" },
  { id: "a19", timestamp: "2026-04-09T17:00:00", user: "Priya Sharma", userRole: "Recruiter", action: "Note Added", category: "note", target: "Sneha Deshmukh", details: 'Added note: "Strong Python background"', ipAddress: "192.168.1.22" },
  { id: "a20", timestamp: "2026-04-09T14:00:00", user: "Design Lead", userRole: "Hiring Manager", action: "Score Submitted", category: "score", target: "Karthik Iyer", details: "Scorecard: Design Skills 4/5, UX 4/5, Tools 5/5, Overall 4.0", ipAddress: "192.168.1.60" },
];

const categoryConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  stage_change: { icon: ArrowRightLeft, color: "bg-primary/10 text-primary", label: "Stage Change" },
  note: { icon: MessageSquare, color: "bg-accent/20 text-accent-foreground", label: "Note" },
  score: { icon: Star, color: "bg-warning/10 text-warning", label: "Score" },
  settings: { icon: Settings, color: "bg-muted text-muted-foreground", label: "Settings" },
  candidate: { icon: User, color: "bg-success/10 text-success", label: "Candidate" },
  job: { icon: FileText, color: "bg-primary/10 text-primary", label: "Job" },
  interview: { icon: Clock, color: "bg-accent/20 text-accent-foreground", label: "Interview" },
  email: { icon: Mail, color: "bg-warning/10 text-warning", label: "Email" },
  offer: { icon: FileText, color: "bg-success/10 text-success", label: "Offer" },
  system: { icon: Shield, color: "bg-muted text-muted-foreground", label: "System" },
};

const PAGE_SIZE = 10;

const AuditLog = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [page, setPage] = useState(1);

  const uniqueUsers = [...new Set(auditData.map((a) => a.user))];

  const filtered = auditData.filter((entry) => {
    const matchSearch = !search || entry.action.toLowerCase().includes(search.toLowerCase()) || entry.target.toLowerCase().includes(search.toLowerCase()) || entry.details.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || entry.category === categoryFilter;
    const matchUser = userFilter === "all" || entry.user === userFilter;
    return matchSearch && matchCategory && matchUser;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const exportLog = () => {
    const headers = ["Timestamp", "User", "Role", "Action", "Category", "Target", "Details", "IP Address"];
    const rows = filtered.map((e) => [e.timestamp, e.user, e.userRole, e.action, e.category, e.target, `"${e.details}"`, e.ipAddress]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-log.csv";
    a.click();
    toast.success("Audit log exported");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
          <p className="text-muted-foreground">{filtered.length} actions tracked · Complete activity history</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={exportLog}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search actions, targets, details..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryConfig).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={userFilter} onValueChange={(v) => { setUserFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px]"><User className="h-4 w-4 mr-2" /><SelectValue placeholder="User" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {uniqueUsers.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Stage Changes", count: auditData.filter((a) => a.category === "stage_change").length, icon: ArrowRightLeft, color: "text-primary" },
          { label: "Scores", count: auditData.filter((a) => a.category === "score").length, icon: Star, color: "text-warning" },
          { label: "Emails Sent", count: auditData.filter((a) => a.category === "email").length, icon: Mail, color: "text-accent-foreground" },
          { label: "Settings Changes", count: auditData.filter((a) => a.category === "settings").length, icon: Settings, color: "text-muted-foreground" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-3 flex items-center gap-3">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <div>
                <div className="text-xl font-bold text-foreground">{stat.count}</div>
                <div className="text-[11px] text-muted-foreground">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Log Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="hidden lg:table-cell">Details</TableHead>
                  <TableHead className="hidden xl:table-cell w-[100px]">IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((entry) => {
                  const cfg = categoryConfig[entry.category];
                  const Icon = cfg.icon;
                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {formatTime(entry.timestamp)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
                            {entry.user.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">{entry.user}</div>
                            <div className="text-[10px] text-muted-foreground">{entry.userRole}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${cfg.color}`}>
                          <Icon className="h-3 w-3 mr-1" />{entry.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">{entry.target}</TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-[300px] truncate">{entry.details}</TableCell>
                      <TableCell className="hidden xl:table-cell text-xs text-muted-foreground font-mono">{entry.ipAddress}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLog;
