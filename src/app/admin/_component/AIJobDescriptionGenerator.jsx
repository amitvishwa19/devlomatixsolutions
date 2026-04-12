"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sparkles, Copy, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

const seniorityLevels = ["Junior", "Mid-Level", "Senior", "Lead", "Principal", "Director"];
const jobTemplates = {
  Engineering: {
    responsibilities: [
      "Design, develop, and maintain high-quality software applications",
      "Collaborate with cross-functional teams to define and implement new features",
      "Write clean, testable, and well-documented code",
      "Participate in code reviews and mentor junior developers",
      "Troubleshoot and debug production issues with urgency",
    ],
    requirements: [
      "Strong proficiency in modern programming languages and frameworks",
      "Experience with cloud platforms (AWS, GCP, or Azure)",
      "Solid understanding of software design patterns and principles",
      "Excellent problem-solving and analytical skills",
      "Strong communication and collaboration abilities",
    ],
    perks: ["Flexible remote work", "Competitive equity package", "Annual learning budget of $3,000", "Health, dental & vision insurance", "Unlimited PTO"],
  },
  Design: {
    responsibilities: [
      "Create intuitive, visually compelling user interfaces and experiences",
      "Conduct user research and translate insights into design solutions",
      "Build and maintain a scalable design system",
      "Collaborate closely with engineering to ensure pixel-perfect implementation",
      "Present design rationale to stakeholders and iterate based on feedback",
    ],
    requirements: [
      "Proficiency in Figma, Sketch, or similar design tools",
      "Strong portfolio demonstrating end-to-end product design",
      "Understanding of accessibility standards and responsive design",
      "Experience with user research methodologies",
      "Excellent visual design skills including typography and color theory",
    ],
    perks: ["Creative freedom", "Latest design tools provided", "Conference attendance budget", "Flexible schedule", "Wellness stipend"],
  },
  Marketing: {
    responsibilities: [
      "Develop and execute multi-channel marketing campaigns",
      "Analyze campaign performance metrics and optimize ROI",
      "Create compelling content that drives engagement and conversions",
      "Manage social media presence and community engagement",
      "Collaborate with sales to align marketing and revenue goals",
    ],
    requirements: [
      "Proven track record in digital marketing and analytics",
      "Experience with marketing automation tools (HubSpot, Marketo)",
      "Strong copywriting and content creation skills",
      "Data-driven mindset with proficiency in analytics platforms",
      "Creative thinking with attention to brand consistency",
    ],
    perks: ["Marketing conference passes", "Remote-first culture", "Performance bonuses", "Professional development budget", "Team retreats"],
  },
  Sales: {
    responsibilities: [
      "Identify, qualify, and close new business opportunities",
      "Build and maintain strong client relationships",
      "Meet and exceed quarterly revenue targets",
      "Collaborate with marketing on lead generation strategies",
      "Provide market feedback to inform product development",
    ],
    requirements: [
      "Proven sales track record with consistent quota attainment",
      "Strong negotiation and presentation skills",
      "Experience with CRM tools (Salesforce, HubSpot)",
      "Excellent interpersonal and relationship-building abilities",
      "Self-motivated with a results-driven mindset",
    ],
    perks: ["Uncapped commission structure", "President's Club trips", "Company car program", "Health benefits", "Stock options"],
  },
};

const AIJobDescriptionGenerator = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [seniority, setSeniority] = useState("Senior");
  const [skills, setSkills] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState("");

  const generateDescription = () => {
    if (!title.trim()) {
      toast.error("Please enter a job title");
      return;
    }

    setGenerating(true);
    
    // Simulate AI generation with template-based output
    setTimeout(() => {
      const template = jobTemplates[department] || jobTemplates.Engineering;
      const skillList = skills.split(",").map((s) => s.trim()).filter(Boolean);
      
      const desc = `# ${seniority} ${title}

## About the Role
We're looking for a talented ${seniority} ${title} to join our ${department} team. This is an exciting opportunity to make a significant impact in a fast-growing company that values innovation, collaboration, and continuous learning.

## What You'll Do
${template.responsibilities.map((r) => `• ${r}`).join("\n")}

## What We're Looking For
${template.requirements.map((r) => `• ${r}`).join("\n")}
${skillList.length > 0 ? `\n### Required Skills\n${skillList.map((s) => `• ${s}`).join("\n")}` : ""}

## Why Join Us
${template.perks.map((p) => `✨ ${p}`).join("\n")}

## Our Values
We believe in building a diverse, inclusive workplace where everyone can do their best work. We encourage applications from all backgrounds and experiences.

---
*This position offers competitive compensation, comprehensive benefits, and the opportunity to work with a world-class team.*`;

      setGeneratedDescription(desc);
      setGenerating(false);
      toast.success("Job description generated!");
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDescription);
    toast.success("Copied to clipboard!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" /> AI Generate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" /> AI Job Description Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Frontend Developer" />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(jobTemplates).map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Seniority Level</Label>
              <Select value={seniority} onValueChange={setSeniority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {seniorityLevels.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Key Skills (comma-separated)</Label>
              <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, TypeScript, Node.js" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={generateDescription} disabled={generating} className="gap-2">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating ? "Generating..." : "Generate Description"}
            </Button>
            {generatedDescription && (
              <>
                <Button variant="outline" onClick={generateDescription} className="gap-2">
                  <RefreshCw className="h-4 w-4" /> Regenerate
                </Button>
                <Button variant="outline" onClick={copyToClipboard} className="gap-2">
                  <Copy className="h-4 w-4" /> Copy
                </Button>
              </>
            )}
          </div>

          {generatedDescription && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <Textarea
                value={generatedDescription}
                onChange={(e) => setGeneratedDescription(e.target.value)}
                className="min-h-[400px] font-mono text-sm bg-transparent border-0 resize-none focus-visible:ring-0"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIJobDescriptionGenerator;
