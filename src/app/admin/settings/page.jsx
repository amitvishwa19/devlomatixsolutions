"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Building, Bell, Users, Shield, Mail } from "lucide-react";
import EmailTemplateEditor from "@/app/admin/_component/EmailTemplateEditor";

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your ATS configuration</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="company" className="gap-2"><Building className="h-4 w-4" /> Company</TabsTrigger>
          <TabsTrigger value="emails" className="gap-2"><Mail className="h-4 w-4" /> Email Templates</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="team" className="gap-2"><Users className="h-4 w-4" /> Team</TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4" /> Security</TabsTrigger>
        </TabsList>

        <TabsContent value="emails">
          <EmailTemplateEditor />
        </TabsContent>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your company details and branding.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input defaultValue="HireFlow Inc." />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input defaultValue="https://hireflow.com" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input defaultValue="Technology" />
                </div>
                <div className="space-y-2">
                  <Label>Company Size</Label>
                  <Input defaultValue="50-200 employees" />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Hiring Pipeline Stages</h3>
                <p className="text-xs text-muted-foreground">Default stages: Applied → Screening → Interview → Offer → Hired</p>
                <div className="flex flex-wrap gap-2">
                  {["Applied", "Screening", "Interview", "Offer", "Hired"].map((s) => (
                    <span key={s} className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">{s}</span>
                  ))}
                </div>
              </div>
              <Button onClick={() => toast.success("Company settings saved")}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what you want to be notified about.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: "New Applications", desc: "Get notified when a candidate applies", defaultChecked: true },
                { label: "Interview Reminders", desc: "Reminder 30 min before interviews", defaultChecked: true },
                { label: "Stage Changes", desc: "When candidates move between stages", defaultChecked: true },
                { label: "Weekly Digest", desc: "Weekly summary of hiring activity", defaultChecked: false },
                { label: "Offer Responses", desc: "When candidates accept or decline offers", defaultChecked: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                  <Switch defaultChecked={item.defaultChecked} />
                </div>
              ))}
              <Button onClick={() => toast.success("Notification preferences saved")}>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage who has access to your ATS.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Rajesh Kumar", email: "rajesh@hireflow.in", role: "Admin" },
                { name: "Priya Sharma", email: "priya@hireflow.in", role: "Recruiter" },
                { name: "Amit Verma", email: "amit@hireflow.in", role: "Hiring Manager" },
                { name: "Neha Kapoor", email: "neha@hireflow.in", role: "Recruiter" },
              ].map((member) => (
                <div key={member.email} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.email}</div>
                    </div>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{member.role}</span>
                </div>
              ))}
              <Button variant="outline" onClick={() => toast.info("Invite feature coming soon")}>Invite Team Member</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and access controls.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: "Two-Factor Authentication", desc: "Require 2FA for all team members", defaultChecked: false },
                { label: "Session Timeout", desc: "Auto-logout after 30 minutes of inactivity", defaultChecked: true },
                { label: "IP Whitelisting", desc: "Restrict access to specific IP addresses", defaultChecked: false },
                { label: "Audit Logging", desc: "Log all user actions for compliance", defaultChecked: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                  <Switch defaultChecked={item.defaultChecked} />
                </div>
              ))}
              <Button onClick={() => toast.success("Security settings saved")}>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
