'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Inter } from "next/font/google";
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import AppTopNav from '../_components/AppTopNav';
import AppSidebar from '../_components/AppSidebar';
import { WorkspaceProvider } from '@/providers/WorkspaceProvider';
import WhatsAppDefaultSync from '@/components/WhatsAppDefaultSync';
import { OfflineBanner } from '@/components/global/OfflineBanner';
import { KeyboardShortcutsModal, useKeyboardShortcuts } from '@/components/global/KeyboardShortcutsModal';
import { CrmSocketProvider } from '@/providers/CrmSocketProvider';

const font = Inter({ subsets: ["latin"] });

function UnauthorizedToastHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (searchParams.get('unauthorized') === '1') {
            const mod = searchParams.get('module') || 'this module';
            toast.error(`Access Denied: You do not have permission to view ${mod}.`, {
                id: 'unauthorized-toast',
                duration: 5000,
            });
            const params = new URLSearchParams(searchParams.toString());
            params.delete('unauthorized');
            params.delete('module');
            const newQuery = params.toString();
            router.replace(newQuery ? `${pathname}?${newQuery}` : pathname, { scroll: false });
        }
    }, [searchParams, pathname, router]);

    return null;
}

function WorkspaceLayoutInner({ children }) {
    const { open, setOpen, Component: ShortcutsModal } = useKeyboardShortcuts();

    return (
        <>
            <Suspense fallback={null}>
                <UnauthorizedToastHandler />
            </Suspense>
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
                                <ScrollArea className="h-full overflow-hidden relative bg-background [&>div>div]:!block [&>div>div]:!min-h-full [&>div>div]:!w-full">
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
                <CrmSocketProvider>
                    <WorkspaceLayoutInner>
                        {children}
                    </WorkspaceLayoutInner>
                </CrmSocketProvider>
            </WorkspaceProvider>
        </>
    );
}
