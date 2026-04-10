import React from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Bot, LineChart } from "lucide-react";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Import Modules

import { HashtagsGenerator } from './HashtagsGenerator';
import { ContentRewriter } from './ContentRewriter';
import { ContentCalendar } from './ContentCalendar';
import { ApiDocs } from './ApiDocs';
import { AiAnalytics } from './AiAnalytics';
import { ContentGenerator } from './ContentGenerator';


// ---------------------------------------------------------
// COMPONENT EXPORT
// ---------------------------------------------------------

export const AILabModal = ({ isOpen, onOpenChange }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent
                className="p-0 border border-border/50 rounded-lg shadow-2xl bg-background flex flex-col overflow-hidden"
                style={{ minWidth: '90vw', maxWidth: '90vw', minHeight: '90vh', maxHeight: '90vh' }}
            >
                <Tabs defaultValue="generator" className="w-full">
                    <DialogHeader className="p-4 border-b border-border bg-card  flex flex-row items-center justify-between">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Bot className="h-6 w-6 text-primary" /> AI Content Lab
                        </DialogTitle>
                        <TabsList className='mr-10'>
                            <TabsTrigger value="generator">Generator</TabsTrigger>
                            <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
                            <TabsTrigger value="rewriter">Rewriter</TabsTrigger>
                            <TabsTrigger value="content-calendar">Content Calendar</TabsTrigger>
                            <TabsTrigger value="api-docs">API Docs</TabsTrigger>
                            <TabsTrigger value="analytics">Analytis</TabsTrigger>

                        </TabsList>
                    </DialogHeader>
                    <ScrollArea className="flex-1 overflow-auto rounded-b-lg bg-muted/10">
                        <TabsContent value="generator" className="m-0 h-full data-[state=inactive]:hidden outline-none">
                            <ContentGenerator />
                        </TabsContent>
                        <TabsContent value="hashtags" className="m-0 h-full data-[state=inactive]:hidden outline-none">
                            <HashtagsGenerator />
                        </TabsContent>
                        <TabsContent value="rewriter" className="m-0 h-full data-[state=inactive]:hidden outline-none">
                            <ContentRewriter />
                        </TabsContent>
                        <TabsContent value="content-calendar" className="m-0 h-full data-[state=inactive]:hidden outline-none">
                            <ContentCalendar />
                        </TabsContent>
                        <TabsContent value="api-docs" className="m-0 h-full data-[state=inactive]:hidden outline-none">
                            <ApiDocs />
                        </TabsContent>
                        <TabsContent value="analytics" className="m-0 h-full data-[state=inactive]:hidden outline-none">
                            <AiAnalytics />
                        </TabsContent>
                    </ScrollArea>
                </Tabs>

            </DialogContent>
        </Dialog>
    );
};
