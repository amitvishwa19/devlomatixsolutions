import { useState } from "react";

export const defaultCriteria = [
  { id: "skills", name: "Technical Skills", weight: 5, description: "Relevant technical abilities and expertise" },
  { id: "experience", name: "Experience", weight: 4, description: "Years and quality of relevant work experience" },
  { id: "culture", name: "Culture Fit", weight: 3, description: "Alignment with company values and team dynamics" },
  { id: "communication", name: "Communication", weight: 3, description: "Clarity, articulation, and interpersonal skills" },
  { id: "problem_solving", name: "Problem Solving", weight: 4, description: "Analytical thinking and creative solutions" },
];

export const scorecardTemplates = [
  { id: "sc1", jobId: "1", criteria: defaultCriteria },
  { id: "sc2", jobId: "2", criteria: [
    { id: "design_skills", name: "Design Skills", weight: 5, description: "Visual design, typography, color theory" },
    { id: "ux_thinking", name: "UX Thinking", weight: 5, description: "User-centered design approach" },
    { id: "tools", name: "Tool Proficiency", weight: 3, description: "Figma, Sketch, prototyping tools" },
    { id: "culture", name: "Culture Fit", weight: 3, description: "Team alignment and collaboration" },
    { id: "communication", name: "Communication", weight: 4, description: "Presenting and articulating design decisions" },
  ]},
  { id: "sc3", jobId: "3", criteria: defaultCriteria },
  { id: "sc6", jobId: "6", criteria: defaultCriteria },
  { id: "sc7", jobId: "7", criteria: defaultCriteria },
  { id: "sc8", jobId: "8", criteria: [
    { id: "sales_skills", name: "Sales Acumen", weight: 5, description: "Closing ability, pipeline management" },
    { id: "communication", name: "Communication", weight: 5, description: "Persuasion and relationship building" },
    { id: "experience", name: "Experience", weight: 3, description: "Relevant sales track record" },
    { id: "culture", name: "Culture Fit", weight: 3, description: "Team alignment" },
    { id: "drive", name: "Drive & Motivation", weight: 4, description: "Self-motivation and goal orientation" },
  ]},
];

export const candidateScores = [
  { id: "cs1", candidateId: "1", scorecardId: "sc1", scores: { skills: 4, experience: 5, culture: 4, communication: 3, problem_solving: 5 }, reviewer: "Rajesh Kumar", submittedAt: "2026-04-09T14:00:00" },
  { id: "cs2", candidateId: "3", scorecardId: "sc2", scores: { design_skills: 5, ux_thinking: 5, tools: 4, culture: 5, communication: 5 }, reviewer: "Priya Sharma", submittedAt: "2026-04-07T15:00:00" },
  { id: "cs3", candidateId: "5", scorecardId: "sc1", scores: { skills: 5, experience: 5, culture: 5, communication: 4, problem_solving: 5 }, reviewer: "CTO", submittedAt: "2026-04-08T16:00:00" },
  { id: "cs4", candidateId: "10", scorecardId: "sc1", scores: { skills: 4, experience: 4, culture: 4, communication: 4, problem_solving: 4 }, reviewer: "Rajesh Kumar", submittedAt: "2026-04-10T10:00:00" },
  { id: "cs5", candidateId: "6", scorecardId: "sc2", scores: { design_skills: 4, ux_thinking: 4, tools: 5, culture: 3, communication: 4 }, reviewer: "Design Lead", submittedAt: "2026-04-08T11:00:00" },
];

