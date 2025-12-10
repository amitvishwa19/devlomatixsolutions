'use server'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Inter, Unbounded, Geist, Geist_Mono, Roboto } from "next/font/google";
import OrgSidebar from '../_components/OrgSidebar';
import { TopNav } from '../_components/TopNav';
import { QueryProvider } from '@/providers/QueryProvider';
import { OrgModalProvider } from '@/providers/OrgModalProvider';
import DataProvider from './(misc)/_providers/DataProvider';
import { db } from '@/lib/db';

const inter = Inter({ subsets: ["latin"] });
const font = Roboto({ subsets: ["latin"] });

export default async function layout({ children }) {

    const appointments = await db.appointment.findMany({
        include: {
            doctor: {
                include: {
                    profile: true
                }
            },
            patient: {
                include: {
                    profile: true
                }
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    })


    return (
        <QueryProvider>
            <OrgModalProvider />
            <DataProvider >
                <div className={`flex h-screen max-w-screen ${font.className} overflow-hidden `}>
                    <div className='h-screen flex-grow hidden xl:flex '>
                        {/* <OrgNavigation /> */}
                        <OrgSidebar />
                    </div>
                    <div className='flex  flex-col w-full h-screen dark:bg-[#0E141B]'>
                        {/* <div>
                            <TopNav />
                        </div> */}

                        <ScrollArea className='h-full relative flex-1 p-0'>
                            <div className='p-2'>
                                {children}
                            </div>
                            <div className='h-4' />
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    </div>
                </div>
            </DataProvider>
        </QueryProvider>
    )
}
