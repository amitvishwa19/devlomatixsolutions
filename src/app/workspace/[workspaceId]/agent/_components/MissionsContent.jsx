'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bot } from 'lucide-react';

export const MissionsContent = ({ missions, missionStatuses }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-6 custom-scrollbar min-h-[600px]">
            {missionStatuses.map(status => (
                <div key={status} className="flex flex-col gap-4 min-w-[240px]">
                    <h3 className="text-xs text-muted-foreground px-1">{status}</h3>
                    <div className="flex-1 space-y-3 bg-muted/20 p-2 rounded-md border border-border/10">
                        {missions.filter(m => m.status === status).map(mission => (
                            <Card key={mission.id} className="border-border/40 bg-card/60 backdrop-blur-md rounded-md overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all cursor-pointer">
                                <CardContent className="p-4 space-y-3">
                                    <Badge className={`text-xs px-1.5 h-4 
 ${mission.priority === 'Critical' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                                            mission.priority === 'High' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                                'bg-blue-500/10 text-blue-600 border-blue-500/20'}`} variant="outline">
                                        {mission.priority}
                                    </Badge>
                                    <h4 className="text-sm font-bold leading-tight">{mission.title}</h4>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 font-bold">
                                        <span className="flex items-center gap-1"><Bot className="w-3 h-3" /> {mission.agentId}</span>
                                        <span>{mission.progress}%</span>
                                    </div>
                                    <Progress value={mission.progress} className="h-1 bg-muted rounded-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
