"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserPlus, Star, Mail, Tag, Filter, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";

const mockTalent = [
  { id: "t1", name: "Sophia Zhang", email: "sophia@example.com", avatar: "SZ", title: "Staff Engineer", company: "Google", skills: ["Go", "Kubernetes", "System Design", "gRPC"], tags: ["passive", "senior", "backend"], source: "LinkedIn", addedDate: "2026-03-15", status: "contacted", matchScore: 92, notes: "Excellent distributed systems background" },
  { id: "t2", name: "Marcus Johnson", email: "marcus@example.com", avatar: "MJ", title: "Engineering Manager", company: "Stripe", skills: ["Leadership", "Python", "Payments", "Team Building"], tags: ["leadership", "fintech"], source: "Referral", addedDate: "2026-03-20", status: "interested", matchScore: 88, notes: "Open to new opportunities Q3" },
  { id: "t3", name: "Yuki Tanaka", email: "yuki@example.com", avatar: "YT", title: "ML Engineer", company: "OpenAI", skills: ["PyTorch", "NLP", "Python", "MLOps"], tags: ["ai/ml", "research"], source: "Conference", addedDate: "2026-04-01", status: "active", matchScore: 95, notes: "Met at AI Summit 2026" },
  { id: "t4", name: "Isabella Costa", email: "isabella@example.com", avatar: "IC", title: "Product Designer", company: "Figma", skills: ["Figma", "Design Systems", "Prototyping", "Research"], tags: ["design", "senior"], source: "Portfolio", addedDate: "2026-03-28", status: "active", matchScore: 85, notes: "Outstanding portfolio, design systems expertise" },
  { id: "t5", name: "Raj Patel", email: "raj@example.com", avatar: "RP", title: "DevOps Lead", company: "AWS", skills: ["Terraform", "AWS", "CI/CD", "Security"], tags: ["devops", "cloud", "senior"], source: "LinkedIn", addedDate: "2026-04-05", status: "not_interested", matchScore: 78, notes: "Happy at current role, revisit in 6 months" },
  { id: "t6", name: "Emma Williams", email: "emma@example.com", avatar: "EW", title: "Data Scientist", company: "Netflix", skills: ["Python", "SQL", "Spark", "A/B Testing"], tags: ["data", "analytics"], source: "Recruiter", addedDate: "2026-04-08", status: "contacted", matchScore: 82, notes: "Strong recommendation from recruiter network" },
];

const statusColors = {
  active: "bg-muted text-muted-foreground",
  contacted: "bg-primary/10 text-primary",
  interested: "bg-success/10 text-success",
  not_interested: "bg-destructive/10 text-destructive",
};

const statusLabels = {
  active: "In Pool",
  contacted: "Contacted",
  interested: "Interested",
  not_interested: "Not Interested",
};

export default function TalentPoolPage() {
  const [talents, setTalents] = useState(mockTalent);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");

  const allTags = Array.from(new Set(talents.flatMap((t) => t.tags)));

  const filtered = talents.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchTag = tagFilter === "all" || t.tags.includes(tagFilter);
    return matchSearch && matchStatus && matchTag;
  });

  const updateStatus = (id, status) => {
    setTalents((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    toast.success("Status updated");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Talent Pool
          </h1>
          <p className="text-muted-foreground">{talents.length} passive candidates in your talent pool</p>
        </div>
        <Button className="gap-2" onClick={() => toast.info("Add talent feature coming soon")}>
          <UserPlus className="h-4 w-4" /> Add to Pool
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: talents.length, icon: Users },
          { label: "Contacted", value: talents.filter((t) => t.status === "contacted").length, icon: Mail },
          { label: "Interested", value: talents.filter((t) => t.status === "interested").length, icon: Star },
          { label: "Avg Match", value: `${Math.round(talents.reduce((s, t) => s + t.matchScore, 0) / talents.length)}%`, icon: Sparkles },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2"><Icon className="h-4 w-4 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or skill..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><Filter className="h-3.5 w-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-[140px]"><Tag className="h-3.5 w-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {allTags.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Talent Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((talent) => (
          <Card key={talent.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{talent.avatar}</div>
                  <div>
                    <p className="font-semibold text-foreground">{talent.name}</p>
                    <p className="text-xs text-muted-foreground">{talent.title} at {talent.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="text-sm font-bold text-primary">{talent.matchScore}%</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {talent.skills.slice(0, 4).map((s) => (
                  <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                ))}
                {talent.skills.length > 4 && <Badge variant="secondary" className="text-[10px]">+{talent.skills.length - 4}</Badge>}
              </div>

              <div className="flex flex-wrap gap-1">
                {talent.tags.map((tag) => (
                  <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">#{tag}</span>
                ))}
              </div>

              <p className="text-xs text-muted-foreground italic">"{talent.notes}"</p>

              <div className="flex items-center justify-between pt-1 border-t border-muted">
                <Badge className={`${statusColors[talent.status]} text-[10px]`}>{statusLabels[talent.status]}</Badge>
                <Select value={talent.status} onValueChange={(v) => updateStatus(talent.id, v)}>
                  <SelectTrigger className="h-7 w-[120px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium">No talent found</p>
          <p className="text-sm">Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}