export const jobs = [
  { id: "1", title: "Senior Frontend Developer", department: "Engineering", location: "Remote", type: "Full-time", salary: "₹18L - ₹28L", status: "open", applicants: 24, posted: "2026-03-15", description: "We're looking for a senior frontend developer with 5+ years of React experience to lead our frontend architecture." },
  { id: "2", title: "Product Designer", department: "Design", location: "Mumbai, MH", type: "Full-time", salary: "₹14L - ₹22L", status: "open", applicants: 18, posted: "2026-03-20", description: "Join our design team to create beautiful, user-centric product experiences." },
  { id: "3", title: "DevOps Engineer", department: "Engineering", location: "Bengaluru, KA", type: "Full-time", salary: "₹20L - ₹30L", status: "open", applicants: 12, posted: "2026-03-25", description: "Build and maintain our cloud infrastructure and CI/CD pipelines." },
  { id: "4", title: "Marketing Manager", department: "Marketing", location: "Remote", type: "Full-time", salary: "₹12L - ₹18L", status: "closed", applicants: 35, posted: "2026-02-10", description: "Lead our marketing campaigns and drive brand awareness." },
  { id: "5", title: "Data Analyst", department: "Analytics", location: "Hyderabad, TG", type: "Contract", salary: "₹10L - ₹16L", status: "draft", applicants: 0, posted: "2026-04-01", description: "Analyze data to provide actionable insights for business decisions." },
  { id: "6", title: "Backend Engineer", department: "Engineering", location: "Remote", type: "Full-time", salary: "₹16L - ₹25L", status: "open", applicants: 20, posted: "2026-03-28", description: "Design and implement scalable backend services and APIs." },
  { id: "7", title: "UX Researcher", department: "Design", location: "Remote", type: "Part-time", salary: "₹8L - ₹14L", status: "open", applicants: 8, posted: "2026-04-02", description: "Conduct user research to inform product design decisions." },
  { id: "8", title: "Sales Representative", department: "Sales", location: "Delhi, DL", type: "Full-time", salary: "₹6L - ₹12L + commission", status: "open", applicants: 15, posted: "2026-04-05", description: "Drive revenue growth through new client acquisition." },
];

