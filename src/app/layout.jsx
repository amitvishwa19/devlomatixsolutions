import "@/css/globals.css";
import { Inter, Unbounded, Geist, Geist_Mono } from "next/font/google";
import SessionWrapper from "@/providers/SessionWrapper";
import { AppProvider } from "@/providers/AppProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { Providers } from "@/redux/provider";
import { Toaster } from "sonner";
import { OrgProvider } from "@/providers/OrgProvider";
import { SocketProvider } from "@/providers/SocketProvider";


const unbounded = Unbounded({ subsets: ["latin"] });
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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} `} suppressHydrationWarning={true}>
        <SessionWrapper>
          <SocketProvider>
            <AppProvider>
              <ThemeProvider>
                <AuthProvider>
                  <Providers>
                    {/* <OrgModalProvider /> */}
                    <OrgProvider>
                      {children}
                    </OrgProvider>
                  </Providers>
                </AuthProvider>
              </ThemeProvider>
            </AppProvider>
          </SocketProvider>
        </SessionWrapper>
        <Toaster position="top-right" className="dark:bg-sky-600" />
      </body>
    </html>
  );
}
