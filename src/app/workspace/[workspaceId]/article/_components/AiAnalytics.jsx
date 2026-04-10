import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Globe, Layers, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useContentHistory } from "../_hooks/use-content-history";

const COLORS = ["hsl(var(--primary))", "hsl(280, 65%, 60%)", "hsl(200, 80%, 55%)", "hsl(320, 70%, 55%)", "hsl(45, 80%, 55%)"];

export const AiAnalytics = () => {
    const { history } = useContentHistory();

    const stats = useMemo(() => {
        const total = history.length;
        const platforms = new Set(history.map(h => h.platform)).size;
        const languages = new Set(history.map(h => h.language)).size;
        const topics = new Set(history.map(h => h.topic)).size;

        return [
            { label: "Total Generations", value: total, icon: BarChart3 },
            { label: "Platforms Used", value: platforms, icon: Layers },
            { label: "Languages", value: languages, icon: Globe },
            { label: "Topics Covered", value: topics, icon: TrendingUp },
        ];
    }, [history]);

    const platformData = useMemo(() => {
        const counts = history.reduce((acc, curr) => {
            acc[curr.platform] = (acc[curr.platform] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [history]);

    const topicData = useMemo(() => {
        const counts = history.reduce((acc, curr) => {
            acc[curr.topic] = (acc[curr.topic] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts)
            .map(([name, count]) => ({ name: name.length > 15 ? name.slice(0, 15) + '...' : name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [history]);

    const typeStats = useMemo(() => {
        const counts = history.reduce((acc, curr) => {
            acc[curr.contentType] = (acc[curr.contentType] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts);
    }, [history]);

    const langStats = useMemo(() => {
        const counts = history.reduce((acc, curr) => {
            acc[curr.language] = (acc[curr.language] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts);
    }, [history]);

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

            {history.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2">
                    <p className="text-muted-foreground">No data available yet. Start generating content to see your analytics!</p>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {stats.map((stat) => (
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
                                    <BarChart data={topicData} layout="vertical" margin={{ left: 10, right: 10, top: 0, bottom: 0 }}>
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
                                            data={platformData}
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
                                            {platformData.map((_, i) => (
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
                                <CardTitle className="text-sm">System Usage Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-3 pb-2">
                                {typeStats.map(([type, count]) => (
                                    <Badge key={type} variant="outline" className="text-sm px-4 py-1.5 border-border/50 bg-secondary/20 capitalize">
                                        {type}: {count}
                                    </Badge>
                                ))}
                                <span className="text-muted-foreground/30 mx-2 flex items-center">|</span>
                                {langStats.map(([lang, count]) => (
                                    <Badge key={lang} className="bg-primary/10 text-primary hover:bg-primary/20 text-sm px-4 py-1.5 capitalize">
                                        {lang}: {count}
                                    </Badge>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
};