export const candidates = [
  { id: "1", name: "Ananya Gupta", email: "ananya.gupta@example.com", phone: "+91 98765-43210", jobId: "1", jobTitle: "Senior Frontend Developer", stage: "interview", rating: 4, appliedDate: "2026-03-18", avatar: "AG", notes: ["Strong React experience", "Passed technical screen"], skills: ["React", "TypeScript", "Node.js", "GraphQL"], experience: "7 years", source: "LinkedIn", linkedin: "linkedin.com/in/ananyagupta" },
  { id: "2", name: "Vikram Malhotra", email: "vikram.m@example.com", phone: "+91 98765-43211", jobId: "1", jobTitle: "Senior Frontend Developer", stage: "screening", rating: 3, appliedDate: "2026-03-20", avatar: "VM", notes: ["Good portfolio"], skills: ["React", "JavaScript", "CSS"], experience: "4 years", source: "Naukri" },
  { id: "3", name: "Meera Krishnan", email: "meera.k@example.com", phone: "+91 98765-43212", jobId: "2", jobTitle: "Product Designer", stage: "offer", rating: 5, appliedDate: "2026-03-22", avatar: "MK", notes: ["Excellent design skills", "Culture fit"], skills: ["Figma", "Sketch", "User Research", "Prototyping"], experience: "6 years", source: "Referral", linkedin: "linkedin.com/in/meerakrishnan" },
  { id: "4", name: "Arjun Reddy", email: "arjun.r@example.com", phone: "+91 98765-43213", jobId: "3", jobTitle: "DevOps Engineer", stage: "applied", rating: 3, appliedDate: "2026-03-28", avatar: "AR", notes: [], skills: ["AWS", "Docker", "Kubernetes", "Terraform"], experience: "5 years", source: "Company Website" },
  { id: "5", name: "Deepika Nair", email: "deepika.n@example.com", phone: "+91 98765-43214", jobId: "1", jobTitle: "Senior Frontend Developer", stage: "hired", rating: 5, appliedDate: "2026-03-16", avatar: "DN", notes: ["Accepted offer", "Start date: April 15"], skills: ["React", "Vue", "TypeScript", "Testing"], experience: "8 years", source: "Recruiter" },
  { id: "6", name: "Karthik Iyer", email: "karthik.i@example.com", phone: "+91 98765-43215", jobId: "2", jobTitle: "Product Designer", stage: "interview", rating: 4, appliedDate: "2026-03-24", avatar: "KI", notes: ["Second round scheduled"], skills: ["UI Design", "Figma", "Design Systems"], experience: "5 years", source: "LinkedIn" },
  { id: "7", name: "Sneha Deshmukh", email: "sneha.d@example.com", phone: "+91 98765-43216", jobId: "6", jobTitle: "Backend Engineer", stage: "screening", rating: 4, appliedDate: "2026-03-30", avatar: "SD", notes: ["Strong Python background"], skills: ["Python", "Django", "PostgreSQL", "Redis"], experience: "6 years", source: "Naukri" },
  { id: "8", name: "Rohit Verma", email: "rohit.v@example.com", phone: "+91 98765-43217", jobId: "3", jobTitle: "DevOps Engineer", stage: "rejected", rating: 2, appliedDate: "2026-03-26", avatar: "RV", notes: ["Insufficient experience"], skills: ["Linux", "Docker"], experience: "2 years", source: "LinkedIn" },
  { id: "9", name: "Pooja Mehta", email: "pooja.m@example.com", phone: "+91 98765-43218", jobId: "6", jobTitle: "Backend Engineer", stage: "applied", rating: 3, appliedDate: "2026-04-02", avatar: "PM", notes: [], skills: ["Java", "Spring Boot", "MySQL"], experience: "3 years", source: "Company Website" },
  { id: "10", name: "Aditya Joshi", email: "aditya.j@example.com", phone: "+91 98765-43219", jobId: "1", jobTitle: "Senior Frontend Developer", stage: "interview", rating: 4, appliedDate: "2026-03-19", avatar: "AJ", notes: ["Technical interview passed"], skills: ["React", "Next.js", "TypeScript", "Tailwind"], experience: "6 years", source: "Referral" },
  { id: "11", name: "Kavita Patel", email: "kavita.p@example.com", phone: "+91 98765-43220", jobId: "7", jobTitle: "UX Researcher", stage: "screening", rating: 4, appliedDate: "2026-04-03", avatar: "KP", notes: ["PhD in HCI"], skills: ["User Research", "Usability Testing", "Analytics"], experience: "4 years", source: "LinkedIn" },
  { id: "12", name: "Sanjay Thakur", email: "sanjay.t@example.com", phone: "+91 98765-43221", jobId: "8", jobTitle: "Sales Representative", stage: "interview", rating: 3, appliedDate: "2026-04-06", avatar: "ST", notes: ["Good communication skills"], skills: ["CRM", "Negotiation", "Cold Calling"], experience: "3 years", source: "Naukri" },
];

export const interviews = [
  { id: "1", candidateId: "1", candidateName: "Ananya Gupta", candidateAvatar: "AG", jobTitle: "Senior Frontend Developer", type: "Technical", date: "2026-04-12", time: "10:00 AM", duration: "60 min", interviewer: "Rajesh Kumar", status: "scheduled" },
  { id: "2", candidateId: "6", candidateName: "Karthik Iyer", candidateAvatar: "KI", jobTitle: "Product Designer", type: "Portfolio Review", date: "2026-04-12", time: "2:00 PM", duration: "45 min", interviewer: "Priya Sharma", status: "scheduled" },
  { id: "3", candidateId: "10", candidateName: "Aditya Joshi", candidateAvatar: "AJ", jobTitle: "Senior Frontend Developer", type: "Culture Fit", date: "2026-04-13", time: "11:00 AM", duration: "30 min", interviewer: "Amit Verma", status: "scheduled" },
  { id: "4", candidateId: "12", candidateName: "Sanjay Thakur", candidateAvatar: "ST", jobTitle: "Sales Representative", type: "Behavioral", date: "2026-04-14", time: "9:00 AM", duration: "45 min", interviewer: "Neha Kapoor", status: "scheduled" },
  { id: "5", candidateId: "5", candidateName: "Deepika Nair", candidateAvatar: "DN", jobTitle: "Senior Frontend Developer", type: "Final Round", date: "2026-04-08", time: "3:00 PM", duration: "60 min", interviewer: "CTO", status: "completed", feedback: "Excellent candidate, strong technical skills and leadership potential.", rating: 5 },
  { id: "6", candidateId: "3", candidateName: "Meera Krishnan", candidateAvatar: "MK", jobTitle: "Product Designer", type: "Design Challenge", date: "2026-04-07", time: "1:00 PM", duration: "90 min", interviewer: "Design Lead", status: "completed", feedback: "Outstanding design thinking and execution.", rating: 5 },
];

