import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area, FunnelChart } from "recharts";
import { useAts } from "@/ATS/context/AtsContext";
import { stages } from "@/ATS/data/mockData";
import { Download, TrendingUp, Clock, Target, Users, DollarSign, Award, ArrowUpRight, ArrowDownRight, FileText } from "lucide-react";
import { toast } from "sonner";

const COLORS = ["hsl(174,62%,38%)", "hsl(190,70%,40%)", "hsl(38,92%,50%)", "hsl(142,71%,45%)", "hsl(220,20%,50%)", "hsl(0,72%,51%)"];

const Reports = () => {
  const { candidates, jobs, interviews } = useAts();
  const [period, setPeriod] = useState("month");

  // Pipeline conversion
  const stageOrder = ["applied", "screening", "interview", "offer", "hired"];
  const funnelData = stageOrder.map((s) => ({
    stage: stages.find((st) => st.key === s)?.label || s,
    count: candidates.filter((c) => c.stage === s || stageOrder.indexOf(c.stage) > stageOrder.indexOf(s)).length,
  }));

  const conversionRates = stageOrder.slice(1).map((s, i) => {
    const prev = funnelData[i].count;
    const curr = funnelData[i + 1].count;
    return {
      transition: `${funnelData[i].stage} → ${funnelData[i + 1].stage}`,
      rate: prev > 0 ? Math.round((curr / prev) * 100) : 0,
    };
  });

  // Source effectiveness
  const sourceData = Array.from(new Set(candidates.map((c) => c.source))).map((source) => {
    const sourceCandidates = candidates.filter((c) => c.source === source);
    const hired = sourceCandidates.filter((c) => c.stage === "hired").length;
    return {
      source,
      total: sourceCandidates.length,
      hired,
      conversionRate: sourceCandidates.length > 0 ? Math.round((hired / sourceCandidates.length) * 100) : 0,
      avgRating: sourceCandidates.length > 0 ? (sourceCandidates.reduce((sum, c) => sum + c.rating, 0) / sourceCandidates.length).toFixed(1) : "0",
    };
  }).sort((a, b) => b.conversionRate - a.conversionRate);

  // Department metrics
  const deptData = Array.from(new Set(jobs.map((j) => j.department))).map((dept) => {
    const deptJobs = jobs.filter((j) => j.department === dept);
    const deptCandidates = candidates.filter((c) => deptJobs.some((j) => j.id === c.jobId));
    return {
      department: dept,
      openPositions: deptJobs.filter((j) => j.status === "open").length,
      candidates: deptCandidates.length,
      hired: deptCandidates.filter((c) => c.stage === "hired").length,
      avgRating: deptCandidates.length > 0 ? (deptCandidates.reduce((s, c) => s + c.rating, 0) / deptCandidates.length).toFixed(1) : "0",
    };
  });

  // Time trends (simulated)
  const trendData = [
    { month: "Jan", applications: 28, hires: 2, interviews: 12, offers: 4 },
    { month: "Feb", applications: 35, hires: 3, interviews: 15, offers: 5 },
    { month: "Mar", applications: 42, hires: 4, interviews: 18, offers: 6 },
    { month: "Apr", applications: 38, hires: 1, interviews: 14, offers: 3 },
  ];

  // Diversity metrics (simulated)
  const diversityData = [
    { category: "Gender Diverse", percentage: 45 },
    { category: "Ethnic Minority", percentage: 38 },
    { category: "Veterans", percentage: 8 },
    { category: "Disability", percentage: 5 },
  ];

  const kpis = [
    { label: "Avg. Time to Hire", value: "25 days", icon: Clock, change: -12, unit: "%" },
    { label: "Offer Accept Rate", value: "85%", icon: Target, change: 5, unit: "%" },
    { label: "Cost per Hire", value: "$4,200", icon: DollarSign, change: -8, unit: "%" },
    { label: "Quality of Hire", value: "4.2/5", icon: Award, change: 0.3, unit: "" },
  ];

  const exportReport = (format: string) => {
    if (format === "csv") {
      const headers = ["Metric", "Value"];
      const rows = [
        ["Total Candidates", candidates.length],
        ["Total Jobs", jobs.length],
        ["Open Jobs", jobs.filter((j) => j.status === "open").length],
        ["Hired", candidates.filter((c) => c.stage === "hired").length],
        ["Active Pipeline", candidates.filter((c) => !["hired", "rejected"].includes(c.stage)).length],
        ...sourceData.map((s) => [`Source: ${s.source}`, `${s.total} candidates, ${s.conversionRate}% conversion`]),
      ];
      const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hiring-report-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      toast.success("Report exported as CSV");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive hiring metrics and insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={() => exportReport("csv")}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
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
              <div className="flex items-center gap-1 mt-1">
                {kpi.change > 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-success" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 text-success" />
                )}
                <span className="text-xs font-medium text-success">
                  {Math.abs(kpi.change)}{kpi.unit} vs last period
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="pipeline">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="diversity">Diversity</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Pipeline Funnel</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={funnelData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
                    <XAxis dataKey="stage" fontSize={12} stroke="hsl(220,10%,46%)" />
                    <YAxis fontSize={12} stroke="hsl(220,10%,46%)" />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {funnelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Conversion Rates</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionRates.map((cr) => (
                    <div key={cr.transition} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{cr.transition}</span>
                        <span className="font-bold text-foreground">{cr.rate}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${cr.rate}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Source Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={sourceData} dataKey="total" nameKey="source" cx="50%" cy="50%" outerRadius={100} label={({ source, percent }) => `${source} ${(percent * 100).toFixed(0)}%`}>
                      {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Source Effectiveness</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sourceData.map((s) => (
                    <div key={s.source} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div>
                        <div className="text-sm font-medium text-foreground">{s.source}</div>
                        <div className="text-xs text-muted-foreground">{s.total} candidates · Avg rating {s.avgRating}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-foreground">{s.conversionRate}%</div>
                        <div className="text-xs text-muted-foreground">hire rate</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Department Overview</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deptData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
                  <XAxis dataKey="department" fontSize={12} stroke="hsl(220,10%,46%)" />
                  <YAxis fontSize={12} stroke="hsl(220,10%,46%)" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="openPositions" name="Open Positions" fill="hsl(174,62%,38%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="candidates" name="Candidates" fill="hsl(38,92%,50%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="hired" name="Hired" fill="hsl(142,71%,45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Hiring Trends Over Time</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
                  <XAxis dataKey="month" fontSize={12} stroke="hsl(220,10%,46%)" />
                  <YAxis fontSize={12} stroke="hsl(220,10%,46%)" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="applications" name="Applications" stroke="hsl(174,62%,38%)" fill="hsl(174,62%,38%)" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="interviews" name="Interviews" stroke="hsl(38,92%,50%)" fill="hsl(38,92%,50%)" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="offers" name="Offers" stroke="hsl(190,70%,40%)" fill="hsl(190,70%,40%)" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="hires" name="Hires" stroke="hsl(142,71%,45%)" fill="hsl(142,71%,45%)" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diversity" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Diversity Metrics</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {diversityData.map((d) => (
                  <div key={d.category} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{d.category}</span>
                      <span className="font-bold text-foreground">{d.percentage}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${d.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                * Diversity data is self-reported and anonymized. Percentages reflect the candidate pool composition.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
