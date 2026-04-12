import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, Copy, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Question {
  question: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  followUp: string;
  evaluationCriteria: string;
}

const questionBank: Record<string, Question[]> = {
  technical: [
    { question: "Walk me through how you would architect a real-time collaborative editing feature.", category: "System Design", difficulty: "Hard", followUp: "How would you handle conflict resolution?", evaluationCriteria: "Look for understanding of WebSockets, CRDTs, operational transforms" },
    { question: "Describe a time you optimized a critical performance bottleneck. What was the impact?", category: "Performance", difficulty: "Medium", followUp: "What monitoring tools did you use to identify the bottleneck?", evaluationCriteria: "Evidence of profiling, metrics-driven optimization" },
    { question: "How do you approach testing in your projects? What's your testing strategy?", category: "Testing", difficulty: "Medium", followUp: "How do you decide what to unit test vs integration test?", evaluationCriteria: "Testing pyramid understanding, pragmatic approach" },
    { question: "Explain how you would implement authentication and authorization in a microservices architecture.", category: "Security", difficulty: "Hard", followUp: "How would you handle token refresh and session management?", evaluationCriteria: "JWT, OAuth2, RBAC knowledge" },
    { question: "What's your approach to code reviews? What do you look for?", category: "Collaboration", difficulty: "Easy", followUp: "How do you handle disagreements in code reviews?", evaluationCriteria: "Constructive feedback, focus on maintainability" },
  ],
  behavioral: [
    { question: "Tell me about a project where you had to make a difficult technical trade-off.", category: "Decision Making", difficulty: "Medium", followUp: "What would you do differently in hindsight?", evaluationCriteria: "Structured thinking, weighing pros/cons, stakeholder communication" },
    { question: "Describe a situation where you disagreed with your manager's approach.", category: "Conflict Resolution", difficulty: "Medium", followUp: "How did you communicate your perspective?", evaluationCriteria: "Professional communication, data-driven arguments" },
    { question: "How do you prioritize competing deadlines and multiple projects?", category: "Time Management", difficulty: "Easy", followUp: "Give a specific example of when this was challenging.", evaluationCriteria: "Prioritization frameworks, stakeholder management" },
    { question: "Tell me about a time you mentored a junior team member.", category: "Leadership", difficulty: "Medium", followUp: "What was the outcome of your mentorship?", evaluationCriteria: "Patience, clear communication, measurable growth" },
    { question: "Describe a failure you experienced and what you learned from it.", category: "Growth Mindset", difficulty: "Easy", followUp: "How has that experience changed your approach?", evaluationCriteria: "Self-awareness, learning orientation, resilience" },
  ],
  culture: [
    { question: "What type of work environment brings out your best performance?", category: "Work Style", difficulty: "Easy", followUp: "How do you adapt when the environment isn't ideal?", evaluationCriteria: "Self-awareness, adaptability, alignment with company culture" },
    { question: "How do you stay current with industry trends and new technologies?", category: "Continuous Learning", difficulty: "Easy", followUp: "What's the most recent thing you learned that excited you?", evaluationCriteria: "Curiosity, proactive learning, knowledge sharing" },
    { question: "Describe how you contribute to team culture beyond your direct responsibilities.", category: "Team Contribution", difficulty: "Medium", followUp: "What initiatives have you started or contributed to?", evaluationCriteria: "Community building, initiative, beyond-job-description contributions" },
  ],
  design: [
    { question: "Walk me through your design process from user research to final deliverable.", category: "Process", difficulty: "Medium", followUp: "How do you handle stakeholder feedback that contradicts user research?", evaluationCriteria: "Structured process, user-centered thinking, iteration" },
    { question: "How do you ensure your designs are accessible to all users?", category: "Accessibility", difficulty: "Medium", followUp: "What tools do you use to validate accessibility?", evaluationCriteria: "WCAG knowledge, inclusive design principles" },
    { question: "Show me a project where you used data to inform design decisions.", category: "Data-Driven Design", difficulty: "Hard", followUp: "What metrics did you track after launch?", evaluationCriteria: "Analytics integration, A/B testing, measurable outcomes" },
  ],
  sales: [
    { question: "Describe your approach to qualifying leads and managing your pipeline.", category: "Pipeline", difficulty: "Medium", followUp: "How do you handle leads that go cold?", evaluationCriteria: "BANT/MEDDIC framework, pipeline hygiene, persistence" },
    { question: "Tell me about your most challenging deal. How did you close it?", category: "Closing", difficulty: "Hard", followUp: "What was the key turning point?", evaluationCriteria: "Negotiation skills, persistence, creative problem-solving" },
    { question: "How do you handle objections during a sales conversation?", category: "Objection Handling", difficulty: "Medium", followUp: "Give me an example of an objection you turned into an advantage.", evaluationCriteria: "Active listening, reframing, value articulation" },
  ],
};

const difficultyColors: Record<string, string> = {
  Easy: "bg-success/10 text-success",
  Medium: "bg-amber-500/10 text-amber-600",
  Hard: "bg-destructive/10 text-destructive",
};

const AIInterviewQuestions = ({ jobTitle, skills }: { jobTitle: string; skills: string[] }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const generateQuestions = () => {
    setGenerating(true);
    setTimeout(() => {
      const isDesign = jobTitle.toLowerCase().includes("design");
      const isSales = jobTitle.toLowerCase().includes("sales");
      
      const pool = [
        ...(isDesign ? questionBank.design : isSales ? questionBank.sales : questionBank.technical),
        ...questionBank.behavioral,
        ...questionBank.culture,
      ];

      // Shuffle and pick 6-8 questions
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      setQuestions(shuffled.slice(0, 7));
      setGenerating(false);
      toast.success("Interview questions generated!");
    }, 1200);
  };

  const copyAll = () => {
    const text = questions.map((q, i) => `${i + 1}. [${q.category}] ${q.question}\n   Follow-up: ${q.followUp}\n   Evaluate: ${q.evaluationCriteria}`).join("\n\n");
    navigator.clipboard.writeText(text);
    toast.success("All questions copied!");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" /> AI Interview Questions
        </CardTitle>
        <div className="flex gap-2">
          {questions.length > 0 && (
            <Button variant="ghost" size="sm" onClick={copyAll} className="gap-1">
              <Copy className="h-3.5 w-3.5" /> Copy All
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={generateQuestions} disabled={generating} className="gap-1">
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : questions.length > 0 ? <RefreshCw className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
            {generating ? "Generating..." : questions.length > 0 ? "Regenerate" : "Generate"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {questions.length === 0 && !generating && (
          <p className="text-sm text-muted-foreground text-center py-4">Click "Generate" to create tailored interview questions for this role.</p>
        )}
        {generating && (
          <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Analyzing role and generating questions...</span>
          </div>
        )}
        <div className="space-y-2">
          {questions.map((q, i) => (
            <div key={i} className="rounded-lg border p-3 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpanded(expanded === i ? null : i)}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">{q.category}</Badge>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColors[q.difficulty]}`}>{q.difficulty}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{q.question}</p>
                </div>
                {expanded === i ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />}
              </div>
              {expanded === i && (
                <div className="mt-3 pl-2 border-l-2 border-primary/20 space-y-2">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Follow-up:</span>
                    <p className="text-sm text-foreground">{q.followUp}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">What to evaluate:</span>
                    <p className="text-sm text-foreground">{q.evaluationCriteria}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInterviewQuestions;
