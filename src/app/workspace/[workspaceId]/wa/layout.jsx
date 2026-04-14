import { Inter } from "next/font/google";

const font = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Whatsapp Manager"
};

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import { waManager } from "@/app/workspace/[workspaceId]/wa/_lib/whatsapp";

export default async function DashboardLayout({ children }) {
    const session = await getServerSession(authOptions);

    if (session?.user?.userId) {
        // const status = waManager.getState();
        // if (status === 'welcome') {
        //     const auth = await db.whatsAppAuth.findUnique({
        //         where: { sessionId: session.user.userId }
        //     });

        //     if (auth && auth.credentials) {
        //         console.log("[WA Layout] Auto-connecting session for user:", session.user.userId);
        //         waManager.connect(session.user.userId);
        //     }
        // }
    }

    return (
        <div className={`flex w-full h-full ${font.className}`}>
            <div className='flex flex-col w-full h-full transition-all'>
                <div className='flex-1 h-full pt-0'>
                    <div className='absolute inset-0 flex-1 rounded h-full '>
                        {children}
                    </div>
                </div>
            </div>
        </div>);

}