export const activities = [
  { id: "1", candidateId: "1", type: "stage_change", message: "Moved from Screening to Interview", timestamp: "2026-04-10T10:30:00", user: "Rajesh Kumar" },
  { id: "2", candidateId: "1", type: "note", message: "Added note: Strong React experience", timestamp: "2026-04-09T14:20:00", user: "Priya Sharma" },
  { id: "3", candidateId: "1", type: "interview", message: "Technical interview scheduled for Apr 12", timestamp: "2026-04-08T09:00:00", user: "Rajesh Kumar" },
  { id: "4", candidateId: "1", type: "email", message: "Interview confirmation email sent", timestamp: "2026-04-08T09:05:00", user: "System" },
  { id: "5", candidateId: "3", type: "stage_change", message: "Moved from Interview to Offer", timestamp: "2026-04-09T16:00:00", user: "HR Manager" },
  { id: "6", candidateId: "5", type: "stage_change", message: "Moved from Offer to Hired", timestamp: "2026-04-10T11:00:00", user: "HR Manager" },
  { id: "7", candidateId: "8", type: "stage_change", message: "Moved to Rejected", timestamp: "2026-04-07T15:30:00", user: "Rajesh Kumar" },
  { id: "8", candidateId: "8", type: "email", message: "Rejection email sent", timestamp: "2026-04-07T15:35:00", user: "System" },
];

export const stages = [
  { key: "applied", label: "Applied", color: "bg-muted text-muted-foreground" },
  { key: "screening", label: "Screening", color: "bg-primary/10 text-primary" },
  { key: "interview", label: "Interview", color: "bg-accent/20 text-accent-foreground" },
  { key: "offer", label: "Offer", color: "bg-success/10 text-success" },
  { key: "hired", label: "Hired", color: "bg-success text-success-foreground" },
  { key: "rejected", label: "Rejected", color: "bg-destructive/10 text-destructive" },
];

export const departments = ["All", "Engineering", "Design", "Marketing", "Analytics", "Sales"];
export const locations = ["All", "Remote", "Mumbai, MH", "Bengaluru, KA", "Hyderabad, TG", "Delhi, DL"];
export const jobTypes = ["All", "Full-time", "Part-time", "Contract"];
export const sources = ["All", "LinkedIn", "Naukri", "Referral", "Company Website", "Recruiter"];

export const pipelineChartData = [
  { name: "Applied", count: 45 },
  { name: "Screening", count: 28 },
  { name: "Interview", count: 15 },
  { name: "Offer", count: 6 },
  { name: "Hired", count: 4 },
];

export const weeklyApplications = [
  { week: "Week 1", applications: 12 },
  { week: "Week 2", applications: 19 },
  { week: "Week 3", applications: 15 },
  { week: "Week 4", applications: 22 },
  { week: "Week 5", applications: 28 },
  { week: "Week 6", applications: 18 },
];

export const sourceBreakdown = [
  { source: "LinkedIn", count: 35, color: "hsl(174,62%,38%)" },
  { source: "Naukri", count: 25, color: "hsl(190,70%,40%)" },
  { source: "Referral", count: 20, color: "hsl(38,92%,50%)" },
  { source: "Website", count: 12, color: "hsl(142,71%,45%)" },
  { source: "Recruiter", count: 8, color: "hsl(220,20%,50%)" },
];

