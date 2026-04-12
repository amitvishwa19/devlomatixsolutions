import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, Search, BarChart3 } from "lucide-react";
import ResumeParser from "@/ATS/components/ResumeParser";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const recentParses = [
  { id: 1, name: "Jordan Mitchell", file: "jordan_mitchell_resume.pdf", parsedAt: "2026-04-10", matchScore: 87, skills: ["React", "TypeScript", "Node.js"], status: "added" },
  { id: 2, name: "Priya Sharma", file: "priya_sharma_cv.pdf", parsedAt: "2026-04-09", matchScore: 92, skills: ["Python", "Django", "PostgreSQL"], status: "added" },
  { id: 3, name: "Alex Rivera", file: "alex_r_resume.docx", parsedAt: "2026-04-08", matchScore: 75, skills: ["Java", "Spring Boot", "AWS"], status: "pending" },
  { id: 4, name: "Taylor Kim", file: "tkim_resume.pdf", parsedAt: "2026-04-07", matchScore: 81, skills: ["Figma", "UX Research", "CSS"], status: "rejected" },
];

const statusColors: Record<string, string> = {
  added: "bg-success/10 text-success",
  pending: "bg-primary/10 text-primary",
  rejected: "bg-destructive/10 text-destructive",
};

const ResumeBank = () => {
  const [search, setSearch] = useState("");

  const filtered = recentParses.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) || r.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" /> Resume Bank
        </h1>
        <p className="text-muted-foreground">Parse, analyze, and manage candidate resumes</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Parsed", value: "248", icon: FileText },
          { label: "This Week", value: "14", icon: Upload },
          { label: "Avg Match", value: "82%", icon: BarChart3 },
          { label: "Auto-Added", value: "186", icon: Search },
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

      <Tabs defaultValue="parse">
        <TabsList>
          <TabsTrigger value="parse" className="gap-1.5"><Upload className="h-3.5 w-3.5" /> Parse Resume</TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> History</TabsTrigger>
        </TabsList>

        <TabsContent value="parse" className="mt-4">
          <div className="max-w-2xl">
            <ResumeParser />
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search parsed resumes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          <div className="space-y-3">
            {filtered.map((resume) => (
              <Card key={resume.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{resume.name}</p>
                      <p className="text-xs text-muted-foreground">{resume.file} • Parsed {resume.parsedAt}</p>
                      <div className="flex gap-1.5 mt-1">
                        {resume.skills.map((s) => (
                          <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{resume.matchScore}%</p>
                      <p className="text-[10px] text-muted-foreground">match</p>
                    </div>
                    <Badge className={`${statusColors[resume.status]} text-xs`}>{resume.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResumeBank;
