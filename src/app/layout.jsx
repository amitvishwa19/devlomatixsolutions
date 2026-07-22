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
import { VisitorTracker } from "@/components/global/VisitorTracker";
import { Suspense } from "react";




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

                {/* DEBUG SCRIPT: Catching 'Unexpected token <' errors */}
                <script dangerouslySetInnerHTML={{
                    __html: `
                        window.addEventListener('unhandledrejection', function(event) {
                            if (event.reason instanceof SyntaxError && event.reason.message.includes('Unexpected token')) {
                                console.error('DETECTED JSON PARSE ERROR:', event.reason.message);
                                // Try to find if it came from a fetch
                                if (window.lastFetchUrl) {
                                    console.error('Likely culprit URL:', window.lastFetchUrl);
                                }
                            }
                        });
                        
                        // Monkey patch fetch to track the last URL (for debugging only)
                        const originalFetch = window.fetch;
                        window.fetch = function() {
                            window.lastFetchUrl = arguments[0];
                            return originalFetch.apply(this, arguments);
                        };
                    `
                }} />
            </body>
        </html>
    );
}
