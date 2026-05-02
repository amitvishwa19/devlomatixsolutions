import { Inter } from "next/font/google";

const font = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Whatsapp Manager"
};

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import { KonnectxProvider } from "./_provider/KonnectxProvider";
export default async function DashboardLayout({ children }) {
    return (
        <KonnectxProvider>
            <div className={`flex w-full h-full ${font.className}`}>
                <div className='flex flex-col w-full h-full transition-all'>
                    <div className='flex-1 h-full pt-0'>

                        <div className='absolute inset-0 flex-1 rounded h-full'>
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </KonnectxProvider>
    );


}