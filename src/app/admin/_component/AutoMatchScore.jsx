"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { useAts } from "../_context/AtsContext";

const jobRequirements = {
  "1": { required: ["React", "TypeScript"], preferred: ["Node.js", "GraphQL", "Testing", "Next.js"], minExperience: 5 },
  "2": { required: ["Figma", "User Research"], preferred: ["Sketch", "Design Systems", "Prototyping", "CSS"], minExperience: 4 },
  "3": { required: ["Docker", "AWS"], preferred: ["Kubernetes", "Terraform", "CI/CD", "Linux"], minExperience: 3 },
  "6": { required: ["Python", "PostgreSQL"], preferred: ["Django", "Redis", "Docker", "API Design"], minExperience: 3 },
  "7": { required: ["User Research"], preferred: ["Usability Testing", "Analytics", "Prototyping", "Figma"], minExperience: 2 },
  "8": { required: ["CRM", "Negotiation"], preferred: ["Cold Calling", "Sales Strategy", "Pipeline Management"], minExperience: 2 },
};

const AutoMatchScore = ({ candidateId }) => {
  const { candidates } = useAts();
  const candidate = candidates.find((c) => c.id === candidateId);
  if (!candidate) return null;

  const reqs = jobRequirements[candidate.jobId];
  if (!reqs) return null;

  const candidateSkillsLower = candidate.skills.map((s) => s.toLowerCase());
  const requiredMatches = reqs.required.filter((r) => candidateSkillsLower.includes(r.toLowerCase()));
  const preferredMatches = reqs.preferred.filter((p) => candidateSkillsLower.includes(p.toLowerCase()));

  const expYears = parseInt(candidate.experience) || 0;
  const expScore = Math.min(expYears / reqs.minExperience, 1);

  const requiredScore = reqs.required.length > 0 ? requiredMatches.length / reqs.required.length : 1;
  const preferredScore = reqs.preferred.length > 0 ? preferredMatches.length / reqs.preferred.length : 0;

  const overall = Math.round((requiredScore * 50 + preferredScore * 30 + expScore * 20));

  const getColor = (score) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-primary";
    if (score >= 40) return "text-accent-foreground";
    return "text-destructive";
  };

  const getLabel = (score) => {
    if (score >= 80) return "Strong Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Partial Match";
    return "Weak Match";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> Auto-Match Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="flex items-center gap-4">
          <div className={`text-3xl font-bold ${getColor(overall)}`}>{overall}%</div>
          <div className="flex-1">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{getLabel(overall)}</span>
              <span>{overall}/100</span>
            </div>
            <Progress value={overall} className="h-2" />
          </div>
        </div>

        {/* Required Skills */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Required Skills ({requiredMatches.length}/{reqs.required.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {reqs.required.map((skill) => {
              const has = candidateSkillsLower.includes(skill.toLowerCase());
              return (
                <Badge key={skill} variant="outline" className={`gap-1 text-xs ${has ? "border-primary/30 text-primary" : "border-destructive/30 text-destructive"}`}>
                  {has ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {skill}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Preferred Skills */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Preferred Skills ({preferredMatches.length}/{reqs.preferred.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {reqs.preferred.map((skill) => {
              const has = candidateSkillsLower.includes(skill.toLowerCase());
              return (
                <Badge key={skill} variant="outline" className={`gap-1 text-xs ${has ? "border-primary/20 text-foreground" : "border-muted text-muted-foreground"}`}>
                  {has ? <CheckCircle className="h-3 w-3 text-primary" /> : <AlertCircle className="h-3 w-3" />}
                  {skill}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Experience */}
        <div className="flex items-center justify-between text-sm border-t pt-3">
          <span className="text-muted-foreground">Experience</span>
          <span className={`font-medium ${expScore >= 1 ? "text-primary" : "text-accent-foreground"}`}>
            {candidate.experience} (min {reqs.minExperience}yr required)
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoMatchScore;
