'use client';

import React from 'react';
import { 
    ShieldCheck, 
    Lock, 
    Shield, 
    History 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SecurityTab({
    metadata
}) {
    return (
        <div className="max-w-3xl space-y-6">
            <Card className="glass-card border-none shadow-none">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/5 rounded-lg border border-primary/20">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                        </div>
                        <div className="space-y-0.5">
                            <CardTitle className="text-base font-bold tracking-tight text-primary">Encryption & Governance</CardTitle>
                            <CardDescription className="text-[10px] font-medium uppercase tracking-widest opacity-60">Security Manifests</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-background/40 backdrop-blur-sm border border-border/20 rounded-xl shadow-sm space-y-3">
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase text-primary tracking-widest">
                                <Lock size={13} className="text-primary/60" /> Cipher Status
                            </div>
                            <p className="text-xs font-black font-mono tracking-tight text-foreground">AES-256-GCM</p>
                            <p className="text-[9px] text-muted-foreground font-medium leading-tight opacity-70">All session keys are salted and encrypted before DB persistence.</p>
                        </div>
                        <div className="p-5 bg-background/40 backdrop-blur-sm border border-border/20 rounded-xl shadow-sm space-y-3">
                            <div className="flex items-center gap-3 text-[10px] font-black uppercase text-primary tracking-widest">
                                <Shield size={13} className="text-primary/60" /> Security Node
                            </div>
                            <p className="text-xs font-black font-mono tracking-tight text-primary">AUTHORIZED</p>
                            <p className="text-[9px] text-muted-foreground font-medium leading-tight opacity-70">Cloud API sessions are monitored for suspicious activity.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase text-muted-foreground opacity-60 ml-1">
                            <History size={13} /> Recent Connection Audit
                        </div>
                        <div className="space-y-3">
                            {[
                                { event: 'Session Refreshed', status: 'OK', color: 'text-green-500', bg: 'bg-green-500/10', time: '12m ago' },
                                { event: 'Credential Check', status: 'PASS', color: 'text-green-500', bg: 'bg-green-500/10', time: '4h ago' },
                                { event: 'Key Handshake', status: 'SYNC', color: 'text-blue-500', bg: 'bg-blue-500/10', time: 'Yesterday' }
                            ].map((log, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm rounded-xl border border-border/20 shadow-sm">
                                    <span className="text-xs font-bold tracking-tight text-foreground">{log.event}</span>
                                    <div className="flex items-center gap-4">
                                        <Badge variant="outline" className={`text-[9px] font-black tracking-widest h-5 ${log.color} ${log.bg} border-0 px-2`}>{log.status}</Badge>
                                        <span className="text-[10px] text-muted-foreground font-black font-mono opacity-50 uppercase tracking-tighter">{log.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="pt-0 pb-8 px-8 justify-end">
                    <Button variant="ghost" size="sm" className="text-destructive text-[10px] font-black uppercase tracking-widest hover:bg-destructive/10 rounded-xl px-6">
                        Revoke All Remote Access
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