export const timeToHireData = [
  { month: "Jan", days: 32 },
  { month: "Feb", days: 28 },
  { month: "Mar", days: 25 },
  { month: "Apr", days: 22 },
];

// Hook for managing state
export function useAtsData() {
  const [jobList, setJobList] = useState(jobs);
  const [candidateList, setCandidateList] = useState(candidates);
  const [interviewList, setInterviewList] = useState(interviews);
  const [scoresList, setScoresList] = useState(candidateScores);
  const [templatesList, setTemplatesList] = useState(scorecardTemplates);

  const addJob = (job) => {
    const newJob = {
      ...job,
      id: String(jobList.length + 1),
      applicants: 0,
      posted: new Date().toISOString().split("T")[0],
    };
    setJobList((prev) => [newJob, ...prev]);
    return newJob;
  };

  const updateJob = (id, updates) => {
    setJobList((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)));
  };

  const deleteJob = (id) => {
    setJobList((prev) => prev.filter((j) => j.id !== id));
  };

  const updateCandidateStage = (id, stage) => {
    setCandidateList((prev) => prev.map((c) => (c.id === id ? { ...c, stage } : c)));
  };

  const updateCandidateRating = (id, rating) => {
    setCandidateList((prev) => prev.map((c) => (c.id === id ? { ...c, rating } : c)));
  };

  const addCandidateNote = (id, note) => {
    setCandidateList((prev) => prev.map((c) => (c.id === id ? { ...c, notes: [...c.notes, note] } : c)));
  };

  const addCandidate = (candidate) => {
    const newCandidate = {
      ...candidate,
      id: String(candidateList.length + 1),
      avatar: candidate.name.split(" ").map((n) => n[0]).join("").toUpperCase(),
      appliedDate: new Date().toISOString().split("T")[0],
    };
    setCandidateList((prev) => [newCandidate, ...prev]);
    return newCandidate;
  };

  const scheduleInterview = (interview) => {
    const newInterview = {
      ...interview,
      id: String(interviewList.length + 1),
      status: "scheduled",
    };
    setInterviewList((prev) => [newInterview, ...prev]);
  };

  const submitScore = (score) => {
    const newScore = {
      ...score,
      id: `cs${scoresList.length + 1}`,
    };
    setScoresList((prev) => [...prev, newScore]);
    return newScore;
  };

  const updateScoreTemplate = (jobId, criteria) => {
    setTemplatesList((prev) => {
      const existing = prev.find((t) => t.jobId === jobId);
      if (existing) {
        return prev.map((t) => (t.jobId === jobId ? { ...t, criteria } : t));
      }
      return [...prev, { id: `sc${prev.length + 1}`, jobId, criteria }];
    });
  };

  const getWeightedScore = (candidateId) => {
    const candidate = candidateList.find((c) => c.id === candidateId);
    if (!candidate) return 0;
    const template = templatesList.find((t) => t.jobId === candidate.jobId);
    const scores = scoresList.filter((s) => s.candidateId === candidateId);
    if (!template || scores.length === 0) return 0;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const score of scores) {
      for (const criterion of template.criteria) {
        const val = score.scores[criterion.id];
        if (val !== undefined) {
          totalWeightedScore += val * criterion.weight;
          totalWeight += criterion.weight;
        }
      }
    }
    return totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) / 100 : 0;
  };

  const getCandidateRanking = (jobId) => {
    const jobCandidates = candidateList.filter((c) => c.jobId === jobId);
    return jobCandidates
      .map((c) => ({ ...c, weightedScore: getWeightedScore(c.id) }))
      .sort((a, b) => b.weightedScore - a.weightedScore);
  };

  return {
    jobs: jobList,
    candidates: candidateList,
    interviews: interviewList,
    scores: scoresList,
    scorecardTemplates: templatesList,
    addJob,
    updateJob,
    deleteJob,
    updateCandidateStage,
    updateCandidateRating,
    addCandidateNote,
    addCandidate,
    scheduleInterview,
    submitScore,
    updateScoreTemplate,
    getWeightedScore,
    getCandidateRanking,
  };
}
