"use client";

import React, { useState, useEffect, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { 
    MessageSquare, Send, CheckCircle2, AlertCircle, BarChart3, 
    Calendar, Download, RefreshCw, ArrowUpRight, ArrowDownRight, 
    Activity, Zap, ShieldCheck, Mail, Target, Award 
} from 'lucide-react';
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAction } from "@/hooks/use-action";
import { getAnalytics } from "./_actions/get-analytics";
import { toast } from "sonner";

const COLORS = ['#10b981', '#3b82f6', '#94a3b8', '#ef4444', '#8b5cf6'];

export default function AnalyticsPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const workspaceId = params.workspaceId;
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [range, setRange] = useState('30');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { execute: executeGetAnalytics } = useAction(getAnalytics, {
        onSuccess: (result) => {
            setData(result);
            setIsLoading(false);
            setIsRefreshing(false);
        },
        onError: (err) => {
            toast.error(err || "Failed to fetch analytics data");
            setIsLoading(false);
            setIsRefreshing(false);
        }
    });

    const fetchAnalytics = () => {
        setIsRefreshing(true);
        executeGetAnalytics({ workspaceId, range });
    };

    useEffect(() => {
        fetchAnalytics();
    }, [range]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 w-full" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="lg:col-span-2 h-[400px] w-full" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={containerVariants}
            className="p-6 space-y-8 bg-background h-screen overflow-y-auto custom-scrollbar pb-24"
        >
            {/* Header Content */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <Activity className="w-8 h-8 text-primary" />
                        WhatsApp Analytics
                    </h2>
                    <p className="text-muted-foreground text-sm flex items-center gap-2">
                        Comprehensive performance overview for your official WhatsApp integration.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={range} onValueChange={setRange}>
                        <SelectTrigger className="w-[180px] bg-card border-border/60">
                            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Date Range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 Days</SelectItem>
                            <SelectItem value="30">Last 30 Days</SelectItem>
                            <SelectItem value="90">Last 90 Days</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button 
                        variant="secondary" 
                        size="icon" 
                        onClick={fetchAnalytics}
                        disabled={isRefreshing}
                        className="bg-card border border-border/60 hover:bg-muted"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Download className="w-4 h-4" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div variants={itemVariants}>
                    <Card className="bg-card/40 border-border/50 hover:border-primary/30 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full -mr-4 -mt-4 group-hover:bg-primary/10 transition-colors" />
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Messages</p>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-2xl font-bold">{(data?.totalMessages || 0).toLocaleString()}</h3>
                                        <Badge className="bg-emerald-500/10 text-emerald-500 text-[10px] hover:bg-emerald-500/20 border-none">
                                            +12% <ArrowUpRight className="w-2.5 h-2.5 ml-0.5" />
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="bg-card/40 border-border/50 hover:border-emerald-500/30 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full -mr-4 -mt-4 group-hover:bg-emerald-500/10 transition-colors" />
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Read Rate</p>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-2xl font-bold">{data?.overallReadRate || 0}%</h3>
                                        <Badge className="bg-emerald-500/10 text-emerald-500 text-[10px] hover:bg-emerald-500/20 border-none">
                                            +5% <ArrowUpRight className="w-2.5 h-2.5 ml-0.5" />
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="bg-card/40 border-border/50 hover:border-blue-500/30 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full -mr-4 -mt-4 group-hover:bg-blue-500/10 transition-colors" />
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Delivery Rate</p>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-2xl font-bold">98.4%</h3>
                                        <Badge className="bg-slate-500/10 text-muted-foreground text-[10px] hover:bg-slate-500/20 border-none">
                                            Stable
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="bg-card/40 border-border/50 hover:border-red-500/30 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-bl-full -mr-4 -mt-4 group-hover:bg-red-500/10 transition-colors" />
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-500/10 rounded-xl text-red-500 border border-red-500/20">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Failed Messages</p>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-2xl font-bold">{data?.timeSeries?.reduce((acc, curr) => acc + curr.failed, 0) || 0}</h3>
                                        <Badge className="bg-red-500/10 text-red-500 text-[10px] hover:bg-red-500/20 border-none">
                                            -2% <ArrowDownRight className="w-2.5 h-2.5 ml-0.5" />
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Traffic Chart */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                    <Card className="bg-card border-border/50 h-[450px] shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-primary" />
                                    Message Traffic
                                </CardTitle>
                                <CardDescription>Sent vs Received message trends over time.</CardDescription>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-medium">
                                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Sent</div>
                                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Received</div>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[350px] w-full pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data?.timeSeries}>
                                    <defs>
                                        <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorRecv" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fill: '#64748b'}}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fill: '#64748b'}}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                                        itemStyle={{ fontSize: '12px' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="sent" 
                                        stroke="#10b981" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorSent)" 
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="received" 
                                        stroke="#3b82f6" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorRecv)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Distribution Pie */}
                <motion.div variants={itemVariants}>
                    <Card className="bg-card border-border/50 h-[450px] shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Target className="w-5 h-5 text-primary" />
                                Delivery Funnel
                            </CardTitle>
                            <CardDescription>Breakdown of message delivery status.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] flex items-center justify-center relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data?.distribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {data?.distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                                        itemStyle={{ fontSize: '12px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-3xl font-bold">100%</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Delivery</span>
                            </div>
                        </CardContent>
                        <div className="px-6 space-y-3 pb-6">
                            {data?.distribution.map((item, id) => (
                                <div key={id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs font-medium text-muted-foreground">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-bold">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Template Engagement */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={itemVariants}>
                    <Card className="bg-card border-border/50 shadow-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/20">
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Award className="w-5 h-5 text-primary" />
                                    Top Templates
                                </CardTitle>
                                <CardDescription>Templates with highest engagement rates.</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs text-primary font-bold">View All</Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/50">
                                {data?.templatePerformance.map((tmpl, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{tmpl.name}</p>
                                                <Badge variant="secondary" className="text-[10px] py-0">{tmpl.category}</Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8 text-right">
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Sends</p>
                                                <p className="text-sm font-bold">{tmpl.sent}</p>
                                            </div>
                                            <div className="space-y-0.5 min-w-[60px]">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Read Rate</p>
                                                <p className="text-sm font-bold text-emerald-500">{tmpl.rate}%</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Additional Insights Card */}
                <motion.div variants={itemVariants}>
                    <Card className="bg-card border-border/50 shadow-sm relative overflow-hidden group h-full">
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500" />
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                Growth Insights
                            </CardTitle>
                            <CardDescription>AI-generated engagement suggestions.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 space-y-2">
                                <div className="flex items-center gap-2 text-emerald-500">
                                    <Zap className="w-4 h-4 fill-current" />
                                    <span className="text-sm font-bold">Optimization Tip</span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Your "Order Confirmation" template has a 94% read rate. Consider adding a "Call to Action" button for upselling related products.
                                </p>
                            </div>

                            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-2">
                                <div className="flex items-center gap-2 text-primary">
                                    <Mail className="w-4 h-4 fill-current" />
                                    <span className="text-sm font-bold">Audience Growth</span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    You've added 124 new contacts this week. Try sending a "Welcome" campaign to drive first-time engagement.
                                </p>
                            </div>

                            <div className="pt-4">
                                <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95">
                                    Generate Detailed Report
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
