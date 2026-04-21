'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Calendar, 
    PlusCircle, 
    MoreVertical 
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const SchedulerContent = ({ crons }) => {
    return (
        <Card className="border-border/40 bg-card/40 backdrop-blur-md rounded-md overflow-hidden shadow-xl min-h-[500px]">
            <CardHeader className="border-b border-border/10 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg font-bold">Autonomous Scheduler</CardTitle>
                    <CardDescription className="text-xs font-medium">Define recurring missions for your agent workforce.</CardDescription>
                </div>
                <Button className="rounded-md bg-indigo-600 hover:bg-indigo-700 font-bold text-xs h-9 gap-2 shadow-lg shadow-indigo-600/20">
                    <PlusCircle className="w-4 h-4" /> Add Schedule
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                {crons.map((cron) => (
                    <div key={cron.id} className="p-6 flex items-center justify-between hover:bg-background/40 transition-colors border-b border-border/5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/10 rounded-md">
                                <Calendar className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">{cron.title}</h4>
                                <p className="text-xs font-mono text-muted-foreground mt-1 bg-muted/40 w-fit px-2 py-0.5 rounded">{cron.schedule}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="text-right">
                                <p className="text-xs font-bold text-muted-foreground mb-1">EXECUTION</p>
                                <p className="text-xs font-bold text-indigo-600">{cron.mission}</p>
                            </div>
                            <Badge className={`text-xs h-5 ${cron.enabled ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                                {cron.enabled ? 'ACTIVE' : 'PAUSED'}
                            </Badge>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4 opacity-30" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Toggle Status</DropdownMenuItem>
                                    <DropdownMenuItem>Edit Schedule</DropdownMenuItem>
                                    <DropdownMenuItem className="text-rose-500">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};
