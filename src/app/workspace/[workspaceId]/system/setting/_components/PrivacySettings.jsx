'use client';

import React, { useState, useEffect } from'react';
import { useSettings } from '@/providers/WorkspaceProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from'@/components/ui/card';
import { Switch } from'@/components/ui/switch';
import { Label } from'@/components/ui/label';
import { Button } from'@/components/ui/button';
import { ShieldCheck, FileText, Fingerprint, Trash2, Eye, ShieldAlert, Database, History } from'lucide-react';

export const PrivacySettings = () => {
 const { settings, updateSettings, saving } = useSettings();
 const [localPrivacy, setLocalPrivacy] = useState({
 dataRetention: 365,
 gdprCompliant: true,
 activityLogging: true
 });

 useEffect(() => {
 if (settings?.privacy) {
 setLocalPrivacy({
 dataRetention: settings.privacy.dataRetention || 365,
 gdprCompliant: settings.privacy.gdprCompliant !== undefined ? settings.privacy.gdprCompliant : true,
 activityLogging: settings.privacy.activityLogging !== undefined ? settings.privacy.activityLogging : true
 });
 }
 }, [settings]);

 const handleSave = () => {
 updateSettings({ privacy: localPrivacy });
 };

 return (
 <div className="space-y-6 animate-fade-in">
 {/* Data Governance */}
 <Card className="rounded-md border border-border/40 shadow-xl shadow-emerald-500/5 bg-card/60 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
 <CardHeader className="pb-4">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-emerald-500/10 rounded-md flex items-center justify-center border border-emerald-500/20 shadow-inner">
 <Database className="w-6 h-6 text-emerald-500"/>
 </div>
 <div>
 <CardTitle className="text-xl font-bold">Data Governance</CardTitle>
 <CardDescription className="text-sm font-medium opacity-70">
 Manage how your workspace data is stored, retained, and archived.
 </CardDescription>
 </div>
 </div>
 </CardHeader>
 <CardContent className="space-y-6">
 <div className="grid gap-3">
 <Label className="text-[10px] font-bold opacity-70">Data Retention Period (Days)</Label>
 <div className="flex gap-4 items-center">
 <History className="w-5 h-5 text-muted-foreground/40"/>
 <code className="text-[11px] text-foreground flex-1">
 PURGE ALL LOGS OLDER THAN {localPrivacy.dataRetention} DAYS
 </code>
 <Button variant="outline"size="sm"className="rounded-md text-[10px] font-bold h-8 px-4"disabled>
 Adjust Policy
 </Button>
 </div>
 </div>

 <div className="flex items-center justify-between gap-8 p-4 bg-emerald-500/5 rounded-md border border-emerald-500/10">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <ShieldCheck className="w-4 h-4 text-emerald-600"/>
 <Label className="text-sm font-bold">GDPR Compliance Mode</Label>
 </div>
 <p className="text-[10px] text-emerald-600/60 font-medium">
 Enable enhanced privacy controls and data processing agreements.
 </p>
 </div>
 <Switch 
 checked={localPrivacy.gdprCompliant}
 onCheckedChange={(checked) => setLocalPrivacy(prev => ({ ...prev, gdprCompliant: checked }))}
 className="data-[state=checked]:bg-emerald-600"
 />
 </div>
 </CardContent>
 </Card>

 {/* Audit & Transparency */}
 <Card className="rounded-md border border-border/40 shadow-xl shadow-sky-500/5 bg-card/60 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
 <CardHeader className="pb-4">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-sky-500/10 rounded-md flex items-center justify-center border border-sky-500/20 shadow-inner">
 <Eye className="w-6 h-6 text-sky-500"/>
 </div>
 <div>
 <CardTitle className="text-xl font-bold">Audit & Transparency</CardTitle>
 <CardDescription className="text-xs font-medium opacity-70">
 Control the visibility of administrative actions and system logs.
 </CardDescription>
 </div>
 </div>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="flex items-center justify-between gap-8 p-4 bg-muted/20 rounded-md border border-border/40">
 <div className="space-y-1">
 <Label className="text-sm font-bold">Detailed Activity Logging</Label>
 <p className="text-[10px] text-muted-foreground font-medium opacity-70 font-semibold italic">
 Log every user interaction for security audit trails.
 </p>
 </div>
 <Switch 
 checked={localPrivacy.activityLogging}
 onCheckedChange={(checked) => setLocalPrivacy(prev => ({ ...prev, activityLogging: checked }))}
 />
 </div>

 <Button 
 variant="outline"
 className="w-full rounded-md border-dashed border-2 py-10 flex flex-col gap-2 items-center justify-center hover:bg-primary/5 hover:border-primary/40 transition-all opacity-80 group"
 onClick={() => toast.info("Exporting workspace data bundle...")}
 >
 <div className="flex items-center gap-3 text-primary group-hover:scale-110 transition-transform">
 <div className="p-2 bg-primary/10 rounded-md">
 <FileText className="w-5 h-5"/>
 </div>
 <span className="text-xs">Export Workspace Data Bundle</span>
 </div>
 <span className="text-[10px] font-medium text-muted-foreground italic">Generate a ZIP file with all posts, comments, and settings</span>
 </Button>
 </CardContent>
 <CardFooter className="border-t border-border/10 bg-sky-500/5 p-6 flex justify-end">
 <Button 
 onClick={handleSave} 
 disabled={saving}
 className="rounded-md font-bold px-8 shadow-xl shadow-sky-500/20 bg-sky-600 hover:bg-sky-700 text-white transition-all transform hover:scale-[1.02]"
 >
 {saving ?"Deploying...":"Update Privacy Policy"}
 </Button>
 </CardFooter>
 </Card>

 <div className="flex items-center gap-2 px-1">
 <ShieldAlert className="w-3.5 h-3.5 text-amber-500"/>
 <p className="text-[10px] font-bold text-muted-foreground/60">
 Privacy updates may take up to 24 hours to propagate across all edge regions.
 </p>
 </div>
 </div>
 );
};