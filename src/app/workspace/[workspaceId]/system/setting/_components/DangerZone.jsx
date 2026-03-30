'use client';

import React, { useState } from'react';
import { useSettings } from'../_provider/SettingProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from'@/components/ui/card';
import { Button } from'@/components/ui/button';
import { Label } from'@/components/ui/label';
import { Trash2, AlertTriangle, Power, RotateCcw } from'lucide-react';
import { toast } from'sonner';

export const DangerZone = () => {
 const { settings } = useSettings();
 const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

 const handleDeleteWorkspace = () => {
 toast.error("This action is restricted. Please contact super-administration for workspace deletion.");
 };

 return (
 <div className="space-y-6 animate-fade-in">
 <Card className="rounded-md border border-rose-500/40 shadow-xl shadow-rose-500/5 bg-rose-500/[0.02] backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
 <CardHeader className="pb-4">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-rose-500/10 rounded-md flex items-center justify-center border border-rose-500/20 shadow-inner">
 <AlertTriangle className="w-6 h-6 text-rose-500"/>
 </div>
 <div>
 <CardTitle className="text-xl font-bold text-rose-500">Danger Zone</CardTitle>
 <CardDescription className="text-sm font-medium text-rose-500/60 font-semibold italic">
 Irreversible and destructive actions for your workspace.
 </CardDescription>
 </div>
 </div>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="flex items-center justify-between gap-8 p-4 bg-background/50 rounded-md border border-rose-500/10">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <Power className="w-4 h-4 text-amber-500"/>
 <Label className="text-sm font-bold text-foreground">Maintenance Mode</Label>
 </div>
 <p className="text-[10px] text-muted-foreground font-medium opacity-70">
 Temporarily restrict all access to the workspace except for administrators.
 </p>
 </div>
 <Button 
 variant="outline"
 size="sm"
 className={`rounded-md text-[10px] font-bold h-9 px-4 transition-all ${isMaintenanceMode ?'bg-amber-500 text-white border-none':'text-amber-500 border-amber-500/20'}`}
 onClick={() => {
 setIsMaintenanceMode(!isMaintenanceMode);
 toast.info(isMaintenanceMode ?"Maintenance mode disabled":"Maintenance mode enabled");
 }}
 >
 {isMaintenanceMode ?"DEACTIVATE":"ACTIVATE"}
 </Button>
 </div>

 <div className="flex items-center justify-between gap-8 p-4 bg-background/50 rounded-md border border-rose-500/10">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <RotateCcw className="w-4 h-4 text-blue-500"/>
 <Label className="text-sm font-bold text-foreground">Reset Configuration</Label>
 </div>
 <p className="text-[10px] text-muted-foreground font-medium opacity-70">
 Restore all branding and security settings to workspace defaults.
 </p>
 </div>
 <Button variant="outline"size="sm"className="rounded-md text-[10px] font-bold h-9 px-4 text-blue-500 border-blue-500/20">
 RESET ALL
 </Button>
 </div>

 <div className="flex items-center justify-between gap-8 p-4 bg-rose-500/5 rounded-md border border-rose-500/20 shadow-inner group">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <Trash2 className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform"/>
 <Label className="text-sm font-bold text-rose-600">Delete Workspace</Label>
 </div>
 <p className="text-[10px] text-rose-500/60 font-medium italic">
 Once you delete a workspace, there is no going back. All data will be lost.
 </p>
 </div>
 <Button 
 variant="destructive"
 size="sm"
 className="rounded-md text-[10px] tracking-[0.2em] px-6 bg-rose-500 hover:bg-rose-600 shadow-xl shadow-rose-500/30 transition-all transform hover:scale-105"
 onClick={handleDeleteWorkspace}
 >
 DELETE
 </Button>
 </div>
 </CardContent>
 </Card>

 <div className="p-4 bg-muted/20 rounded-md border border-border/40 flex flex-col gap-2 items-center text-center opacity-60">
 <p className="text-[9px] tracking-[0.3em] text-muted-foreground">Critical Infrastructure</p>
 <p className="text-[10px] text-muted-foreground font-semibold max-w-sm">
 Workspace identification: {settings?.general?.inviteCode ||"..."} | CID: {typeof window !=='undefined'? window.crypto.randomUUID().slice(0, 8) :'...'}
 </p>
 </div>
 </div>
 );
};