import { Briefcase, Users, CalendarCheck, Send, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAts } from "@/ATS/context/AtsContext";
import { stages, pipelineChartData, weeklyApplications } from "@/ATS/data/mockData";
import StageBadge from "@/ATS/components/StageBadge";
import StarRating from "@/ATS/components/StarRating";
import ActivityFeed from "@/ATS/components/ActivityFeed";
import { Link } from "react-router-dom";

const COLORS = ["hsl(174,62%,38%)", "hsl(190,70%,40%)", "hsl(38,92%,50%)", "hsl(142,71%,45%)", "hsl(174,62%,30%)"];

const Dashboard = () => {
  const { jobs, candidates, interviews } = useAts();

  const statsCards = [
    { title: "Open Positions", value: jobs.filter((j) => j.status === "open").length, icon: Briefcase, trend: `${jobs.length} total`, color: "text-primary" },
    { title: "Total Candidates", value: candidates.length, icon: Users, trend: `${candidates.filter((c) => c.stage === "applied").length} new`, color: "text-accent" },
    { title: "Interviews", value: interviews.filter((i) => i.status === "scheduled").length, icon: CalendarCheck, trend: "Scheduled", color: "text-success" },
    { title: "Offers Sent", value: candidates.filter((c) => c.stage === "offer").length, icon: Send, trend: `${candidates.filter((c) => c.stage === "hired").length} hired`, color: "text-warning" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your hiring overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((s) => (
          <Card key={s.title} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{s.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{s.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyApplications}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
                <XAxis dataKey="week" fontSize={12} stroke="hsl(220,10%,46%)" />
                <YAxis fontSize={12} stroke="hsl(220,10%,46%)" />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(214,20%,90%)" }} />
                <Bar dataKey="applications" fill="hsl(174,62%,38%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pipeline Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipelineChartData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-muted-foreground">{item.name}</div>
                  <div className="flex-1">
                    <div className="h-8 rounded-md overflow-hidden bg-muted">
                      <div className="h-full rounded-md transition-all" style={{ width: `${(item.count / 45) * 100}%`, backgroundColor: COLORS[i] }} />
                    </div>
                  </div>
                  <div className="w-8 text-right text-sm font-medium text-foreground">{item.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Candidates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Applicants</CardTitle>
            <Link to="/admin/candidates" className="text-sm text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {candidates.slice(0, 5).map((c) => (
                <Link to={`/admin/candidates/${c.id}`} key={c.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">{c.avatar}</div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.jobTitle}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StageBadge stage={c.stage} />
                    <StarRating rating={c.rating} />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <ActivityFeed />
      </div>

      {/* Upcoming Interviews */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Upcoming Interviews</CardTitle>
          <Link to="/admin/interviews" className="text-sm text-primary hover:underline">View all</Link>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {interviews.filter((i) => i.status === "scheduled").slice(0, 4).map((interview) => (
              <div key={interview.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-sm font-medium text-accent-foreground">{interview.candidateAvatar}</div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{interview.candidateName}</div>
                    <div className="text-xs text-muted-foreground">{interview.type} • {interview.jobTitle}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">{interview.date}</div>
                  <div className="text-xs text-muted-foreground">{interview.time} • {interview.duration}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
