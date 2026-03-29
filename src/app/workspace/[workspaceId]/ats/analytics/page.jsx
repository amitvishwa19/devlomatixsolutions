'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
 BarChart3,
 PieChart,
 TrendingUp,
 Users,
 Clock,
 Target,
 Award,
 Calendar,
 ChevronLeft,
 Download,
 Filter,
 ArrowUpRight,
 Briefcase,
 Sparkles,
 ShieldCheck,
 Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ATSAnalyticsPage() {
 const { workspaceId } = useParams();
 const router = useRouter();

 const stats = [
 { label: "Avg. Time to Hire", value: "18 Days", trend: "-2.4%", trendStatus: "up", icon: Clock, color: "text-primary" },
 { label: "Offer Acceptance", value: "84%", trend: "+5.1%", trendStatus: "up", icon: Target, color: "text-emerald-500" },
 { label: "Source Quality", value: "4.2/5", trend: "+0.3", trendStatus: "up", icon: BarChart3, color: "text-blue-500" },
 { label: "Interviewer Load", value: "12/wk", trend: "Stable", trendStatus: "neutral", icon: Users, color: "text-amber-500" },
 ];

 const pipelineData = [
 { stage: "Applied", count: 852, percentage: 100 },
 { stage: "Screening", count: 340, percentage: 40 },
 { stage: "Technical", count: 120, percentage: 14 },
 { stage: "Cultural", count: 45, percentage: 5 },
 { stage: "Offer", count: 18, percentage: 2 },
 ];

 return (
 <div className="flex flex-col gap-4 p-4 animate-in fade-in duration-700">
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div className="space-y-1">
 <Button
 variant="ghost"
 onClick={() => router.back()}
 className="p-0 h-auto hover:bg-transparent text-muted-foreground hover:text-primary transition-colors text-[10px] tracking-[0.2em] mb-2"
 >
 <ChevronLeft size={12} className="mr-1" />
 Back to ATS
 </Button>
 <h1 className="text-xl font-bold">ATS Analytics</h1>
 </div>
 <div className="flex items-center gap-3">
 <Button variant="outline" className="h-10 rounded-md px-6 font-bold border-border/40 bg-card/40 backdrop-blur-xl">
 <Calendar className="w-4 h-4 mr-2 opacity-50" />
 Last 30 Days
 </Button>
 <Button className="h-10 rounded-md px-6 text-[10px] bg-primary shadow-lg shadow-primary/20">
 <Download className="w-4 h-4 mr-2" />
 Download Report
 </Button>
 </div>
 </div>

 {/* Quick Stats */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {stats.map((stat, i) => (
 <Card key={i} className="border-border/40 bg-card/30 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl shadow-black/5 group hover:border-primary/20 transition-all">
 <CardContent className="p-8 space-y-4">
 <div className="flex items-center justify-between">
 <div className={`w-12 h-12 rounded-lg bg-muted/60 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
 <stat.icon size={22} />
 </div>
 <div className={`flex items-center gap-1 text-[10px] ${stat.trendStatus === 'up' ? 'text-emerald-500' : 'text-muted-foreground'}`}>
 {stat.trendStatus === 'up' ? <ArrowUpRight size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-border" />}
 {stat.trend}
 </div>
 </div>
 <div>
 <h3 className="text-3xl tracking-tighter">{stat.value}</h3>
 <p className="text-[10px] text-muted-foreground opacity-40">{stat.label}</p>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Hiring Funnel */}
 <Card className="lg:col-span-2 border-border/40 bg-card/30 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl shadow-black/5">
 <CardHeader className="p-8 pb-4">
 <CardTitle className="text-xl flex items-center gap-2">
 <TrendingUp className="w-5 h-5 text-primary" />
 Hiring Funnel Velocity
 </CardTitle>
 </CardHeader>
 <CardContent className="p-8 pt-4 space-y-8">
 <div className="space-y-6">
 {pipelineData.map((stage, i) => (
 <div key={i} className="space-y-2">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <span className="text-xs w-4 text-muted-foreground/40">{i + 1}</span>
 <span className="text-sm font-bold">{stage.stage}</span>
 </div>
 <div className="flex items-center gap-4">
 <span className="text-xs text-primary">{stage.count} <span className="text-muted-foreground opacity-40">Candidates</span></span>
 <Badge variant="outline" className="text-[9px] border-border/40 opacity-40">{stage.percentage}%</Badge>
 </div>
 </div>
 <Progress value={stage.percentage} className="h-3 rounded-full bg-muted/30" />
 </div>
 ))}
 </div>
 <div className="p-6 rounded-lg bg-primary/5 border border-primary/10 flex items-center gap-4">
 <Sparkles className="text-primary shrink-0" />
 <p className="text-xs font-medium text-muted-foreground leading-relaxed">
 <span className="text-primary mr-2 text-[10px]">AI insight</span>
 Your technical screening stage has a bottleneck. average time spent is <span className="font-bold text-foreground">5.2 days</span>, which is 30% higher than industry average.
 </p>
 </div>
 </CardContent>
 </Card>

 {/* Source Quality */}
 <Card className="lg:col-span-1 border-border/40 bg-card/30 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl shadow-black/5">
 <CardHeader className="p-8 pb-4">
 <CardTitle className="text-xl flex items-center gap-2">
 <PieChart className="w-5 h-5 text-primary" />
 Sourcing Mix
 </CardTitle>
 </CardHeader>
 <CardContent className="p-8 pt-4 space-y-8">
 <div className="aspect-square rounded-full border-[20px] border-muted/20 relative flex items-center justify-center overflow-hidden group">
 <div className="text-center">
 <h4 className="text-4xl tracking-tighter">68%</h4>
 <p className="text-[10px] text-muted-foreground opacity-40">Inbound</p>
 </div>
 {/* Decorative rings for visual flair */}
 <div className="absolute inset-0 border-[20px] border-primary border-t-transparent border-l-transparent rotate-45 opacity-60 group-hover:rotate-90 transition-transform duration-1000" />
 <div className="absolute inset-4 border-[10px] border-emerald-500 border-b-transparent border-r-transparent -rotate-12 opacity-40 group-hover:-rotate-45 transition-transform duration-1000" />
 </div>
 <div className="space-y-4 pt-4">
 <div className="flex items-center justify-between text-xs">
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full bg-primary" />
 <span className="font-bold">LinkedIn</span>
 </div>
 <span className="opacity-40">42%</span>
 </div>
 <div className="flex items-center justify-between text-xs">
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full bg-emerald-500" />
 <span className="font-bold">Referrals</span>
 </div>
 <span className="opacity-40">26%</span>
 </div>
 <div className="flex items-center justify-between text-xs">
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full bg-blue-500" />
 <span className="font-bold">Direct Applied</span>
 </div>
 <span className="opacity-40">32%</span>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 {/* Diversity & Inclusion */}
 <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl shadow-black/5">
 <CardHeader className="p-8 pb-4">
 <CardTitle className="text-xl flex items-center gap-2">
 <ShieldCheck className="w-5 h-5 text-primary" />
 Diversity & Inclusion
 </CardTitle>
 </CardHeader>
 <CardContent className="p-8 space-y-8">
 <div className="grid grid-cols-2 gap-8">
 <div className="space-y-4">
 <p className="text-[10px] text-muted-foreground opacity-40">Gender Distribution</p>
 <div className="space-y-3">
 {[
 { label: "Male", value: 58, color: "bg-blue-500" },
 { label: "Female", value: 38, color: "bg-rose-500" },
 { label: "Non-binary", value: 4, color: "bg-amber-500" }
 ].map((item, i) => (
 <div key={i} className="space-y-1">
 <div className="flex justify-between text-[10px] font-bold">
 <span>{item.label}</span>
 <span>{item.value}%</span>
 </div>
 <Progress value={item.value} className={`h-1.5 ${item.color}/10`} />
 </div>
 ))}
 </div>
 </div>
 <div className="space-y-4">
 <p className="text-[10px] text-muted-foreground opacity-40">Ethnicity Mix</p>
 <div className="space-y-3">
 {[
 { label: "Asian", value: 65, color: "bg-emerald-500" },
 { label: "White", value: 20, color: "bg-slate-500" },
 { label: "Other", value: 15, color: "bg-purple-500" }
 ].map((item, i) => (
 <div key={i} className="space-y-1">
 <div className="flex justify-between text-[10px] font-bold">
 <span>{item.label}</span>
 <span>{item.value}%</span>
 </div>
 <Progress value={item.value} className={`h-1.5 ${item.color}/10`} />
 </div>
 ))}
 </div>
 </div>
 </div>
 <div className="p-6 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4">
 <Globe className="text-emerald-500 shrink-0" />
 <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">
 "Your recruitment funnel shows healthy diversity growth in technical roles (+12% YoY). Recommend increasing referral rewards for underrepresented groups."
 </p>
 </div>
 </CardContent>
 </Card>

 {/* Team Performance */}
 <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl shadow-black/5">
 <CardHeader className="p-8 pb-4">
 <CardTitle className="text-xl flex items-center gap-2">
 <Award className="w-5 h-5 text-primary" />
 Hiring Team Impact
 </CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="overflow-hidden">
 <table className="w-full text-left">
 <thead>
 <tr className="border-b border-border/10 bg-muted/10">
 <th className="px-8 py-4 text-[10px] opacity-40">Interviewer</th>
 <th className="px-8 py-4 text-[10px] opacity-40">Interviews</th>
 <th className="px-8 py-4 text-[10px] opacity-40">Avg Score</th>
 <th className="px-8 py-4 text-[10px] opacity-40">Accept Rate</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/10">
 {[
 { name: "Amit Singh", count: 24, score: 4.8, rate: "92%" },
 { name: "Neha Kapur", count: 18, score: 4.5, rate: "78%" },
 { name: "Siddharth J.", count: 15, score: 3.9, rate: "65%" },
 ].map((teammate, i) => (
 <tr key={i} className="hover:bg-primary/5 transition-colors cursor-default">
 <td className="px-8 py-5 flex items-center gap-3">
 <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px]">
 {teammate.name.split(' ').map(n => n[0]).join('')}
 </div>
 <span className="text-sm font-bold">{teammate.name}</span>
 </td>
 <td className="px-8 py-5 text-sm font-bold opacity-60">{teammate.count}</td>
 <td className="px-8 py-5 text-sm text-primary">{teammate.score}</td>
 <td className="px-8 py-5 text-sm font-bold opacity-60">{teammate.rate}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 </div>

 <div className="grid grid-cols-1 gap-8">
 {/* Job Openings Focus */}
 <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl shadow-black/5">
 <CardHeader className="p-8 pb-4">
 <CardTitle className="text-xl flex items-center gap-2">
 <Briefcase className="w-5 h-5 text-primary" />
 Position Health & Velocity
 </CardTitle>
 </CardHeader>
 <CardContent className="p-8">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 {[
 { role: "Senior Frontend Engineer", candidates: 42, health: 85, velocity: "Fast" },
 { role: "Product Designer", candidates: 12, health: 45, velocity: "Slow" },
 { role: "Backend Architect", candidates: 28, health: 92, velocity: "Stable" },
 ].map((job, i) => (
 <div key={i} className="p-6 rounded-lg bg-muted/20 border border-border/10 group cursor-default hover:border-primary/20 transition-all">
 <div className="flex items-center justify-between mb-4">
 <h4 className="text-sm tracking-tighter group-hover:text-primary transition-colors">{job.role}</h4>
 <Badge variant="outline" className={`text-[9px] border-border/40 ${job.velocity === 'Slow' ? 'text-amber-500 bg-amber-500/10' : ''}`}>
 {job.velocity}
 </Badge>
 </div>
 <div className="space-y-4">
 <div className="space-y-2">
 <div className="flex justify-between text-[9px] opacity-40">
 <span>Pipeline Health</span>
 <span>{job.health}%</span>
 </div>
 <Progress value={job.health} className={`h-1.5 ${job.health < 50 ? 'bg-amber-500/10' : 'bg-primary/10'}`} />
 </div>
 <div className="flex items-center justify-between">
 <p className="text-[10px] font-bold opacity-40">{job.candidates} Applicants</p>
 <Button variant="ghost" className="h-6 text-[9px] p-0">View Details</Button>
 </div>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 );
}
