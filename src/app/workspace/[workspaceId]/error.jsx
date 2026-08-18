'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, RotateCcw, Home, Terminal } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function WorkspaceError({ error, reset }) {
    const router = useRouter();
    const params = useParams();
    const workspaceId = params?.workspaceId || 'default';

    useEffect(() => {
        console.error('Workspace Route Error Boundary Caught:', error);
    }, [error]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
            <Card className="max-w-md w-full bg-card border-border/50 shadow-2xl rounded-xl overflow-hidden text-center">
                <CardHeader className="p-6 pb-4 border-b border-border/40 bg-secondary/15 flex flex-col items-center">
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl mb-2 text-rose-500">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-base font-bold text-foreground">
                        Workspace Encountered an Error
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                        We ran into an issue rendering this workspace section.
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                    {error?.message && (
                        <div className="p-3 rounded-lg bg-secondary/30 border border-border/40 text-left font-mono text-[11px] text-muted-foreground overflow-x-auto max-h-32">
                            <div className="flex items-center gap-1.5 text-rose-500 font-bold mb-1">
                                <Terminal className="w-3.5 h-3.5" />
                                <span>Diagnostics</span>
                            </div>
                            <p className="break-words">{error.message}</p>
                        </div>
                    )}

                    <div className="flex items-center justify-center gap-2.5 pt-2">
                        <Button
                            variant="default"
                            onClick={() => reset()}
                            className="h-8 text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Try Again</span>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => router.push(`/workspace/${workspaceId}`)}
                            className="h-8 text-xs font-semibold gap-1.5 border-border/50 rounded-lg hover:bg-secondary/40"
                        >
                            <Home className="w-3.5 h-3.5" />
                            <span>Dashboard</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
