"use client";

import React from"react";
import {
 LayoutDashboard,
 Share2,
 MessageCircle,
 FileText,
 Settings,
 Plus,
 ArrowRight,
 Zap,
 Users,
 ShieldCheck,
 Activity
} from"lucide-react";
import { Button } from"@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from"@/components/ui/card";
import Link from"next/link";

const DashboardCard = ({ title, description, icon: Icon, href, color, stats }) => (
 <Link href={href}>
 <Card className="relative overflow-hidden group border-border bg-card hover:bg-card/90 transition-all duration-500 hover:-translate-y-1 shadow-soft hover:shadow-medium cursor-pointer h-full rounded-md animate-fade-in">
 <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-${color}/10 rounded-full blur-3xl group-hover:bg-${color}/20 transition-colors pointer-events-none`} />

 <CardHeader className="pb-2">
 <div className="flex items-center justify-between">
 <div className={`p-2.5 rounded-md bg-${color}/10 text-${color} group-hover:scale-110 transition-transform`}>
 <Icon size={24} />
 </div>
 <ArrowRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"/>
 </div>
 <CardTitle className="text-xl font-extrabold mt-4">{title}</CardTitle>
 <CardDescription className="text-xs font-medium opacity-70 leading-relaxed">
 {description}
 </CardDescription>
 </CardHeader>

 <CardContent>
 <div className="flex items-center gap-4 mt-2">
 {stats?.map((stat, i) => (
 <div key={i} className="flex flex-col">
 <span className="text-xs font-bold text-foreground">{stat.value}</span>
 <span className="text-[10px] font-medium text-muted-foreground">{stat.label}</span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </Link>
);

export default function WorkspaceDashboard({ workspaceId }) {
 const modules = [
 {
 title:"Social Media Hub",
 description:"Design, schedule and publish content across Meta, X, and LinkedIn.",
 icon: Share2,
 href: `/workspace/${workspaceId}/article`,
 color:"primary",
 stats: [
 { label:"Active", value:"8 Posts"},
 { label:"Scheduled", value:"3"}
 ]
 },
 {
 title:"WhatsApp Manager",
 description:"Direct customer engagement, bulk campaigns and automated bot flows.",
 icon: MessageCircle,
 href: `/workspace/${workspaceId}/wa`,
 color:"green-500",
 stats: [
 { label:"Status", value:"Connected"},
 { label:"Campaigns", value:"24"}
 ]
 },
 {
 title:"Digital Assets",
 description:"Securely store and organize your documents, images and rich media.",
 icon: FileText,
 href: `/workspace/${workspaceId}/document`,
 color:"blue-500",
 stats: [
 { label:"Storage", value:"4.2 GB"},
 { label:"Files", value:"156"}
 ]
 },
 {
 title:"System & Access",
 description:"Manage credentials, team permissions and platform configurations.",
 icon: Settings,
 href: `/workspace/${workspaceId}/system/setting`,
 color:"orange-500",
 stats: [
 { label:"Team", value:"12 Members"},
 { label:"Security", value:"Shield On"}
 ]
 }
 ];

 return (
 <div className="space-y-6 pb-10 animate-fade-in">
 {/* Hero Section */}
 <div className="relative p-8 rounded-md overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 shadow-soft">
 <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-3xl -z-10"/>
 <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div className="space-y-2">
 <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary w-fit text-[10px] font-extrabold tracking-[0.2em]">
 <Zap size={12} className="fill-primary"/> Multi-Channel Engine
 </div>
 <h1 className="text-4xl md:text-3xl tracking-tighter text-foreground">
 Welcome to your <span className="text-primary tracking-normal italic">Workspace.</span>
 </h1>
 <p className="text-sm text-muted-foreground max-w-xl leading-relaxed font-medium">
 Control your entire digital presence from one centralized command center. Manage content, automate messaging, and secure your credentials with ease.
 </p>
 </div>

 </div>
 </div>

 {/* Quick Actions Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {modules.map((module) => (
 <DashboardCard key={module.title} {...module} />
 ))}
 </div>

 {/* Bottom Section - Status & Insights */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <Card className="lg:col-span-2 border-border bg-card shadow-soft overflow-hidden rounded-md">
 <CardHeader className="flex flex-row items-center justify-between pb-2">
 <div>
 <CardTitle className="text-xl font-bold flex items-center gap-2">
 <Activity size={20} className="text-primary"/> Activity Overview
 </CardTitle>
 <CardDescription className="text-xs">Real-time performance across all channels</CardDescription>
 </div>
 <Button variant="outline"size="sm"className="text-[10px] font-bold">
 View Full Logs
 </Button>
 </CardHeader>
 <CardContent>
 <div className="h-[200px] w-full flex items-center justify-center border border-dashed border-border/60 rounded-md bg-background/30">
 <div className="flex flex-col items-center gap-2 opacity-50">
 <Activity size={40} />
 <span className="text-xs font-bold">Analytics Hydrating...</span>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card className="border-border bg-card shadow-soft rounded-md">
 <CardHeader>
 <CardTitle className="text-xl font-bold flex items-center gap-2">
 <ShieldCheck size={20} className="text-green-500"/> System Health
 </CardTitle>
 <CardDescription className="text-xs">Token & security status</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 {[
 { name:"Facebook API", status:"Operational", color:"bg-green-500"},
 { name:"Instagram Graph", status:"Operational", color:"bg-green-500"},
 { name:"WhatsApp Business", status:"Operational", color:"bg-green-500"},
 { name:"Twitter/X OAuth", status:"Warning", color:"bg-yellow-500"},
 ].map((s) => (
 <div key={s.name} className="flex items-center justify-between p-3 rounded-md bg-background/40 border border-border/5">
 <span className="text-xs font-bold text-foreground">{s.name}</span>
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-bold text-muted-foreground">{s.status}</span>
 <div className={`w-2 h-2 rounded-full ${s.color} animate-pulse`} />
 </div>
 </div>
 ))}
 </CardContent>
 </Card>
 </div>
 </div>
);
}