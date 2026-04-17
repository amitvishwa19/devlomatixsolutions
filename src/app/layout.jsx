import "@/css/globals.css";
import "@/css/custom.css";
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
import { db } from "@/lib/db";
import { QueryProvider } from "@/providers/QueryProvider";
import { AccessProvider } from "@/providers/AccessProvider";
import { SettingProvider } from "@/providers/SettingProvider";
import CookieConsent from "@/components/global/CookieConsent";




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
        default: process.env.APP_NAME,
        template: `%s | ${process.env.APP_NAME}`
    },
    description: 'Devlomatix',
    icon: {
        icon: ['/fevicon.png?v=1'],
        apple: ['/fevicon.png?v=4'],
        shortcut: ['/fevicon.png?v=4']
    },
    manifest: '/site.webmanifest'
}

export default async function RootLayout({ children }) {
    const session = await getServerSession(authOptions);

    const user = session?.user ? await db.user.findUnique({
        where: { id: session.user.userId },
        include: {
            roles: {
                include: {
                    permissions: true,
                },
            },
            profile: true,
        },
    }) : null;

    return (
        <html lang="en" data-scroll-behavior="smooth">
            <body className={`${outfit.className} `} suppressHydrationWarning={true}>
                <SessionWrapper>
                    {/* <SocketProvider> */}
                    <QueryProvider>
                        <AppProvider>
                            <SettingProvider>
                                <AppThemeProvider>
                                    <ThemeProvider>
                                        <AuthProvider>

                                        <AccessProvider user={user}>
                                            <Providers>
                                                {/* <OrgModalProvider /> */}

                                                {children}
                                                <CookieConsent />

                                            </Providers>
                                        </AccessProvider>

                                    </AuthProvider>
                                </ThemeProvider>
                            </AppThemeProvider>
                            </SettingProvider>
                        </AppProvider>
                    </QueryProvider>
                    {/* </SocketProvider> */}
                </SessionWrapper>
                <Toaster position="top-right" className="dark:bg-sky-600" />
            </body>
        </html>
    );
}
