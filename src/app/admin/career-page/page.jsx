"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Eye, Palette, Type, Layout, Globe, MapPin, Briefcase, Clock } from "lucide-react";
import { useAts } from "@/app/admin/_context/AtsContext";

export default function CareerPageBuilderPage() {
  const { jobs } = useAts();
  const [settings, setSettings] = useState({
    companyName: "HireFlow Inc.",
    tagline: "Build the future with us",
    description: "We're a fast-growing tech company looking for passionate people to join our team. We believe in remote-first work, continuous learning, and building products that matter.",
    primaryColor: "#0d9488",
    showSalary: true,
    showLocation: true,
    showDepartmentFilter: true,
    headerImage: "",
    customCss: "",
    perks: ["Remote-first culture", "Unlimited PTO", "Health & dental", "401k matching", "Learning budget", "Home office stipend"],
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [newPerk, setNewPerk] = useState("");

  const openJobs = jobs.filter((j) => j.status === "open");

  const addPerk = () => {
    if (!newPerk) return;
    setSettings({ ...settings, perks: [...settings.perks, newPerk] });
    setNewPerk("");
  };

  const removePerk = (index) => {
    setSettings({ ...settings, perks: settings.perks.filter((_, i) => i !== index) });
  };

  const PreviewPage = () => (
    <div className="rounded-lg border overflow-hidden bg-background">
      {/* Hero */}
      <div className="p-8 text-center" style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.primaryColor}dd)` }}>
        <h1 className="text-3xl font-bold text-white">{settings.companyName}</h1>
        <p className="text-lg text-white/90 mt-2">{settings.tagline}</p>
        <p className="text-sm text-white/70 mt-3 max-w-2xl mx-auto">{settings.description}</p>
      </div>

      {/* Perks */}
      {settings.perks.length > 0 && (
        <div className="p-6 bg-muted/30">
          <h2 className="text-lg font-semibold text-foreground text-center mb-4">Why Join Us?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
            {settings.perks.map((perk, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border bg-background p-3 text-sm text-foreground">
                <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: settings.primaryColor }} />
                {perk}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Job Listings */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Open Positions ({openJobs.length})</h2>
        <div className="space-y-3">
          {openJobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors">
              <div>
                <div className="font-medium text-foreground">{job.title}</div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.department}</span>
                  {settings.showLocation && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>}
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {settings.showSalary && <span className="text-sm text-muted-foreground hidden sm:block">{job.salary}</span>}
                <Button size="sm" style={{ backgroundColor: settings.primaryColor }}>Apply</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Career Page Builder</h1>
          <p className="text-muted-foreground">Design your public-facing careers page</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="h-4 w-4" /> {previewMode ? "Edit" : "Preview"}
          </Button>
          <Button className="gap-2" onClick={() => toast.success("Career page published!")}>
            <Globe className="h-4 w-4" /> Publish
          </Button>
        </div>
      </div>

      {previewMode ? (
        <PreviewPage />
      ) : (
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList>
            <TabsTrigger value="content" className="gap-2"><Type className="h-4 w-4" /> Content</TabsTrigger>
            <TabsTrigger value="design" className="gap-2"><Palette className="h-4 w-4" /> Design</TabsTrigger>
            <TabsTrigger value="settings" className="gap-2"><Layout className="h-4 w-4" /> Display</TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Hero Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input value={settings.companyName} onChange={(e) => setSettings({ ...settings, companyName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tagline</Label>
                    <Input value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={settings.description} onChange={(e) => setSettings({ ...settings, description: e.target.value })} rows={4} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Perks & Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {settings.perks.map((perk, i) => (
                      <Badge key={i} variant="secondary" className="cursor-pointer hover:bg-destructive/10" onClick={() => removePerk(i)}>
                        {perk} ×
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input value={newPerk} onChange={(e) => setNewPerk(e.target.value)} placeholder="Add a perk..." onKeyDown={(e) => e.key === "Enter" && addPerk()} />
                    <Button variant="outline" onClick={addPerk}>Add</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="design">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Brand Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label>Primary Color</Label>
                  <input type="color" value={settings.primaryColor} onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })} className="h-10 w-14 rounded border cursor-pointer" />
                  <Input value={settings.primaryColor} onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })} className="w-32" />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Custom CSS (Advanced)</Label>
                  <Textarea value={settings.customCss} onChange={(e) => setSettings({ ...settings, customCss: e.target.value })} placeholder=".career-page { ... }" rows={4} className="font-mono text-xs" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Display Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Show Salary Range", desc: "Display compensation on job listings", key: "showSalary" },
                  { label: "Show Location", desc: "Display job location", key: "showLocation" },
                  { label: "Department Filter", desc: "Allow filtering jobs by department", key: "showDepartmentFilter" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                    <Switch checked={settings[item.key]} onCheckedChange={(v) => setSettings({ ...settings, [item.key]: v })} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
