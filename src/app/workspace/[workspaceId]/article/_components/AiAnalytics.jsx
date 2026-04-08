import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Globe, Layers, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(280, 65%, 60%)", "hsl(200, 80%, 55%)", "hsl(320, 70%, 55%)", "hsl(45, 80%, 55%)"];

// Mocked data since useContentHistory will be removed
const mockPlatformData = [
    { name: "linkedin", value: 12 },
    { name: "twitter", value: 18 },
    { name: "instagram", value: 8 },
    { name: "facebook", value: 5 }
];

const mockTopicData = [
    { name: "AI in Tech", count: 10 },
    { name: "Marketing 101", count: 7 },
    { name: "Productivity", count: 5 },
    { name: "Web Dev Tools", count: 4 }
];

export const AiAnalytics = () => {
    return (
        <div className="pt-6 px-4 pb-12 max-w-6xl mx-auto">
            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 mb-4">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Performance Dashboard</span>
                </div>
                <h1 className="font-display text-3xl font-bold mb-2">
                    <span className="text-primary">Content</span>{" "}
                    <span className="text-foreground">Analytics</span>
                </h1>
                <p className="text-muted-foreground">Track your content generation activity and trends.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Total Generations", value: 43, icon: BarChart3 },
                    { label: "Platforms Used", value: 4, icon: Layers },
                    { label: "Languages", value: 2, icon: Globe },
                    { label: "Topics Covered", value: 12, icon: TrendingUp },
                ].map((stat) => (
                    <Card key={stat.label} className="border-border shadow-sm bg-card hover:bg-secondary/10 transition-colors">
                        <CardContent className="pt-6 flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-primary/10">
                                <stat.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-foreground leading-none mb-1">{stat.value}</p>
                                <p className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-border shadow-sm bg-card">
                    <CardHeader className="border-b border-border/30 bg-secondary/10 mb-2">
                        <CardTitle className="text-sm">Popular Topics</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={mockTopicData} layout="vertical" margin={{ left: 10, right: 10, top: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                                <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="name" width={100} tick={{ fill: "hsl(var(--foreground))", fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: "hsl(var(--secondary))", opacity: 0.4 }}
                                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, color: "hsl(var(--foreground))" }}
                                />
                                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-border shadow-sm bg-card">
                    <CardHeader className="border-b border-border/30 bg-secondary/10 mb-2">
                        <CardTitle className="text-sm">Platform Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 flex justify-center">
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={mockPlatformData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {mockPlatformData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} className="hover:opacity-80 transition-opacity outline-none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, color: "hsl(var(--foreground))" }}
                                    itemStyle={{ color: "hsl(var(--foreground))" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-border shadow-sm bg-card lg:col-span-2">
                    <CardHeader className="border-b border-border/30 bg-secondary/10 mb-4">
                        <CardTitle className="text-sm">Content Types & Languages Setup</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-3 pb-2">
                        <Badge variant="outline" className="text-sm px-4 py-1.5 border-border/50 bg-secondary/20">
                            Posts: 32
                        </Badge>
                        <Badge variant="outline" className="text-sm px-4 py-1.5 border-border/50 bg-secondary/20">
                            Threads: 8
                        </Badge>
                        <Badge variant="outline" className="text-sm px-4 py-1.5 border-border/50 bg-secondary/20">
                            Captions: 3
                        </Badge>
                        <span className="text-muted-foreground/30 mx-2 flex items-center">|</span>
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-sm px-4 py-1.5">
                            English: 40
                        </Badge>
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-sm px-4 py-1.5">
                            Spanish: 3
                        </Badge>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
