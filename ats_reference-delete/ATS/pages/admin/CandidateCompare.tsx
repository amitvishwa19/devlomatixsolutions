import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAts } from "@/ATS/context/AtsContext";
import { ArrowLeft, GitCompare, Trophy, Star, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import StageBadge from "@/ATS/components/StageBadge";
import StarRating from "@/ATS/components/StarRating";

const CandidateCompare = () => {
  const { candidates, getWeightedScore, jobs } = useAts();
  const [ids, setIds] = useState<string[]>(["", ""]);

  const selected = ids.map((id) => candidates.find((c) => c.id === id));

  const setCandidate = (index: number, id: string) => {
    setIds((prev) => prev.map((v, i) => (i === index ? id : v)));
  };

  const addSlot = () => {
    if (ids.length < 4) setIds([...ids, ""]);
  };

  const removeSlot = (index: number) => {
    if (ids.length > 2) setIds(ids.filter((_, i) => i !== index));
  };

  const allSkills = [...new Set(selected.filter(Boolean).flatMap((c) => c!.skills))];
  const scores = selected.map((c) => (c ? getWeightedScore(c.id) : 0));
  const maxScore = Math.max(...scores, 1);

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/admin/candidates" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Candidates
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GitCompare className="h-6 w-6 text-primary" /> Compare Candidates
          </h1>
          <p className="text-muted-foreground">Side-by-side comparison of candidates</p>
        </div>
        {ids.length < 4 && (
          <button onClick={addSlot} className="text-sm text-primary hover:underline">+ Add candidate</button>
        )}
      </div>

      {/* Selectors */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${ids.length}, 1fr)` }}>
        {ids.map((id, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Candidate {i + 1}</span>
              {ids.length > 2 && (
                <button onClick={() => removeSlot(i)} className="text-xs text-destructive hover:underline">Remove</button>
              )}
            </div>
            <Select value={id} onValueChange={(v) => setCandidate(i, v)}>
              <SelectTrigger><SelectValue placeholder="Select candidate" /></SelectTrigger>
              <SelectContent>
                {candidates.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name} — {c.jobTitle}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      {selected.some(Boolean) && (
        <div className="space-y-4">
          {/* Profile Cards */}
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${ids.length}, 1fr)` }}>
            {selected.map((c, i) =>
              c ? (
                <Card key={i} className={scores[i] === maxScore && maxScore > 0 ? "ring-2 ring-primary/30" : ""}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{c.avatar}</div>
                      <div>
                        <p className="font-semibold text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.jobTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <StageBadge stage={c.stage} />
                      <StarRating rating={c.rating} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Experience</span>
                      <span className="font-medium text-foreground">{c.experience}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Source</span>
                      <span className="text-foreground">{c.source}</span>
                    </div>
                    {scores[i] > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1"><Trophy className="h-3 w-3" /> Score</span>
                          <span className="font-bold text-primary">{scores[i].toFixed(1)}</span>
                        </div>
                        <Progress value={(scores[i] / 5) * 100} className="h-1.5" />
                      </div>
                    )}
                    {scores[i] === maxScore && maxScore > 0 && (
                      <Badge className="w-full justify-center bg-primary/10 text-primary hover:bg-primary/20">
                        <Star className="h-3 w-3 mr-1" /> Top Candidate
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card key={i} className="border-dashed">
                  <CardContent className="p-4 flex items-center justify-center h-full text-sm text-muted-foreground">
                    Select a candidate
                  </CardContent>
                </Card>
              )
            )}
          </div>

          {/* Skills Matrix */}
          {allSkills.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Skills Comparison</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Skill</th>
                        {selected.map((c, i) => (
                          <th key={i} className="text-center py-2 px-3 text-muted-foreground font-medium">{c?.name || `Candidate ${i + 1}`}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allSkills.map((skill) => (
                        <tr key={skill} className="border-b border-muted/50">
                          <td className="py-2 pr-4 text-foreground">{skill}</td>
                          {selected.map((c, i) => (
                            <td key={i} className="text-center py-2 px-3">
                              {c?.skills.includes(skill) ? (
                                <CheckCircle className="h-4 w-4 text-primary mx-auto" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default CandidateCompare;
