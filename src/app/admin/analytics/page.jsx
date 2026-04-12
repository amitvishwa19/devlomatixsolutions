"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { useAts } from "@/app/admin/_context/AtsContext";
import { sourceBreakdown, timeToHireData, stages } from "@/app/admin/_utils/mockData";
import { TrendingUp, Users, Clock, Target } from "lucide-react";

export default function AnalyticsPage() {
  const { candidates, jobs } = useAts();

  const stageDistribution = stages.map((s) => ({
    name: s.label,
    count: candidates.filter((c) => c.stage === s.key).length,
  }));

  const deptBreakdown = Array.from(new Set(jobs.map((j) => j.department))).map((dept) => ({
    department: dept,
    openJobs: jobs.filter((j) => j.department === dept && j.status === "open").length,
    candidates: candidates.filter((c) => jobs.find((j) => j.id === c.jobId)?.department === dept).length,
  }));

  const COLORS = ["hsl(174,62%,38%)", "hsl(190,70%,40%)", "hsl(38,92%,50%)", "hsl(142,71%,45%)", "hsl(220,20%,50%)"];

  const kpis = [
    { label: "Avg. Time to Hire", value: "25 days", icon: Clock, change: "-12%", positive: true },
    { label: "Offer Acceptance Rate", value: "85%", icon: Target, change: "+5%", positive: true },
    { label: "Active Candidates", value: candidates.filter((c) => !["hired", "rejected"].includes(c.stage)).length, icon: Users, change: "+8", positive: true },
    { label: "Pipeline Velocity", value: "4.2x", icon: TrendingUp, change: "+0.3x", positive: true },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Hiring metrics and insights</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{kpi.label}</span>
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
              <span className={`text-xs font-medium ${kpi.positive ? "text-success" : "text-destructive"}`}>{kpi.change} vs last month</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Source Breakdown Pie */}
        <Card>
          <CardHeader><CardTitle className="text-base">Candidate Sources</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={sourceBreakdown} dataKey="count" nameKey="source" cx="50%" cy="50%" outerRadius={100} label={({ source, percent }) => `${source} ${(percent * 100).toFixed(0)}%`}>
                  {sourceBreakdown.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Time to Hire Trend */}
        <Card>
          <CardHeader><CardTitle className="text-base">Time to Hire (Days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={timeToHireData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
                <XAxis dataKey="month" fontSize={12} stroke="hsl(220,10%,46%)" />
                <YAxis fontSize={12} stroke="hsl(220,10%,46%)" />
                <Tooltip />
                <Line type="monotone" dataKey="days" stroke="hsl(174,62%,38%)" strokeWidth={2} dot={{ fill: "hsl(174,62%,38%)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stage Distribution */}
        <Card>
          <CardHeader><CardTitle className="text-base">Stage Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stageDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
                <XAxis dataKey="name" fontSize={12} stroke="hsl(220,10%,46%)" />
                <YAxis fontSize={12} stroke="hsl(220,10%,46%)" />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stageDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Breakdown */}
        <Card>
          <CardHeader><CardTitle className="text-base">By Department</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={deptBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
                <XAxis type="number" fontSize={12} stroke="hsl(220,10%,46%)" />
                <YAxis dataKey="department" type="category" fontSize={12} stroke="hsl(220,10%,46%)" width={90} />
                <Tooltip />
                <Legend />
                <Bar dataKey="openJobs" name="Open Jobs" fill="hsl(174,62%,38%)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="candidates" name="Candidates" fill="hsl(38,92%,50%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
