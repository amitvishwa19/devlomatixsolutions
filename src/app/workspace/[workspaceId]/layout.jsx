import React from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

import { Inter } from "next/font/google";

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import AppTopNav from '../_components/AppTopNav';
import AppSidebar from '../_components/AppSidebar';
const font = Inter({ subsets: ["latin"] });

export default function WorkspaceLayout({ children }) {
    return (
        <div className={`flex h-dvh max-w-[100vw] ${font.className} overflow-hidden bg-background`}>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className='flex flex-col w-full h-full transition-all p-2'>
                    <div className="p-2">
                        <AppTopNav />
                    </div>
                    <div className='h-full relative flex-1 pt-0 overflow-hidden'>
                        <ScrollArea className='h-full relative flex-1 border  rounded-md bg-card/50  overflow-hidden pb-4'>
                            <div className="min-h-full">
                                {children}
                            </div>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    )
}