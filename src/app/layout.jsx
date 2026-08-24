import "@/css/globals.css";
import "@/css/custom.css";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
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
import { WorkspaceProvider } from "@/providers/WorkspaceProvider";
import CookieConsent from "@/components/global/CookieConsent";
import { VisitorTracker } from "@/components/global/VisitorTracker";
import { Suspense } from "react";

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-heading",
    weight: ["400", "500", "600", "700", "800"]
});

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
    weight: ["300", "400", "500", "600", "700"]
});

export const metadata = {
    title: {
        default: process.env.APP_NAME,
        template: `%s | ${process.env.APP_NAME}`
    },
    description: 'Devlomatix',
    icons: {
        icon: '/fevicon.ico?v=6',
        apple: '/fevicon.ico?v=6',
        shortcut: '/fevicon.ico?v=6'
    },
    manifest: '/site.webmanifest'
}

export default async function RootLayout({ children }) {

    return (
        <html lang="en" data-scroll-behavior="smooth">
            <body className={`${inter.className} ${plusJakartaSans.variable} ${inter.variable} antialiased`} suppressHydrationWarning={true}>
                <SessionWrapper>
                    {/* <SocketProvider> */}
                    <QueryProvider>
                        <AppProvider>
                            <AppThemeProvider>
                                <ThemeProvider>
                                    <AuthProvider>


                                        <WorkspaceProvider>
                                            <Providers>
                                                {/* <OrgModalProvider /> */}

                                                {children}
                                                <CookieConsent />
                                                <Suspense fallback={null}>
                                                    <VisitorTracker />
                                                </Suspense>

                                            </Providers>
                                        </WorkspaceProvider>


                                    </AuthProvider>
                                </ThemeProvider>
                            </AppThemeProvider>
                        </AppProvider>
                    </QueryProvider>
                    {/* </SocketProvider> */}
                </SessionWrapper>
                <Toaster position="top-right" className="dark:bg-sky-600" />

            </body>
        </html>
    );
}
