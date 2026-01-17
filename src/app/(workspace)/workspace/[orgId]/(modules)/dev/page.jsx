'use client'
import React from 'react'
import { ContentTopbar } from '../../(misc)/_components/ContentTopbar'
import { ScrollArea } from '@/components/ui/scroll-area'
import Header from './components/Header'
import { Button } from '@/components/ui/button'
import { ArrowRight, Clock, Home, LayoutPanelTop, Sparkles, Zap } from 'lucide-react'
import ModuleCard from './components/ModuleCard'
import { motion } from 'framer-motion';
import { moduleTypes } from './lib/templates'
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs"
import Dashboard from './pages/Dashboard'

export default function DevPage() {
    return (
        <div className='absolute inset-0 flex flex-col gap-2'>

            <Tabs defaultValue="dashboard" className="">

                <ContentTopbar
                    title='Development'
                    description='Appointment Calendar for Optimal Patient Flow, Real-Time Updates, and Effortless Time Management'
                    icon='combine'
                    actionComp={
                        <TabsList>
                            <TabsTrigger value="dashboard">
                                <LayoutPanelTop className='text-primary h-4 w-4 mr-2' />
                                Dashboard
                            </TabsTrigger>
                            <TabsTrigger value="template">
                                <Zap className='text-primary h-4 w-4 mr-2' />
                                Templates
                            </TabsTrigger>
                            <TabsTrigger value="ai">
                                <Sparkles className='text-primary h-4 w-4 mr-2' />
                                AI Generate
                            </TabsTrigger>
                        </TabsList>
                    }
                />

                <ScrollArea className='h-[85vh] flex flex-grow  rounded-md '>
                    <div className="p-2 space-y-6 animate-fade-in ">

                        <TabsContent value="dashboard">
                            <Dashboard />
                        </TabsContent>
                        <TabsContent value="template">Change your password here.</TabsContent>
                        <TabsContent value="ai">Change your password here.</TabsContent>

                    </div>
                </ScrollArea>
            </Tabs>

        </div >
    )
}
