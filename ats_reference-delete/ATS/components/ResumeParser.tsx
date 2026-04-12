import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, Loader2, Sparkles, GraduationCap, Briefcase, Code, Award } from "lucide-react";
import { toast } from "sonner";

interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
  experience: { title: string; company: string; duration: string; highlights: string[] }[];
  education: { degree: string; school: string; year: string }[];
  certifications: string[];
  matchScore: number;
}

const simulateParse = (fileName: string): ParsedResume => {
  const names = ["Jordan Mitchell", "Priya Sharma", "Alex Rivera", "Taylor Kim", "Morgan Chen"];
  const name = names[Math.floor(Math.random() * names.length)];
  const skillSets = [
    ["React", "TypeScript", "Node.js", "GraphQL", "AWS", "Docker", "PostgreSQL", "Jest"],
    ["Python", "Django", "FastAPI", "TensorFlow", "SQL", "Redis", "Kubernetes", "CI/CD"],
    ["Figma", "Sketch", "Adobe XD", "Design Systems", "User Research", "Prototyping", "CSS", "HTML"],
    ["Java", "Spring Boot", "Microservices", "Kafka", "MongoDB", "Jenkins", "Terraform", "Go"],
  ];
  const skills = skillSets[Math.floor(Math.random() * skillSets.length)];

  return {
    name,
    email: `${name.toLowerCase().replace(" ", ".")}@email.com`,
    phone: `+1 555-0${Math.floor(Math.random() * 900 + 100)}`,
    summary: `Experienced software professional with ${Math.floor(Math.random() * 8 + 3)}+ years of expertise in building scalable applications. Proven track record of delivering high-impact projects in fast-paced environments.`,
    skills,
    experience: [
      {
        title: "Senior Engineer",
        company: "TechCorp Inc.",
        duration: `${Math.floor(Math.random() * 3 + 2)} years`,
        highlights: ["Led team of 5 engineers", "Reduced deployment time by 60%", "Built microservices architecture"],
      },
      {
        title: "Software Engineer",
        company: "StartupXYZ",
        duration: `${Math.floor(Math.random() * 3 + 1)} years`,
        highlights: ["Full-stack development", "Implemented CI/CD pipeline", "Mentored junior developers"],
      },
    ],
    education: [
      { degree: "B.S. Computer Science", school: "Stanford University", year: "2018" },
    ],
    certifications: ["AWS Solutions Architect", "Google Cloud Professional"],
    matchScore: Math.floor(Math.random() * 30 + 70),
  };
};

const ResumeParser = ({ onParsed }: { onParsed?: (data: ParsedResume) => void }) => {
  const [parsing, setParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsed, setParsed] = useState<ParsedResume | null>(null);
  const [fileName, setFileName] = useState("");

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.match(/\.(pdf|docx?|txt)$/i)) {
      toast.error("Please upload a PDF, DOC, or TXT file");
      return;
    }
    setFileName(file.name);
    setParsing(true);
    setParsed(null);
    setProgress(0);

    const steps = [10, 25, 45, 65, 80, 95, 100];
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i]);
        i++;
      } else {
        clearInterval(interval);
        const result = simulateParse(file.name);
        setParsed(result);
        setParsing(false);
        onParsed?.(result);
        toast.success("Resume parsed successfully");
      }
    }, 400);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!parsed && !parsing && (
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-8 transition-colors hover:border-primary/50 hover:bg-muted/50">
          <div className="rounded-full bg-primary/10 p-3">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Drop resume here or click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, TXT • Max 10MB</p>
          </div>
          <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleUpload} />
        </label>
      )}

      {/* Parsing Progress */}
      {parsing && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Parsing {fileName}...</p>
                <p className="text-xs text-muted-foreground">
                  {progress < 30 ? "Extracting text..." : progress < 60 ? "Identifying skills & experience..." : progress < 90 ? "Analyzing qualifications..." : "Finalizing..."}
                </p>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Parsed Result */}
      {parsed && (
        <div className="space-y-4 animate-fade-in">
          {/* Header */}
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{parsed.name}</p>
                    <p className="text-xs text-muted-foreground">{parsed.email} • {parsed.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-lg font-bold text-primary">{parsed.matchScore}%</span>
                  <span className="text-xs text-muted-foreground">match</span>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{parsed.summary}</p>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Code className="h-4 w-4" /> Extracted Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {parsed.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Briefcase className="h-4 w-4" /> Work Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {parsed.experience.map((exp, i) => (
                <div key={i} className="border-l-2 border-primary/20 pl-4">
                  <p className="font-medium text-sm text-foreground">{exp.title}</p>
                  <p className="text-xs text-muted-foreground">{exp.company} • {exp.duration}</p>
                  <ul className="mt-1.5 space-y-1">
                    {exp.highlights.map((h, j) => (
                      <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-primary mt-0.5">•</span> {h}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Education & Certs */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Education</CardTitle>
              </CardHeader>
              <CardContent>
                {parsed.education.map((edu, i) => (
                  <div key={i}>
                    <p className="text-sm font-medium text-foreground">{edu.degree}</p>
                    <p className="text-xs text-muted-foreground">{edu.school} • {edu.year}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Award className="h-4 w-4" /> Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {parsed.certifications.map((cert, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      <span className="text-sm text-foreground">{cert}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button className="flex-1 gap-2" onClick={() => { toast.success("Candidate added from resume"); }}>
              <FileText className="h-4 w-4" /> Add as Candidate
            </Button>
            <Button variant="outline" onClick={() => { setParsed(null); setFileName(""); }}>
              Parse Another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeParser;
