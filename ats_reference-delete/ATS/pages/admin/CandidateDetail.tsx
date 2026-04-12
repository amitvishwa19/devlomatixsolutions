import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, Linkedin } from "lucide-react";
import { useAts } from "@/ATS/context/AtsContext";
import { activities } from "@/ATS/data/mockData";
import StageProgress from "@/ATS/components/StageProgress";
import StarRating from "@/ATS/components/StarRating";
import CandidateScorecard from "@/ATS/components/CandidateScorecard";
import AutoMatchScore from "@/ATS/components/AutoMatchScore";
import AICandidateSummary from "@/ATS/components/AICandidateSummary";
import AIInterviewQuestions from "@/ATS/components/AIInterviewQuestions";
import CollaborativeNotes from "@/ATS/components/CollaborativeNotes";
import { toast } from "sonner";

const CandidateDetail = () => {
  const { id } = useParams();
  const { candidates, updateCandidateStage, updateCandidateRating } = useAts();

  const candidate = candidates.find((c) => c.id === id);
  if (!candidate) {
    return (
      <div className="space-y-4">
        <Link to="/admin/candidates" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Candidates
        </Link>
        <div className="text-center py-12 text-muted-foreground">Candidate not found.</div>
      </div>
    );
  }

  const candidateActivities = activities.filter((a) => a.candidateId === candidate.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/admin/candidates" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Candidates
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {candidate.avatar}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{candidate.name}</h1>
            <p className="text-muted-foreground">{candidate.jobTitle}</p>
            <div className="mt-1">
              <StarRating rating={candidate.rating} size="md" interactive onChange={(r) => { updateCandidateRating(candidate.id, r); toast.success("Rating updated"); }} />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Mail className="h-4 w-4" /> Email</Button>
          <Button variant="outline" className="gap-2"><Phone className="h-4 w-4" /> Call</Button>
        </div>
      </div>

      {/* Stage Progress */}
      <Card>
        <CardHeader><CardTitle className="text-base">Pipeline Stage</CardTitle></CardHeader>
        <CardContent>
          <StageProgress currentStage={candidate.stage} onStageChange={(stage) => { updateCandidateStage(candidate.id, stage); toast.success(`Moved to ${stage}`); }} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Info */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader><CardTitle className="text-base">Contact Info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /> <span className="text-foreground">{candidate.email}</span></div>
              <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /> <span className="text-foreground">{candidate.phone}</span></div>
              {candidate.linkedin && <div className="flex items-center gap-2 text-sm"><Linkedin className="h-4 w-4 text-muted-foreground" /> <span className="text-primary">{candidate.linkedin}</span></div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Position</span><span className="text-foreground">{candidate.jobTitle}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Experience</span><span className="text-foreground">{candidate.experience}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Source</span><span className="text-foreground">{candidate.source}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Applied</span><span className="text-foreground">{candidate.appliedDate}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Skills</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{skill}</span>
                ))}
              </div>
            </CardContent>
          </Card>

          <AutoMatchScore candidateId={candidate.id} />
          <CandidateScorecard candidateId={candidate.id} jobId={candidate.jobId} />
        </div>

        {/* Right: AI Summary, Notes, Questions, Activity */}
        <div className="space-y-6 lg:col-span-2">
          {/* AI Summary */}
          <AICandidateSummary candidate={candidate} />

          {/* Collaborative Notes */}
          <CollaborativeNotes candidateId={candidate.id} existingNotes={candidate.notes} />

          {/* AI Interview Questions */}
          <AIInterviewQuestions jobTitle={candidate.jobTitle} skills={candidate.skills} />

          {/* Activity Timeline */}
          <Card>
            <CardHeader><CardTitle className="text-base">Activity Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {candidateActivities.map((activity) => {
                  const iconMap: Record<string, string> = { stage_change: "🔄", note: "📝", email: "✉️", interview: "📅", rating: "⭐" };
                  return (
                    <div key={activity.id} className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm flex-shrink-0">{iconMap[activity.type] || "•"}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.user} • {new Date(activity.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
                {candidateActivities.length === 0 && <p className="text-sm text-muted-foreground">No activity recorded yet.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;
