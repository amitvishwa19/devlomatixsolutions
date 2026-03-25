'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { 
    ChevronLeft, 
    Save, 
    Rocket, 
    Briefcase, 
    MapPin, 
    Users, 
    Target, 
    Gift,
    Sparkles,
    Info,
    Layout
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import TipTap from '@/components/global/TipTap';

export default function CreateJobPage() {
    const { workspaceId } = useParams();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [description, setDescription] = useState('<h1>Job Description</h1><p>Describe the role, responsibilities, and impact here...</p>');

    const handlePublish = async () => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSubmitting(false);
        toast.success("Job position published successfully!");
        router.push(`/workspace/${workspaceId}/ats/jobs`);
    };

    return (
        <div className="flex flex-col gap-8 p-8 max-w-[1200px] mx-auto animate-in fade-in duration-700">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <Button 
                        variant="ghost" 
                        onClick={() => router.back()}
                        className="p-0 h-auto hover:bg-transparent text-muted-foreground hover:text-primary transition-colors text-[10px] font-black uppercase tracking-[0.2em] mb-2"
                    >
                        <ChevronLeft size={12} className="mr-1" />
                        Back to Jobs
                    </Button>
                    <h1 className="text-4xl font-black tracking-tight tracking-tighter">New Position</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 rounded-xl px-6 font-bold border-border/40 bg-card/40 backdrop-blur-xl">
                        <Save className="w-4 h-4 mr-2 opacity-50" />
                        Save Draft
                    </Button>
                    <Button 
                        onClick={handlePublish}
                        disabled={isSubmitting}
                        className="h-11 rounded-xl px-6 font-black uppercase tracking-widest text-[10px] bg-primary shadow-lg shadow-primary/20"
                    >
                        {isSubmitting ? "Publishing..." : <>
                            <Rocket className="w-4 h-4 mr-2" />
                            Publish Position
                        </>}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Main Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl shadow-black/5">
                        <CardHeader className="border-b border-border/10 bg-muted/5">
                            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                                <Info className="w-5 h-5 text-primary" />
                                Role Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 ml-1">Job Title</label>
                                <Input placeholder="e.g. Senior Frontend Engineer" className="bg-muted/30 border-none h-14 rounded-lg text-base font-bold focus-visible:ring-1 focus-visible:ring-primary shadow-inner" />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 ml-1">Department</label>
                                    <Select>
                                        <SelectTrigger className="bg-muted/30 border-none h-14 rounded-lg text-sm font-bold shadow-inner">
                                            <SelectValue placeholder="Select Department" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border/40 bg-card/90 backdrop-blur-xl">
                                            <SelectItem value="eng">Engineering</SelectItem>
                                            <SelectItem value="des">Design</SelectItem>
                                            <SelectItem value="mkt">Marketing</SelectItem>
                                            <SelectItem value="hr">Human Resources</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 ml-1">Employment Type</label>
                                    <Select>
                                        <SelectTrigger className="bg-muted/30 border-none h-14 rounded-lg text-sm font-bold shadow-inner">
                                            <SelectValue placeholder="Select Type" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border/40 bg-card/90 backdrop-blur-xl">
                                            <SelectItem value="ft">Full-time</SelectItem>
                                            <SelectItem value="pt">Part-time</SelectItem>
                                            <SelectItem value="ct">Contract</SelectItem>
                                            <SelectItem value="int">Internship</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 ml-1">Location</label>
                                    <Input placeholder="e.g. Remote, Delhi" className="bg-muted/30 border-none h-14 rounded-lg text-sm font-bold shadow-inner" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 ml-1">Salary Range</label>
                                    <Input placeholder="e.g. 15L - 25L PA" className="bg-muted/30 border-none h-14 rounded-lg text-sm font-bold shadow-inner" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Rich Text Editor for Description */}
                    <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl shadow-black/5">
                        <CardHeader className="border-b border-border/10 bg-muted/5">
                            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                                <Layout className="w-5 h-5 text-primary" />
                                Job Description
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="min-h-[400px] border border-border/20 rounded-lg overflow-hidden focus-within:border-primary/40 transition-colors">
                                <TipTap data={description} onChange={setDescription} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Side: Sidebar Config */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Hiring Team */}
                    <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl shadow-black/5">
                        <CardHeader>
                            <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                Hiring Team
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 ml-1">Hiring Manager</label>
                                <Select>
                                    <SelectTrigger className="bg-muted/20 border-none h-12 rounded-xl text-xs font-bold shadow-inner">
                                        <SelectValue placeholder="Select Manager" />
                                    </SelectTrigger>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 ml-1">Interviewers</label>
                                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-muted/20 border border-dashed border-border/40">
                                    <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest border border-dashed border-border/60">
                                        + Add Interviewer
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Meta Data */}
                    <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl shadow-black/5">
                        <CardHeader>
                            <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                                <Target className="w-5 h-5 text-primary" />
                                Candidate Scoring
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={14} className="text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">AI Matching Enabled</span>
                                </div>
                                <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                                    Gemini will automatically score incoming candidates against your job description and requirements.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
