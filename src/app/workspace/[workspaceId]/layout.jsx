import React from'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from"@/components/ui/sidebar"

import { Inter } from"next/font/google";

import { ScrollArea, ScrollBar } from'@/components/ui/scroll-area';
import AppTopNav from'../_components/AppTopNav';
import AppSidebar from'../_components/AppSidebar';
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
 <div className='flex-1 min-h-0 relative pt-0 overflow-hidden'>
 <div className='h-full relative border border-border rounded-md bg-card/50 overflow-hidden shadow-soft'>
 <ScrollArea className="h-full overflow-hidden">
 {children}
 <ScrollBar orientation="horizontal"/>
 </ScrollArea>
 </div>
 </div>
 </SidebarInset>
 </SidebarProvider>
 </div>
 )
}