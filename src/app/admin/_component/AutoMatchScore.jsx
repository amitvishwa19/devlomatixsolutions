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
  const { assessCandidateMatch } = useAts();
  const match = assessCandidateMatch(candidateId);
  
  if (!match || match.required.length === 0) return null;

  const { score, required, preferred, matchedRequired, matchedPreferred, expScore, minExperience, candidateExperience } = match;

  const getColor = (s) => {
    if (s >= 80) return "text-success";
    if (s >= 60) return "text-primary";
    if (s >= 40) return "text-accent-foreground";
    return "text-destructive";
  };

  const getLabel = (s) => {
    if (s >= 80) return "Strong Match";
    if (s >= 60) return "Good Match";
    if (s >= 40) return "Partial Match";
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
          <div className={`text-3xl font-bold ${getColor(score)}`}>{score}%</div>
          <div className="flex-1">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{getLabel(score)}</span>
              <span>{score}/100</span>
            </div>
            <Progress value={score} className="h-2" />
          </div>
        </div>

        {/* Required Skills */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Required Skills ({matchedRequired.length}/{required.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {required.map((skill) => {
              const has = matchedRequired.includes(skill);
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
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Preferred Skills ({matchedPreferred.length}/{preferred.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {preferred.map((skill) => {
              const has = matchedPreferred.includes(skill);
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
            {candidateExperience} years (min {minExperience}yr required)
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoMatchScore;
