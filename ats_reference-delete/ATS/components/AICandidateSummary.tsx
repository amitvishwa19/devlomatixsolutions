import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, ThumbsUp, ThumbsDown, Minus, Loader2 } from "lucide-react";
import { Candidate } from "@/ATS/data/mockData";
import { toast } from "sonner";

interface Summary {
  overallFit: "Strong Fit" | "Good Fit" | "Moderate Fit" | "Weak Fit";
  fitScore: number;
  strengths: string[];
  concerns: string[];
  highlights: string;
  recommendation: string;
}

const fitColors: Record<string, string> = {
  "Strong Fit": "bg-success/10 text-success border-success/20",
  "Good Fit": "bg-primary/10 text-primary border-primary/20",
  "Moderate Fit": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "Weak Fit": "bg-destructive/10 text-destructive border-destructive/20",
};

const generateSummary = (candidate: Candidate): Summary => {
  const skillCount = candidate.skills.length;
  const expYears = parseInt(candidate.experience) || 0;
  const rating = candidate.rating;

  let fitScore = 0;
  fitScore += Math.min(skillCount * 8, 30);
  fitScore += Math.min(expYears * 5, 25);
  fitScore += rating * 9;
  fitScore += candidate.notes.length > 0 ? 5 : 0;
  fitScore += candidate.linkedin ? 5 : 0;
  fitScore = Math.min(fitScore, 100);

  const overallFit = fitScore >= 80 ? "Strong Fit" : fitScore >= 60 ? "Good Fit" : fitScore >= 40 ? "Moderate Fit" : "Weak Fit";

  const strengths: string[] = [];
  const concerns: string[] = [];

  if (expYears >= 5) strengths.push(`${expYears} years of relevant experience demonstrates deep expertise`);
  else if (expYears >= 3) strengths.push(`${expYears} years of solid industry experience`);
  else concerns.push(`Only ${expYears} years of experience — may need additional mentorship`);

  if (skillCount >= 4) strengths.push(`Diverse skill set with ${skillCount} relevant technologies`);
  else concerns.push(`Limited skill breadth — proficient in only ${skillCount} key areas`);

  if (rating >= 4) strengths.push("Consistently high ratings from interviewers");
  else if (rating <= 2) concerns.push("Below-average interviewer ratings suggest potential concerns");

  if (candidate.linkedin) strengths.push("Active professional presence indicates strong network");
  if (candidate.source === "Referral") strengths.push("Employee referral — statistically higher retention rates");
  if (candidate.notes.length > 2) strengths.push("Multiple positive notes from evaluation team");

  if (candidate.stage === "rejected") concerns.push("Previously moved to rejected stage");
  if (!candidate.linkedin) concerns.push("No LinkedIn profile available for verification");

  const highlights = fitScore >= 70
    ? `${candidate.name} is a standout candidate with a compelling combination of ${candidate.skills.slice(0, 3).join(", ")} expertise and ${expYears} years in the field. Their profile aligns strongly with the ${candidate.jobTitle} requirements.`
    : `${candidate.name} brings ${expYears} years of experience with skills in ${candidate.skills.slice(0, 3).join(", ")}. While there are areas of strength, some gaps may need to be explored further during the evaluation process.`;

  const recommendation = fitScore >= 80
    ? "Strongly recommend advancing to the next stage. This candidate shows exceptional alignment with role requirements."
    : fitScore >= 60
    ? "Recommend proceeding with evaluation. The candidate shows good potential but should be assessed on identified gaps."
    : fitScore >= 40
    ? "Consider carefully. The candidate has some relevant qualifications but significant gaps exist."
    : "May not be the best fit for this role. Consider other candidates or a different position.";

  return { overallFit, fitScore, strengths, concerns, highlights, recommendation };
};

const AICandidateSummary = ({ candidate }: { candidate: Candidate }) => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = () => {
    setLoading(true);
    setTimeout(() => {
      setSummary(generateSummary(candidate));
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    generate();
  }, [candidate.id]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Analyzing candidate profile...</span>
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" /> AI Summary
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={generate} className="gap-1">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fit Score */}
        <div className="flex items-center justify-between">
          <Badge className={`${fitColors[summary.overallFit]} border text-sm px-3 py-1`}>{summary.overallFit}</Badge>
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all bg-primary"
                style={{ width: `${summary.fitScore}%` }}
              />
            </div>
            <span className="text-sm font-bold text-foreground">{summary.fitScore}%</span>
          </div>
        </div>

        {/* Highlights */}
        <p className="text-sm text-foreground leading-relaxed">{summary.highlights}</p>

        {/* Strengths */}
        {summary.strengths.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <ThumbsUp className="h-3.5 w-3.5 text-success" />
              <span className="text-xs font-semibold text-success uppercase tracking-wide">Strengths</span>
            </div>
            <ul className="space-y-1">
              {summary.strengths.map((s, i) => (
                <li key={i} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-success mt-0.5">•</span> {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Concerns */}
        {summary.concerns.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <ThumbsDown className="h-3.5 w-3.5 text-destructive" />
              <span className="text-xs font-semibold text-destructive uppercase tracking-wide">Concerns</span>
            </div>
            <ul className="space-y-1">
              {summary.concerns.map((c, i) => (
                <li key={i} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-destructive mt-0.5">•</span> {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendation */}
        <div className="rounded-lg bg-muted/50 p-3 border">
          <div className="flex items-center gap-1.5 mb-1">
            <Minus className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">Recommendation</span>
          </div>
          <p className="text-sm text-foreground">{summary.recommendation}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AICandidateSummary;
