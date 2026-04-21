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
import { QueryProvider } from "@/providers/QueryProvider";
import { WorkspaceProvider } from "@/providers/WorkspaceProvider";
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



    return (
        <html lang="en" data-scroll-behavior="smooth">
            <body className={`${outfit.className} `} suppressHydrationWarning={true}>
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
