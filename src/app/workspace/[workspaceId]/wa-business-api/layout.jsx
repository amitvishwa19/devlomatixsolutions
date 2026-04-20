import { Inter } from "next/font/google";

const font = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "WA Business Manager"
};

export default async function WhatsAppLayout({ children }) {
    return (
        <div className={`flex w-full h-full ${font.className}`}>
            <div className='flex flex-col w-full h-full transition-all'>
                <div className='flex-1 h-full pt-0'>
                    <div className='absolute inset-0 flex-1 rounded h-full'>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
