"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Clock, Target, Star, Calendar, CheckCircle2 } from "lucide-react";

const teamMembers = [
  {
    id: "1", name: "Rajesh Kumar", role: "Senior Recruiter", avatar: "RK",
    openReqs: 5, activeCandidates: 18, hiredThisMonth: 3,
    avgTimeToFill: 22, responseRate: 94, interviewsThisWeek: 6,
    capacity: 85,
  },
  {
    id: "2", name: "Priya Sharma", role: "Recruiter", avatar: "PS",
    openReqs: 4, activeCandidates: 14, hiredThisMonth: 2,
    avgTimeToFill: 26, responseRate: 91, interviewsThisWeek: 4,
    capacity: 70,
  },
  {
    id: "3", name: "Amit Verma", role: "Hiring Manager", avatar: "AV",
    openReqs: 3, activeCandidates: 8, hiredThisMonth: 1,
    avgTimeToFill: 30, responseRate: 87, interviewsThisWeek: 3,
    capacity: 55,
  },
  {
    id: "4", name: "Neha Kapoor", role: "Recruiter", avatar: "NK",
    openReqs: 6, activeCandidates: 22, hiredThisMonth: 4,
    avgTimeToFill: 19, responseRate: 96, interviewsThisWeek: 8,
    capacity: 95,
  },
];

const weeklyPerformance = [
  { week: "W1", rajesh: 3, priya: 2, amit: 1, neha: 4 },
  { week: "W2", rajesh: 4, priya: 3, amit: 2, neha: 3 },
  { week: "W3", rajesh: 2, priya: 4, amit: 1, neha: 5 },
  { week: "W4", rajesh: 5, priya: 2, amit: 3, neha: 4 },
  { week: "W5", rajesh: 3, priya: 3, amit: 2, neha: 6 },
  { week: "W6", rajesh: 4, priya: 5, amit: 2, neha: 3 },
];

const getCapacityColor = (capacity) => {
  if (capacity >= 90) return "text-destructive border-destructive/50";
  if (capacity >= 70) return "text-warning border-warning/50";
  return "text-success border-success/50";
};

const getProgressColor = (capacity) => {
  if (capacity >= 90) return "bg-destructive";
  if (capacity >= 70) return "bg-warning";
  return "bg-success";
};

export default function TeamWorkloadPage() {
  const totalOpen = teamMembers.reduce((s, m) => s + m.openReqs, 0);
  const totalHired = teamMembers.reduce((s, m) => s + m.hiredThisMonth, 0);
  const avgTime = Math.round(teamMembers.reduce((s, m) => s + m.avgTimeToFill, 0) / teamMembers.length);
  const avgResponse = Math.round(teamMembers.reduce((s, m) => s + m.responseRate, 0) / teamMembers.length);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Team Workload</h1>
        <p className="text-muted-foreground">Recruiter performance and capacity management</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Target className="h-5 w-5 text-primary" /></div>
            <div>
              <div className="text-2xl font-bold text-foreground">{totalOpen}</div>
              <div className="text-xs text-muted-foreground">Open Requisitions</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10"><CheckCircle2 className="h-5 w-5 text-success" /></div>
            <div>
              <div className="text-2xl font-bold text-foreground">{totalHired}</div>
              <div className="text-xs text-muted-foreground">Hired This Month</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10"><Clock className="h-5 w-5 text-accent-foreground" /></div>
            <div>
              <div className="text-2xl font-bold text-foreground">{avgTime}d</div>
              <div className="text-xs text-muted-foreground">Avg Time to Fill</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10"><Star className="h-5 w-5 text-warning" /></div>
            <div>
              <div className="text-2xl font-bold text-foreground">{avgResponse}%</div>
              <div className="text-xs text-muted-foreground">Avg Response Rate</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {teamMembers.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{member.avatar}</div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">{member.name}</div>
                  <div className="text-xs text-muted-foreground">{member.role}</div>
                </div>
                <Badge variant="outline" className={getCapacityColor(member.capacity)}>
                  {member.capacity}% load
                </Badge>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Capacity</span>
                  <span className={`font-medium ${getCapacityColor(member.capacity)}`}>{member.capacity}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${getProgressColor(member.capacity)}`}
                    style={{ width: `${member.capacity}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-muted/50 p-2">
                  <div className="text-lg font-bold text-foreground">{member.openReqs}</div>
                  <div className="text-[10px] text-muted-foreground">Open Reqs</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-2">
                  <div className="text-lg font-bold text-foreground">{member.activeCandidates}</div>
                  <div className="text-[10px] text-muted-foreground">Candidates</div>
                </div>
                <div className="rounded-lg bg-muted/50 p-2">
                  <div className="text-lg font-bold text-foreground">{member.hiredThisMonth}</div>
                  <div className="text-[10px] text-muted-foreground">Hired</div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Avg {member.avgTimeToFill}d to fill</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {member.interviewsThisWeek} interviews/wk</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly Hires by Recruiter</CardTitle>
          <CardDescription>Number of candidates hired per week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="week" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px"
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="rajesh" name="Rajesh" stroke="hsl(174,62%,38%)" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="priya" name="Priya" stroke="hsl(38,92%,50%)" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="amit" name="Amit" stroke="hsl(190,70%,40%)" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="neha" name="Neha" stroke="hsl(142,71%,45%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
