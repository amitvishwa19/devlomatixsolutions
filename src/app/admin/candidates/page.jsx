"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StageBadge from "@/app/admin/_component/StageBadge";
import StarRating from "@/app/admin/_component/StarRating";
import AddCandidateDialog from "@/app/admin/_component/AddCandidateDialog";
import BulkActions from "@/app/admin/_component/BulkActions";
import AdvancedFilters, { defaultFilters } from "@/app/admin/_component/AdvancedFilters";
import { useAts } from "@/app/admin/_context/AtsContext";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CandidatesPage() {
  const { candidates, getWeightedScore, assessCandidateMatch } = useAts();
  const [filters, setFilters] = useState(defaultFilters);
  const [selected, setSelected] = useState([]);

  const filtered = candidates.filter((c) => {
    const matchSearch = !filters.search || c.name.toLowerCase().includes(filters.search.toLowerCase()) || c.jobTitle.toLowerCase().includes(filters.search.toLowerCase()) || c.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchStage = filters.stage === "All" || c.stage === filters.stage;
    const matchSource = filters.source === "All" || c.source === filters.source;
    const matchSkills = filters.skills.length === 0 || filters.skills.every((s) => c.skills.some((cs) => cs.toLowerCase().includes(s.toLowerCase())));
    const matchRating = c.rating >= filters.minRating;
    const expYears = parseInt(c.experience) || 0;
    const matchExp = expYears >= filters.minExperience && expYears <= filters.maxExperience;
    const matchDateFrom = !filters.dateFrom || c.appliedDate >= filters.dateFrom;
    const matchDateTo = !filters.dateTo || c.appliedDate <= filters.dateTo;
    return matchSearch && matchStage && matchSource && matchSkills && matchRating && matchExp && matchDateFrom && matchDateTo;
  });

  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelected(selected.length === filtered.length && filtered.length > 0 ? [] : filtered.map((c) => c.id));
  };

  const exportCsv = () => {
    const headers = ["Name", "Email", "Phone", "Job", "Stage", "Rating", "Score", "Applied Date", "Source", "Skills"];
    const rows = (selected.length ? candidates.filter((c) => selected.includes(c.id)) : filtered).map((c) => [c.name, c.email, c.phone, c.jobTitle, c.stage, c.rating, getWeightedScore(c.id).toFixed(1), c.appliedDate, c.source, c.skills.join("; ")]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "candidates.csv";
    a.click();
    toast.success("CSV exported successfully");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Candidates</h1>
          <p className="text-muted-foreground">{candidates.length} total candidates • {filtered.length} showing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={exportCsv}><Download className="h-4 w-4" /> Export</Button>
          <AddCandidateDialog />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, email, job..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="pl-9" />
        </div>
        <AdvancedFilters filters={filters} onChange={setFilters} />
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <BulkActions selectedIds={selected} onClear={() => setSelected([])} />
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={selected.length === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} />
                  </TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Applied For</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Applied</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} className="group">
                    <TableCell>
                      <Checkbox checked={selected.includes(c.id)} onCheckedChange={() => toggleSelect(c.id)} />
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/candidates/${c.id}`} className="flex items-center gap-3 hover:underline">
                        <div className="relative flex-shrink-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">{c.avatar}</div>
                          {(() => {
                            const m = assessCandidateMatch(c.id);
                            if (!m || m.score === 0) return null;
                            let color = "bg-destructive";
                            if (m.score >= 80) color = "bg-success";
                            else if (m.score >= 50) color = "bg-primary";
                            return (
                              <span className={cn("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-background", color)} />
                            );
                          })()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{c.name}</span>
                            {(() => {
                                const m = assessCandidateMatch(c.id);
                                if (!m || m.score === 0) return null;
                                let colorClass = "text-destructive bg-destructive/10";
                                if (m.score >= 80) colorClass = "text-success bg-success/10";
                                else if (m.score >= 50) colorClass = "text-primary bg-primary/10";
                                return (
                                  <span className={cn("text-[10px] px-1 rounded font-bold", colorClass)}>{m.score}% Fit</span>
                                );
                            })()}
                          </div>
                          <div className="text-xs text-muted-foreground">{c.email}</div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{c.jobTitle}</TableCell>
                    <TableCell><StageBadge stage={c.stage} /></TableCell>
                    <TableCell><StarRating rating={c.rating} /></TableCell>
                    <TableCell>
                      {(() => {
                        const score = getWeightedScore(c.id);
                        return score > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{score.toFixed(1)}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.source}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.appliedDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium">No candidates found</p>
          <p className="text-sm">Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}
