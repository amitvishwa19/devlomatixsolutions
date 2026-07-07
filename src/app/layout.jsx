import "@/css/globals.css";
import { Inter, Unbounded, Geist, Geist_Mono, Outfit } from "next/font/google";
import SessionWrapper from "@/providers/SessionWrapper";
import { AppProvider } from "@/providers/AppProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { Providers } from "@/redux/provider";
import { Toaster } from "sonner";
//import { SocketProvider } from "@/providers/SocketProvider";
import { AppThemeProvider } from "@/hooks/useTheme";
import { authOptions } from "./api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { QueryProvider } from "@/providers/QueryProvider";
import { AccessProvider } from "@/providers/AccessProvider";
import CookieConsent from "@/components/global/CookieConsent";
import AnalyticsProvider from "@/providers/AnalyticsProvider";




const unbounded = Unbounded({ subsets: ["latin"] });
const outfit = Outfit({ subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"] });

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: {
        default: "Crystal Aura & Sacred Stones",
        template: `%s | Crystal Aura`
    },
    description: 'Authentic gemstones, healing crystals, and spiritual guidance for your journey.',
    icon: {
        icon: ['/fevicon.png?v=5'],
        apple: ['/fevicon.png?v=5'],
        shortcut: ['/fevicon.png?v=5']
    },
    manifest: '/site.webmanifest'
}

export default async function RootLayout({ children }) {



    return (
        <html lang="en" className="dark">
            <body className={`${outfit.className}`} suppressHydrationWarning={true}>
                <SessionWrapper>
                    <QueryProvider>
                        <AppProvider>
                            <AuthProvider>

                                <Providers>
                                    <AnalyticsProvider>

                                        {children}
                                        <CookieConsent />

                                    </AnalyticsProvider>
                                </Providers>

                            </AuthProvider>
                        </AppProvider>
                    </QueryProvider>
                </SessionWrapper>
                <Toaster position="top-right" />
            </body>
        </html>
    );
}
