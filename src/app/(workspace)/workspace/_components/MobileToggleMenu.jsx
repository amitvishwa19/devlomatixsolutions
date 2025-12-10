'use client'
import React, { useContext } from 'react'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from '@/components/ui/button';
import { Menu, PanelLeft } from "lucide-react";
import OrgSidebar from './OrgSidebar';
import { useAuth } from '@/providers/AuthProvider';
import { OrgContext } from '@/providers/OrgProvider';
import { OrgNavigation } from './OrgNavigation';
import { useSession } from 'next-auth/react';



export default function MobileToggleMenu({ serverId }) {
    const { daa: session } = useSession()
    const { server, loading } = useContext(OrgContext)
    return (
        <Sheet >
            <SheetTrigger asChild>
                <Button variant="ghost" size='icon' className='lg:hidden  focus:ring-0 focus-visible:ring-0 mr-2'>
                    <PanelLeft className='h-4 w-4' />
                </Button>
            </SheetTrigger>
            <SheetContent side='left' className='p-0 flex gap-0  border-none w-34'>

                <OrgNavigation />
                <OrgSidebar server={server} userId={session?.user?.userId} />
            </SheetContent>
        </Sheet>
    )
}
