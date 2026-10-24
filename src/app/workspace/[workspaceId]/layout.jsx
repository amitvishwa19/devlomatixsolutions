'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Inter } from "next/font/google";
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useSession, signOut } from 'next-auth/react';
import AppTopNav from '../_components/AppTopNav';
import AppSidebar from '../_components/AppSidebar';
import { WorkspaceProvider } from '@/providers/WorkspaceProvider';
import WhatsAppDefaultSync from '@/components/WhatsAppDefaultSync';
import { OfflineBanner } from '@/components/global/OfflineBanner';
import { KeyboardShortcutsModal, useKeyboardShortcuts } from '@/components/global/KeyboardShortcutsModal';
import { CrmSocketProvider } from '@/providers/CrmSocketProvider';
import { NotificationProvider } from '@/providers/NotificationProvider';
import WorkspaceMessageNotifier from '../_components/WorkspaceMessageNotifier';

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
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.error === 'SESSION_SUPERSEDED') {
            toast.error('Session ended: You logged in from Mobile. Please log in again to use Web.', {
                id: 'session-superseded-toast',
                duration: 6000,
            });
            signOut({ callbackUrl: '/login' });
        }
    }, [session]);

    return (
        <>
            <Suspense fallback={null}>
                <UnauthorizedToastHandler />
            </Suspense>
            <OfflineBanner />
            <ShortcutsModal />
            <WorkspaceMessageNotifier />
            <div className={`flex h-dvh max-w-[100vw] ${font.className} overflow-hidden bg-background`}>
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset className='flex flex-col w-full h-full min-w-0 max-w-full transition-all p-2 overflow-hidden'>
                        <div className="py-1.5 shrink-0">
                            <AppTopNav />
                        </div>
                        <div className='flex-1 min-h-0 min-w-0 relative pt-0 overflow-hidden'>
                            <div className='h-full w-full min-w-0 relative border border-border/80 rounded-lg bg-card overflow-hidden shadow-xs'>
                                <ScrollArea className="h-full w-full min-w-0 overflow-hidden relative bg-background [&>div]:!overflow-x-hidden [&>div>div]:!block [&>div>div]:!min-h-full [&>div>div]:!w-full [&>div>div]:!max-w-full [&>div>div]:!min-w-0">
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
                    <NotificationProvider>
                        <WorkspaceLayoutInner>
                            {children}
                        </WorkspaceLayoutInner>
                    </NotificationProvider>
                </CrmSocketProvider>
            </WorkspaceProvider>
        </>
    );
}
