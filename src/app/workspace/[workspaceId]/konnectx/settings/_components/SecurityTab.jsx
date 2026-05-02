'use client';

import React from 'react';
import {
    ShieldCheck,
    Lock,
    Shield,
    History
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function SecurityTab() {
    return (
        <div className="flex-1 space-y-4 outline-none custom-scrollbar overflow-y-auto">
            <div className=" space-y-4">
                <Card className="border shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/5 rounded-lg border border-primary/10">
                                <ShieldCheck className="w-4 h-4 text-primary" />
                            </div>
                            <div className="space-y-0.5">
                                <CardTitle className="text-base font-semibold">Encryption & Governance</CardTitle>
                                <CardDescription className="text-xs font-medium">Security Manifests</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-muted/5 border border-border/40 rounded-xl space-y-3">
                                <div className="flex items-center gap-3 text-xs font-semibold text-primary">
                                    <Lock size={13} className="text-primary/60" /> Cipher Status
                                </div>
                                <p className="text-sm font-mono font-medium text-foreground">AES-256-GCM</p>
                                <p className="text-[10px] text-muted-foreground font-medium leading-tight">All session keys are salted and encrypted before DB persistence.</p>
                            </div>
                            <div className="p-5 bg-muted/5 border border-border/40 rounded-xl space-y-3">
                                <div className="flex items-center gap-3 text-xs font-semibold text-primary">
                                    <Shield size={13} className="text-primary/60" /> Security Node
                                </div>
                                <p className="text-sm font-semibold text-primary">AUTHORIZED</p>
                                <p className="text-[10px] text-muted-foreground font-medium leading-tight">Cloud API sessions are monitored for suspicious activity.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground ml-1">
                                <History size={13} /> Recent Connection Audit
                            </div>
                            <div className="space-y-3">
                                {[
                                    { event: 'Session Refreshed', status: 'OK', color: 'text-green-500', bg: 'bg-green-500/10', time: '12m ago' },
                                    { event: 'Credential Check', status: 'PASS', color: 'text-green-500', bg: 'bg-green-500/10', time: '4h ago' },
                                    { event: 'Key Handshake', status: 'SYNC', color: 'text-blue-500', bg: 'bg-blue-500/10', time: 'Yesterday' }
                                ].map((log, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-background rounded-xl border border-border/40 shadow-sm">
                                        <span className="text-xs font-semibold text-foreground">{log.event}</span>
                                        <div className="flex items-center gap-4">
                                            <Badge variant="secondary" className={`text-[10px] font-semibold h-5 ${log.color} ${log.bg} border-0 px-2`}>{log.status}</Badge>
                                            <span className="text-[10px] text-muted-foreground font-medium opacity-60">{log.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-0 pb-8 px-8 justify-end">
                        <Button variant="ghost" size="sm" className="text-destructive text-xs font-medium hover:bg-destructive/10 rounded-lg px-6">
                            Revoke All Remote Access
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
