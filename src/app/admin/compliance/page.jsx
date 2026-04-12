"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Shield, AlertTriangle, CheckCircle2, Users, TrendingUp } from "lucide-react";

const genderData = [
  { name: "Male", value: 58, color: "hsl(174,62%,38%)" },
  { name: "Female", value: 35, color: "hsl(38,92%,50%)" },
  { name: "Non-binary", value: 5, color: "hsl(190,70%,40%)" },
  { name: "Prefer not to say", value: 2, color: "hsl(220,20%,50%)" },
];

const ethnicityData = [
  { name: "White", value: 42 },
  { name: "Asian", value: 22 },
  { name: "Hispanic/Latino", value: 15 },
  { name: "Black/African American", value: 12 },
  { name: "Two or more", value: 6 },
  { name: "Other", value: 3 },
];

const hiringFunnelDei = [
  { stage: "Applied", male: 58, female: 35, other: 7 },
  { stage: "Screened", male: 55, female: 38, other: 7 },
  { stage: "Interview", male: 50, female: 42, other: 8 },
  { stage: "Offer", male: 48, female: 45, other: 7 },
  { stage: "Hired", male: 50, female: 43, other: 7 },
];

const complianceChecks = [
  { id: 1, name: "EEOC Data Collection", status: "compliant", desc: "Voluntary self-identification forms enabled for all applicants" },
  { id: 2, name: "OFCCP Audit Readiness", status: "compliant", desc: "Applicant flow logs and disposition data maintained" },
  { id: 3, name: "ADA Compliance", status: "compliant", desc: "Reasonable accommodation process documented" },
  { id: 4, name: "Ban-the-Box Compliance", status: "warning", desc: "Criminal history questions appear in 2 job postings — review needed" },
  { id: 5, name: "Adverse Impact Analysis", status: "compliant", desc: "Four-fifths rule analysis shows no adverse impact" },
  { id: 6, name: "Data Retention Policy", status: "compliant", desc: "Candidate data retained for 2 years per federal requirements" },
  { id: 7, name: "Pay Equity Analysis", status: "warning", desc: "Salary range transparency missing in 3 job postings" },
  { id: 8, name: "Interview Consistency", status: "compliant", desc: "Structured interview guides used for all positions" },
];

const COLORS = ["hsl(174,62%,38%)", "hsl(38,92%,50%)", "hsl(190,70%,40%)", "hsl(142,71%,45%)", "hsl(220,20%,50%)", "hsl(0,72%,51%)"];

export default function CompliancePage() {
  const compliantCount = complianceChecks.filter((c) => c.status === "compliant").length;
  const warningCount = complianceChecks.filter((c) => c.status === "warning").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Compliance & DEI</h1>
        <p className="text-muted-foreground">Diversity metrics, EEOC tracking & compliance monitoring</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10"><Shield className="h-5 w-5 text-success" /></div>
            <div>
              <div className="text-2xl font-bold text-foreground">{compliantCount}/{complianceChecks.length}</div>
              <div className="text-xs text-muted-foreground">Compliant</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10"><AlertTriangle className="h-5 w-5 text-warning" /></div>
            <div>
              <div className="text-2xl font-bold text-foreground">{warningCount}</div>
              <div className="text-xs text-muted-foreground">Warnings</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Users className="h-5 w-5 text-primary" /></div>
            <div>
              <div className="text-2xl font-bold text-foreground">43%</div>
              <div className="text-xs text-muted-foreground">Diverse Hires</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10"><TrendingUp className="h-5 w-5 text-accent-foreground" /></div>
            <div>
              <div className="text-2xl font-bold text-foreground">+8%</div>
              <div className="text-xs text-muted-foreground">YoY Improvement</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="diversity" className="space-y-6">
        <TabsList>
          <TabsTrigger value="diversity">Diversity Metrics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Checks</TabsTrigger>
          <TabsTrigger value="funnel">Funnel Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="diversity">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Gender Distribution</CardTitle>
                <CardDescription>Across all applicants</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                      {genderData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ethnicity Distribution</CardTitle>
                <CardDescription>Self-reported demographics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ethnicityData.map((item, i) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{item.name}</span>
                        <span className="text-muted-foreground">{item.value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${item.value}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compliance Checklist</CardTitle>
              <CardDescription>Regulatory and policy compliance status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {complianceChecks.map((check) => (
                  <div key={check.id} className="flex items-start gap-3 rounded-lg border p-3">
                    {check.status === "compliant" ? (
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{check.name}</span>
                        <Badge variant={check.status === "compliant" ? "default" : "secondary"} className={`text-[10px] ${check.status === "compliant" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                          {check.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{check.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">DEI Funnel Analysis</CardTitle>
              <CardDescription>Gender representation across hiring stages (%)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={hiringFunnelDei}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
                  <XAxis dataKey="stage" fontSize={12} stroke="hsl(220,10%,46%)" />
                  <YAxis fontSize={12} stroke="hsl(220,10%,46%)" />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(214,20%,90%)" }} />
                  <Legend />
                  <Bar dataKey="male" name="Male" fill="hsl(174,62%,38%)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="female" name="Female" fill="hsl(38,92%,50%)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="other" name="Other" fill="hsl(190,70%,40%)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
