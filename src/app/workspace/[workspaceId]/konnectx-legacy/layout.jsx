import { Inter } from "next/font/google";
import KonnectSubNav from "./_components/KonnectSubNav";

const font = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Konnect Legacy WhatsApp Suite",
    description: "Multi-Device WhatsApp Automation, QR Connection, 2-Way Inbox, and Broadcast Campaigns"
};

export default async function KonnectLegacyLayout({ children, params }) {
    const resolvedParams = await params;
    const workspaceId = resolvedParams?.workspaceId;

    return (
        <div className={`w-full h-full flex flex-col bg-background ${font.className}`}>
            {workspaceId && <KonnectSubNav workspaceId={workspaceId} />}
            <div className="flex-1 w-full">
                {children}
            </div>
        </div>
    );
}
