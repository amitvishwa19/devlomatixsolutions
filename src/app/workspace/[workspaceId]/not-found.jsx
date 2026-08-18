'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function WorkspaceNotFound() {
    const router = useRouter();
    const params = useParams();
    const workspaceId = params?.workspaceId || 'default';

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
            <Card className="max-w-md w-full bg-card border-border/50 shadow-2xl rounded-xl overflow-hidden text-center">
                <CardHeader className="p-6 pb-4 border-b border-border/40 bg-secondary/15 flex flex-col items-center">
                    <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl mb-2 text-primary">
                        <FileQuestion className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-base font-bold text-foreground">
                        Module Not Found
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                        The requested workspace resource or page does not exist.
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                    <p className="text-xs text-muted-foreground">
                        Please verify the URL or return to your workspace command center.
                    </p>

                    <div className="flex items-center justify-center gap-2.5 pt-2">
                        <Button
                            variant="default"
                            onClick={() => router.push(`/workspace/${workspaceId}`)}
                            className="h-8 text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4"
                        >
                            <Home className="w-3.5 h-3.5" />
                            <span>Return to Dashboard</span>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            className="h-8 text-xs font-semibold gap-1.5 border-border/50 rounded-lg hover:bg-secondary/40"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Go Back</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
