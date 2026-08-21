'use client';

import React, { useState } from 'react';
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Inter } from "next/font/google";
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import AppTopNav from '../_components/AppTopNav';
import AppSidebar from '../_components/AppSidebar';
import { WorkspaceProvider } from '@/providers/WorkspaceProvider';
import WhatsAppDefaultSync from '@/components/WhatsAppDefaultSync';
import { OfflineBanner } from '@/components/global/OfflineBanner';
import { KeyboardShortcutsModal, useKeyboardShortcuts } from '@/components/global/KeyboardShortcutsModal';

const font = Inter({ subsets: ["latin"] });

function WorkspaceLayoutInner({ children }) {
    const { open, setOpen, Component: ShortcutsModal } = useKeyboardShortcuts();

    return (
        <>
            <OfflineBanner />
            <ShortcutsModal />
            <div className={`flex h-dvh max-w-[100vw] ${font.className} overflow-hidden bg-background`}>
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset className='flex flex-col w-full h-full transition-all p-2'>
                        <div className="py-1.5">
                            <AppTopNav />
                        </div>
                        <div className='flex-1 min-h-0 relative pt-0 overflow-hidden'>
                            <div className='h-full relative border border-border/80  rounded-lg bg-card overflow-hidden shadow-xs'>
                                <ScrollArea className="h-full overflow-hidden relative bg-background">
                                    {children}
                                    <ScrollBar orientation="vertical" />
                                </ScrollArea>
                            </div>
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </div>
        </>
    );
}

export default function WorkspaceLayout({ children }) {
    return (
        <>
            <WhatsAppDefaultSync />
            <WorkspaceProvider>
                <WorkspaceLayoutInner>
                    {children}
                </WorkspaceLayoutInner>
            </WorkspaceProvider>
        </>
    );
}
