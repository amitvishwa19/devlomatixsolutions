import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, User, Briefcase, Calendar, FileText, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAts } from "@/ATS/context/AtsContext";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: "candidate" | "job" | "interview";
  title: string;
  subtitle: string;
  link: string;
}

const typeIcons = {
  candidate: User,
  job: Briefcase,
  interview: Calendar,
};

const typeLabels = {
  candidate: "Candidate",
  job: "Job",
  interview: "Interview",
};

const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { candidates, jobs, interviews } = useAts();
  const navigate = useNavigate();

  // Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const results: SearchResult[] = query.trim().length < 2 ? [] : [
    ...candidates
      .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.email.toLowerCase().includes(query.toLowerCase()) || c.skills.some((s) => s.toLowerCase().includes(query.toLowerCase())))
      .slice(0, 5)
      .map((c) => ({ id: c.id, type: "candidate" as const, title: c.name, subtitle: `${c.jobTitle} · ${c.stage}`, link: `/admin/candidates/${c.id}` })),
    ...jobs
      .filter((j) => j.title.toLowerCase().includes(query.toLowerCase()) || j.department.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map((j) => ({ id: j.id, type: "job" as const, title: j.title, subtitle: `${j.department} · ${j.location} · ${j.applicants} applicants`, link: `/admin/jobs` })),
    ...interviews
      .filter((i) => i.candidateName.toLowerCase().includes(query.toLowerCase()) || i.jobTitle.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map((i) => ({ id: i.id, type: "interview" as const, title: `${i.candidateName} - ${i.type}`, subtitle: `${i.jobTitle} · ${i.date} ${i.time}`, link: `/admin/interviews` })),
  ];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = useCallback((result: SearchResult) => {
    navigate(result.link);
    setOpen(false);
    setQuery("");
  }, [navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors w-full max-w-xs"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search everything...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-lg gap-0 overflow-hidden">
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search candidates, jobs, interviews..."
              className="border-0 focus-visible:ring-0 shadow-none text-base"
              autoFocus
            />
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {query.trim().length < 2 && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Start typing to search across all data...
              </div>
            )}

            {query.trim().length >= 2 && results.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No results found for "{query}"
              </div>
            )}

            {results.length > 0 && (
              <div className="py-2">
                {results.map((result, i) => {
                  const Icon = typeIcons[result.type];
                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={cn(
                        "flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors",
                        i === selectedIndex ? "bg-primary/10" : "hover:bg-muted"
                      )}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted flex-shrink-0">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{result.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{typeLabels[result.type]}</span>
                      {i === selectedIndex && <ArrowRight className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t px-4 py-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GlobalSearch;
