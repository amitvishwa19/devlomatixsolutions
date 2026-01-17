import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Inter, Unbounded, Geist, Geist_Mono, Roboto } from "next/font/google";
import OrgSidebar from '../_components/general/OrgSidebar';
import { TopNav } from '../_components/general/TopNav';
import { QueryProvider } from '@/providers/QueryProvider';
import { OrgModalProvider } from '@/providers/OrgModalProvider';
import DataProvider from './(misc)/_providers/DataProvider';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { getServerSession } from 'next-auth';
import { WorkspaceProvider } from '../_provider/WorkspaceProvider';
import { getWorkspaceData } from '@/lib/workspace';




const inter = Inter({ subsets: ["latin"] });
const font = Roboto({ subsets: ["latin"] });

export const metadata = {
    title: {
        default: 'Dashboard',
        template: `%s | ${process.env.APP_NAME}`
    },
    description: 'Devlomatix',
}

export default async function layout({ children }) {

    const session = await getServerSession(authOptions);
    const data = await getWorkspaceData(session.user.userId);




    return (
        <WorkspaceProvider initialData={data}>
            <QueryProvider>
                <OrgModalProvider />
                <DataProvider >

                    <div className={`flex h-screen max-w-screen ${font.className} overflow-hidden dark:bg-darkbackground`}>
                        <div className='h-screen flex-grow hidden xl:flex '>
                            <OrgSidebar />
                        </div>
                        <div className='flex  flex-col w-full h-screen '>
                            <div className='h-10'>
                                <TopNav />
                            </div>
                            <div className='h-full relative flex-1 p-2'>
                                <ScrollArea className='h-full relative flex-1 rounded-md  dark:bg-darkcontent border'>
                                    {children}
                                    <ScrollBar orientation="horizontal" />
                                </ScrollArea>
                            </div>
                        </div>
                    </div>

                </DataProvider>
            </QueryProvider>
        </WorkspaceProvider>
    )
}
