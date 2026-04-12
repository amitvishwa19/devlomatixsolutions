"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useAts } from "../_context/AtsContext";
import { Star, Trophy, User, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

const ScoreInput = ({ value, onChange, max = 5 }) => (
  <div className="flex gap-1">
    {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        className={`h-8 w-8 rounded-md text-xs font-semibold transition-all ${
          n <= value
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
      >
        {n}
      </button>
    ))}
  </div>
);

const CandidateScorecard = ({ candidateId, jobId }) => {
  const { scorecardTemplates, scores, submitScore, getWeightedScore, getCandidateRanking } = useAts();
  const template = scorecardTemplates.find((t) => t.jobId === jobId);
  const existingScores = scores.filter((s) => s.candidateId === candidateId);
  const [showForm, setShowForm] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [newScores, setNewScores] = useState({});

  const weightedScore = getWeightedScore(candidateId);
  const ranking = getCandidateRanking(jobId);
  const rank = ranking.findIndex((c) => c.id === candidateId) + 1;

  if (!template) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Trophy className="h-4 w-4" /> Scorecard</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">No scorecard template configured for this job.</p></CardContent>
      </Card>
    );
  }

  const handleSubmit = () => {
    const allFilled = template.criteria.every((c) => newScores[c.id] && newScores[c.id] > 0);
    if (!allFilled) {
      toast.error("Please score all criteria before submitting");
      return;
    }
    submitScore({
      candidateId,
      scorecardId: template.id,
      scores: newScores,
      reviewer: "You",
      submittedAt: new Date().toISOString(),
    });
    setNewScores({});
    setShowForm(false);
    toast.success("Scorecard submitted successfully");
  };

  const maxPossible = 5;
  const scorePercent = (weightedScore / maxPossible) * 100;

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Score Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><Trophy className="h-4 w-4 text-primary" /> Scorecard</CardTitle>
              {weightedScore > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Rank</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">#{rank}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {weightedScore > 0 ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-foreground">{weightedScore.toFixed(1)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Weighted Score</span>
                      <span>{scorePercent.toFixed(0)}%</span>
                    </div>
                    <Progress value={scorePercent} className="h-2" />
                  </div>
                </div>

                {/* Criteria breakdown */}
                <div className="space-y-2">
                  {template.criteria.map((criterion) => {
                    const avgScore = existingScores.reduce((sum, s) => sum + (s.scores[criterion.id] || 0), 0) / (existingScores.length || 1);
                    return (
                      <div key={criterion.id} className="flex items-center justify-between text-sm">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-muted-foreground cursor-help">{criterion.name}</span>
                          </TooltipTrigger>
                          <TooltipContent><p>{criterion.description}</p><p className="text-xs mt-1" >Weight: {criterion.weight}/5</p></TooltipContent>
                        </Tooltip>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < Math.round(avgScore) ? "fill-primary text-primary" : "text-muted"}`} />
                            ))}
                          </div>
                          <span className="text-xs font-medium text-foreground w-6 text-right">{avgScore.toFixed(1)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reviewers */}
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground mb-2">{existingScores.length} review{existingScores.length !== 1 ? "s" : ""}</p>
                  <div className="flex flex-wrap gap-2">
                    {existingScores.map((s) => (
                      <div key={s.id} className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-foreground">{s.reviewer}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No scores submitted yet. Be the first to evaluate this candidate.</p>
            )}

            <Button variant={showForm ? "secondary" : "default"} size="sm" onClick={() => setShowForm(!showForm)} className="w-full gap-2">
              {showForm ? "Cancel" : "Submit Evaluation"}
            </Button>
          </CardContent>
        </Card>

        {/* Score Form */}
        {showForm && (
          <Card className="border-primary/20">
            <CardHeader><CardTitle className="text-base">Your Evaluation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {template.criteria.map((criterion) => (
                <div key={criterion.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{criterion.name}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">Weight: {criterion.weight}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{criterion.description}</p>
                  <ScoreInput value={newScores[criterion.id] || 0} onChange={(v) => setNewScores((prev) => ({ ...prev, [criterion.id]: v }))} />
                </div>
              ))}
              <Button onClick={handleSubmit} className="w-full">Submit Scorecard</Button>
            </CardContent>
          </Card>
        )}

        {/* Job Ranking */}
        <Card>
          <CardHeader>
            <button onClick={() => setShowRanking(!showRanking)} className="flex items-center justify-between w-full">
              <CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4" /> Candidate Ranking</CardTitle>
              {showRanking ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
          </CardHeader>
          {showRanking && (
            <CardContent className="space-y-2">
              {ranking.map((c, i) => (
                <div key={c.id} className={`flex items-center justify-between rounded-lg p-2.5 text-sm ${c.id === candidateId ? "bg-primary/10 ring-1 ring-primary/20" : "bg-muted/50"}`}>
                  <div className="flex items-center gap-3">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {i + 1}
                    </span>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">{c.avatar}</div>
                    <span className="font-medium text-foreground">{c.name}</span>
                  </div>
                  <span className={`text-sm font-semibold ${c.weightedScore > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                    {c.weightedScore > 0 ? c.weightedScore.toFixed(1) : "—"}
                  </span>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default CandidateScorecard;
