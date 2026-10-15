import { Inter } from "next/font/google";
import { KonnectxProvider } from "./_provider/KonnectxProvider";

const font = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "KonnectX WhatsApp Business Suite"
};

export default async function DashboardLayout({ children }) {
    return (
        <KonnectxProvider>
            {children}
        </KonnectxProvider>
    );
}