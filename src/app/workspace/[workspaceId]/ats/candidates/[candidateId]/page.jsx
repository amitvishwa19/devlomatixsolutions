'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { 
    ChevronLeft, 
    Star, 
    Calendar, 
    MessageSquare, 
    Mail, 
    Phone, 
    MapPin, 
    Download, 
    Share2, 
    MoreHorizontal,
    Sparkles,
    CheckCircle2,
    Clock,
    Briefcase,
    GraduationCap,
    ExternalLink,
    ChevronRight,
    Play,
    User,
    Send,
    ThumbsUp,
    ThumbsDown,
    Award,
    Plus,
    FileText,
    History,
    AlertCircle,
    FileCheck,
    Loader2
} from 'lucide-react';
import axios from 'axios';
import Scorecards from '../../_components/Scorecards';
import { generateOfferLetter } from '@/lib/ats/pdf-generator';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

export default function CandidateProfilePage() {
    const { workspaceId, candidateId } = useParams();
    const router = useRouter();
    const [activeTab, setActiveTab ] = useState('overview');
    const [isScorecardOpen, setIsScorecardOpen] = useState(false);
    const [isOfferGenerating, setIsOfferGenerating] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [isScoring, setIsScoring] = useState(false);

    const handleGenerateOffer = async () => {
        setIsOfferGenerating(true);
        try {
            const data = {
                candidateName: candidate.name,
                jobTitle: candidate.role,
                salary: "₹18,00,000 - ₹24,00,000",
                startDate: "June 1, 2026",
            };
            const doc = generateOfferLetter(data);
            doc.save(`Offer_Letter_${candidate.name.replace(' ', '_')}.pdf`);
            toast.success("Offer Letter generated and downloaded!");
        } catch (error) {
            toast.error("Failed to generate offer letter");
            console.error(error);
        } finally {
            setIsOfferGenerating(false);
        }
    };

    const handleAiParse = async () => {
        setIsParsing(true);
        try {
            // Mocking a parse call since we don't have a real file right now
            const res = await axios.post(`/api/workspace/${workspaceId}/ats/ai/parsing`, {
                resumeText: candidate.summary // Just using summary for simulation
            });
            if (res.data.success) {
                toast.success("AI Insights updated from resume!");
            }
        } catch (error) {
            toast.error("AI Parsing failed");
        } finally {
            setIsParsing(false);
        }
    };

    const candidate = {
        name: "Rahul Sharma",
        role: "Senior Frontend Engineer",
        status: "Interview",
        score: 4.8,
        appliedAt: "2 days ago",
        email: "rahul.sharma@example.com",
        phone: "+91 98765 43210",
        location: "Delhi, India (Remote)",
        summary: "Highly skilled Frontend Engineer with 6+ years of experience in React, Next.js, and complex state management. Proven track record of leading UI teams for high-scale SaaS products.",
        skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "GraphQL", "Framer Motion"],
        aiInsights: {
            matchingScore: 92,
            summary: "Strong technical fit for the Senior Frontend role. Deep expertise in modern React patterns and performance optimization. Candidate has previously worked at two unicorn startups, suggesting high adaptability and scale experience.",
            pros: ["Expert in Next.js & App Router", "Strong UI/UX sensibility", "Previous leadership experience"],
            cons: ["Limited experience with backend (Go/Node) based on resume"]
        },
        experience: [
            { company: "TechFlow Labs", role: "Senior Frontend Engineer", period: "2020 - Present", description: "Leading the development of a real-time collaboration dashboard used by 100k+ users." },
            { company: "Innovate Digital", role: "Frontend Developer", period: "2018 - 2020", description: "Managed a component library shared across 5 products." }
        ],
        education: [
            { degree: "B.Tech in Computer Science", school: "IIT Delhi", year: "2014 - 2018" }
        ],
        timeline: [
            { stage: "Hired", date: null, status: "pending" },
            { stage: "Offer Extended", date: null, status: "pending" },
            { stage: "Technical Interview", date: "Today, 4:00 PM", status: "active" },
            { stage: "Screening", date: "Mar 22, 2026", status: "completed" },
            { stage: "Applied", date: "Mar 20, 2026", status: "completed" }
        ],
        scorecards: [
            { interviewer: "Amit Singh", stage: "Technical Round", score: 4.5, date: "Mar 23, 2026", feedback: "Excellent grasp of system design. Explained React rendering cycle perfectly." },
            { interviewer: "Neha Kapur", stage: "Product Fit", score: 5.0, date: "Mar 22, 2026", feedback: "Very strong user-centric approach. Clearly thinks about business impact." }
        ],
        notes: [
            { author: "Hiring Manager", text: "Rahul seems like a great culture fit. He asked insightful questions about our technical debt strategy.", date: "Today, 10:15 AM" }
        ],
        communications: [
            { type: 'email', subject: 'Interview Invitation', status: 'delivered', date: 'Mar 22, 2026' }
        ]
    };

    return (
        <div className="flex flex-col gap-8 p-8 max-w-[1400px] mx-auto animate-in fade-in duration-700">
            {/* Header / Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <Button 
                        variant="ghost" 
                        onClick={() => router.back()}
                        className="p-0 h-auto hover:bg-transparent text-muted-foreground hover:text-primary transition-colors text-[10px] font-black uppercase tracking-[0.2em] mb-2"
                    >
                        <ChevronLeft size={12} className="mr-1" />
                        Back to Pipeline
                    </Button>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-4 border-primary/20 shadow-2xl">
                            <AvatarFallback className="bg-primary/10 text-primary font-black text-xl uppercase">RS</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight tracking-tighter">{candidate.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm font-bold text-muted-foreground">{candidate.role}</p>
                                <span className="w-1 h-1 rounded-full bg-border" />
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black uppercase tracking-widest">
                                    {candidate.status}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-card/30 backdrop-blur-xl p-2 rounded-lg border border-border/40">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg opacity-60 hover:opacity-100" onClick={() => setActiveTab('emails')}>
                        <Mail size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg opacity-60 hover:opacity-100">
                        <Calendar size={18} />
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                    <Button 
                        disabled={isOfferGenerating}
                        onClick={handleGenerateOffer}
                        className="h-10 rounded-lg px-6 font-black uppercase tracking-widest text-[10px] bg-primary shadow-lg shadow-primary/20"
                    >
                        {isOfferGenerating ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <FileCheck className="w-3 h-3 mr-2" />}
                        Generate Offer
                    </Button>
                </div>
            </div>

            {/* Hub Tabs */}
            <Tabs value={activeTab} className="space-y-8" onValueChange={setActiveTab}>
                <div className="flex items-center justify-between">
                    <TabsList className="bg-muted/30 p-1 rounded-lg h-12 backdrop-blur-xl border border-border/20">
                        <TabsTrigger value="overview" className="rounded-lg px-6 text-xs font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xl">Overview</TabsTrigger>
                        <TabsTrigger value="scorecards" className="rounded-lg px-6 text-xs font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xl">Scorecards</TabsTrigger>
                        <TabsTrigger value="emails" className="rounded-lg px-6 text-xs font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xl">Communication</TabsTrigger>
                        <TabsTrigger value="notes" className="rounded-lg px-6 text-xs font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xl">Team Notes</TabsTrigger>
                        <TabsTrigger value="timeline" className="rounded-lg px-6 text-xs font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xl">Activity</TabsTrigger>
                    </TabsList>
                    
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground">
                        <History size={12} />
                        LAST ACTIVE 5M AGO
                    </div>
                </div>

                <TabsContent value="overview" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                             {/* AI Smart Summary Card */}
                            <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl shadow-black/5 relative hover:border-primary/20 transition-all cursor-default group">
                                <div className="absolute top-0 right-0 p-6">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">AI Match</p>
                                        <h3 className="text-4xl font-black text-primary">{candidate.aiInsights.matchingScore}%</h3>
                                    </div>
                                </div>
                                <CardHeader className="p-8 pb-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                <Sparkles size={20} />
                                            </div>
                                            AI Candidate Insight
                                        </CardTitle>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={handleAiParse}
                                            disabled={isParsing}
                                            className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest bg-primary/5 hover:bg-primary/10 transition-all"
                                        >
                                            {isParsing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                                            Analyze Resume
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 pt-4 space-y-6">
                                    <p className="text-base font-medium leading-relaxed opacity-80">
                                        {candidate.aiInsights.summary}
                                    </p>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Key Strengths</h4>
                                            <div className="space-y-2">
                                                {candidate.aiInsights.pros.map((pro, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-sm font-bold opacity-80">
                                                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                                        {pro}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500">Considerations</h4>
                                            <div className="space-y-2">
                                                {candidate.aiInsights.cons.map((con, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-sm font-bold opacity-80">
                                                        <AlertCircle size={16} className="text-amber-500 shrink-0" />
                                                        {con}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Bio & History */}
                            <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl shadow-black/5">
                                <CardHeader className="p-8 pb-4">
                                    <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
                                        Professional Profile
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 pt-4 space-y-8">
                                    <div className="p-6 rounded-lg bg-muted/20 border border-border/10">
                                        <h4 className="text-sm font-black uppercase tracking-widest opacity-40 mb-3">Executive Summary</h4>
                                        <p className="text-sm font-medium leading-relaxed opacity-70 italic">
                                            "{candidate.summary}"
                                        </p>
                                    </div>
                                    
                                    <Separator className="bg-border/10" />

                                    <div className="space-y-8">
                                        {candidate.experience.map((exp, i) => (
                                            <div key={i} className="flex gap-6 group cursor-default">
                                                <div className="w-12 h-12 rounded-lg bg-card border border-border/40 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/5 transition-all">
                                                    <Briefcase size={20} />
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-base font-black group-hover:text-primary transition-colors">{exp.role}</h4>
                                                    <p className="text-sm font-bold text-primary">{exp.company}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest mt-1">{exp.period}</p>
                                                    <p className="text-sm font-medium leading-relaxed opacity-60 mt-3">{exp.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-8">
                             {/* Contact */}
                            <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl shadow-black/5">
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab('emails')}>
                                            <div className="w-10 h-10 rounded-lg bg-muted/60 flex items-center justify-center opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all">
                                                <Mail size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Email Address</p>
                                                <p className="text-xs font-bold">{candidate.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 group cursor-pointer">
                                            <div className="w-10 h-10 rounded-lg bg-muted/60 flex items-center justify-center opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all">
                                                <Phone size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Phone Number</p>
                                                <p className="text-xs font-bold">{candidate.phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full h-12 rounded-lg font-black uppercase tracking-widest text-[9px] gap-2 border-border/40 bg-muted/20 hover:bg-primary/5 hover:border-primary/20 transition-all">
                                        <Download size={14} /> Download Resume
                                    </Button>
                                </CardContent>
                            </Card>
                            
                            {/* Skills Tag Card */}
                            <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl shadow-black/5">
                                <CardHeader>
                                    <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-40">Top Skills</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 pt-0">
                                    <div className="flex flex-wrap gap-2">
                                        {candidate.skills.map((skill, i) => (
                                            <Badge key={i} variant="outline" className="h-8 rounded-lg border-border/40 bg-muted/10 font-bold px-3 hover:bg-primary/10 hover:border-primary/40 transition-all cursor-default">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="scorecards" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {isScorecardOpen ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <Button variant="ghost" onClick={() => setIsScorecardOpen(false)} className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100">
                                    <ChevronLeft className="w-4 h-4 mr-2" /> Back to History
                                </Button>
                            </div>
                            <Scorecards 
                                candidate={candidate} 
                                onSubmit={(data) => {
                                    console.log("Scorecard Submitted:", data);
                                    toast.success("Scorecard submitted successfully!");
                                    setIsScorecardOpen(false);
                                }} 
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                {candidate.scorecards.map((card, i) => (
                                    <div key={i}>
                                        <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl shadow-black/5">
                                            <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black">
                                                        {card.interviewer.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg font-black tracking-tight">{card.stage}</CardTitle>
                                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">by {card.interviewer} • {card.date}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                                                    <Star size={14} className="fill-current" />
                                                    <span className="text-lg font-black">{card.score}</span>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-8 pt-4">
                                                <div className="p-6 rounded-lg bg-muted/20 border border-border/10 italic text-sm font-medium leading-relaxed opacity-70">
                                                    "{card.feedback}"
                                                </div>
                                                <div className="grid grid-cols-3 gap-8 mt-8">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1">
                                                            <span>Technical</span>
                                                            <span>90%</span>
                                                        </div>
                                                        <Progress value={90} className="h-1.5 bg-primary/10" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1">
                                                            <span>Culture</span>
                                                            <span>95%</span>
                                                        </div>
                                                        <Progress value={95} className="h-1.5 bg-emerald-500/10" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1">
                                                            <span>Soft Skills</span>
                                                            <span>85%</span>
                                                        </div>
                                                        <Progress value={85} className="h-1.5 bg-blue-500/10" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-8">
                                <Card className="border-border/40 bg-primary/5 backdrop-blur-xl rounded-lg p-8 border-primary/20 text-center space-y-6 shadow-xl shadow-primary/5">
                                    <Award className="w-12 h-12 text-primary mx-auto opacity-40" />
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black tracking-tight">Structured Feedback</h3>
                                        <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                                            Ensure unbiased hiring by completing the structured scorecard for this candidate's latest round.
                                        </p>
                                    </div>
                                    <Button 
                                        onClick={() => setIsScorecardOpen(true)}
                                        className="w-full h-12 rounded-lg font-black uppercase tracking-widest text-[10px] bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                                    >
                                        Launch Scorecard
                                    </Button>
                                </Card>
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="emails" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                         <div className="lg:col-span-2 space-y-6">
                            <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl shadow-black/5">
                                <CardHeader className="p-8 pb-4 border-b border-border/10">
                                    <CardTitle className="text-lg font-black tracking-tight">New Message</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Recipient</p>
                                        <Input value={candidate.email} readOnly className="h-12 rounded-lg bg-muted/20 border-border/20 font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Subject</p>
                                        <Input placeholder="Enter email subject..." className="h-12 rounded-lg bg-muted/20 border-border/20 font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Message Body</p>
                                            <Button variant="ghost" className="h-6 text-[9px] font-black uppercase tracking-widest text-primary p-0">
                                                Use AI Template
                                            </Button>
                                        </div>
                                        <Textarea 
                                            placeholder="Write your message here..."
                                            className="min-h-[250px] rounded-lg bg-muted/20 border-border/20 font-medium text-sm p-6"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between pt-4">
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-lg border-border/20">
                                                <Plus size={16} />
                                            </Button>
                                             <Button variant="outline" size="icon" className="h-10 w-10 rounded-lg border-border/20">
                                                <FileText size={16} />
                                            </Button>
                                        </div>
                                        <Button className="h-12 px-8 rounded-lg bg-primary font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                                            Send Email <Send size={14} className="ml-2" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                         </div>

                        <div className="space-y-6">
                             <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl shadow-black/5">
                                <CardHeader>
                                    <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-40">Communication History</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 pt-0 space-y-4">
                                    {candidate.communications.map((comm, i) => (
                                        <div key={i} className="p-4 rounded-lg bg-muted/10 border border-border/10 flex items-center justify-between group cursor-pointer hover:bg-primary/5 hover:border-primary/20 transition-all">
                                            <div className="flex items-center gap-3">
                                                 <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                    <Mail size={14} />
                                                 </div>
                                                 <div>
                                                    <p className="text-xs font-bold">{comm.subject}</p>
                                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{comm.date}</p>
                                                 </div>
                                            </div>
                                            <ChevronRight size={14} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    ))}
                                    <p className="text-[10px] font-bold text-center opacity-20 italic pt-4">No older messages encrypted.</p>
                                </CardContent>
                             </Card>

                             {/* Nurture Call to Action */}
                             <Card className="border-border/40 bg-emerald-500/5 backdrop-blur-xl rounded-lg p-8 border-emerald-500/20 text-center space-y-6">
                                <Sparkles className="w-12 h-12 text-emerald-500 mx-auto opacity-40" />
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black tracking-tight">AI Nurture</h3>
                                    <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                                        Send a personalized AI-generated update to keep the candidate engaged.
                                    </p>
                                </div>
                                <Button className="w-full h-12 rounded-lg font-black uppercase tracking-widest text-[10px] bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
                                    Send Nurture Update
                                </Button>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="notes" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                     <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl shadow-black/5">
                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-black tracking-tight tracking-tighter uppercase tracking-widest opacity-40 text-[10px]">Collaborative Discussion</h3>
                                <div className="space-y-4">
                                    {candidate.notes.map((note, i) => (
                                        <div key={i} className="flex gap-4 p-6 rounded-lg bg-muted/20 border border-border/10 items-start">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="text-[10px] font-black bg-primary/10 text-primary">AM</AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black">{note.author}</span>
                                                    <span className="text-[10px] font-bold opacity-30 uppercase">{note.date}</span>
                                                </div>
                                                <p className="text-sm font-medium leading-relaxed opacity-70 italic">
                                                    "{note.text}"
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="space-y-4 pt-4 border-t border-border/10">
                                <Textarea 
                                    placeholder="Type a team note... Use @ to mention colleagues"
                                    className="min-h-[120px] rounded-lg bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary font-medium text-sm p-6"
                                />
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold text-muted-foreground opacity-40 italic">Notes are only visible to the hiring team.</p>
                                    <Button className="h-12 px-8 rounded-lg bg-primary font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                                        Post Note <Send size={12} className="ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="timeline" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500">
                     <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl shadow-black/5">
                        <CardContent className="p-12">
                             <div className="relative space-y-12 before:absolute before:inset-0 before:left-0 before:w-[2px] before:bg-border/20 before:ml-1 mt-4 max-w-2xl mx-auto">
                                {candidate.timeline.map((step, i) => (
                                    <div key={i} className="relative pl-12 group">
                                        <div className={`absolute left-[-7px] top-1 w-4 h-4 rounded-full border-4 border-background z-10 ${
                                            step.status === 'completed' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40 scale-110' : 
                                            step.status === 'active' ? 'bg-primary shadow-lg shadow-primary/40 p-1 animate-pulse scale-150' : 
                                            'bg-muted'
                                        }`} />
                                        <div className="space-y-1 p-6 rounded-lg bg-muted/10 border border-transparent group-hover:bg-primary/5 group-hover:border-primary/20 transition-all cursor-default">
                                            <div className="flex items-center justify-between">
                                                <h4 className={`text-xl font-black tracking-tight ${step.status === 'completed' ? 'opacity-40' : 'opacity-100'}`}>
                                                    {step.stage}
                                                </h4>
                                                {step.status === 'completed' && <CheckCircle2 size={20} className="text-emerald-500" />}
                                                {step.status === 'active' && <Play size={16} className="text-primary fill-current" />}
                                            </div>
                                            {step.date && <p className="text-xs font-bold text-muted-foreground italic uppercase tracking-widest">{step.date}</p>}
                                            <p className="text-sm font-medium opacity-40 mt-3 leading-relaxed">
                                                System logged activity for {step.stage.toLowerCase()} stage. {step.status === 'completed' ? 'Successfully transitioned.' : 'Currently in progress.'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function Circle({ size, className }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
    )
}
