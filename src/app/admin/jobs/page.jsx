"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Users, Clock, DollarSign, MoreVertical, Eye, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAts } from "@/app/admin/_context/AtsContext";
import { departments, locations, jobTypes } from "@/app/admin/_utils/mockData";
import AddJobDialog from "@/app/admin/_component/AddJobDialog";
import AIJobDescriptionGenerator from "@/app/admin/_component/AIJobDescriptionGenerator";
import { toast } from "sonner";

const statusStyles = {
  open: "bg-success/10 text-success border-success/20",
  closed: "bg-destructive/10 text-destructive border-destructive/20",
  draft: "bg-muted text-muted-foreground border-muted",
};

export default function JobsPage() {
  const { jobs, updateJob, deleteJob } = useAts();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = jobs.filter((j) => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) || j.department.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "All" || j.department === deptFilter;
    const matchType = typeFilter === "All" || j.type === typeFilter;
    const matchStatus = statusFilter === "All" || j.status === statusFilter;
    return matchSearch && matchDept && matchType && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Jobs</h1>
          <p className="text-muted-foreground">{jobs.length} total positions • {jobs.filter((j) => j.status === "open").length} open</p>
        </div>
        <div className="flex gap-2">
          <AIJobDescriptionGenerator />
          <AddJobDialog />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>{departments.map((d) => <SelectItem key={d} value={d}>{d === "All" ? "All Departments" : d}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>{jobTypes.map((t) => <SelectItem key={t} value={t}>{t === "All" ? "All Types" : t}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((job) => (
          <Card key={job.id} className="transition-all hover:shadow-md group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base text-foreground truncate">{job.title}</CardTitle>
                  <div className="text-sm text-muted-foreground mt-0.5">{job.department}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[job.status]}`}>{job.status}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => updateJob(job.id, { status: job.status === "open" ? "closed" : "open" })}>
                        <Eye className="h-4 w-4 mr-2" /> {job.status === "open" ? "Close" : "Reopen"}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => { deleteJob(job.id); toast.success("Job deleted"); }}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.description && <p className="text-xs text-muted-foreground line-clamp-2">{job.description}</p>}
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</div>
                <div className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {job.applicants} applicants</div>
                <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {job.type}</div>
                {job.salary && <div className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> {job.salary}</div>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium">No jobs found</p>
          <p className="text-sm">Try adjusting your filters or create a new job.</p>
        </div>
      )}
    </div>
  );
}
