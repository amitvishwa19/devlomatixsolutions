import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ThemeProvider } from "@/hooks/use-theme";
import { Cookie, Shield, BarChart3, Settings, Globe, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/cookie-policy")({
  component: CookiePolicyPage,
  head: () => ({
    meta: [
      { title: "Cookie Policy — KonnectX" },
      { name: "description", content: "Learn how KonnectX uses cookies and similar technologies on our platform." },
      { property: "og:title", content: "Cookie Policy — KonnectX" },
      { property: "og:description", content: "How KonnectX uses cookies and tracking technologies." },
    ],
  }),
});

const cookieTypes = [
  {
    icon: Shield,
    name: "Essential Cookies",
    required: true,
    description: "Required for the platform to function properly. These cannot be disabled.",
    examples: [
      { cookie: "session_id", purpose: "Maintains your login session", duration: "Session" },
      { cookie: "csrf_token", purpose: "Protects against cross-site request forgery", duration: "Session" },
      { cookie: "auth_token", purpose: "Authenticates API requests", duration: "7 days" },
    ],
  },
  {
    icon: BarChart3,
    name: "Analytics Cookies",
    required: false,
    description: "Help us understand how you use our platform so we can improve it.",
    examples: [
      { cookie: "_ga", purpose: "Google Analytics — distinguishes unique users", duration: "2 years" },
      { cookie: "_gid", purpose: "Google Analytics — distinguishes unique users", duration: "24 hours" },
      { cookie: "amplitude_id", purpose: "Product analytics and feature usage tracking", duration: "1 year" },
    ],
  },
  {
    icon: Settings,
    name: "Preference Cookies",
    required: false,
    description: "Remember your settings like theme, language, and notification preferences.",
    examples: [
      { cookie: "theme", purpose: "Stores your light/dark mode preference", duration: "1 year" },
      { cookie: "locale", purpose: "Stores your language preference", duration: "1 year" },
      { cookie: "sidebar_state", purpose: "Remembers sidebar collapsed/expanded state", duration: "30 days" },
    ],
  },
  {
    icon: Globe,
    name: "Marketing Cookies",
    required: false,
    description: "Used to deliver relevant advertisements and track campaign effectiveness.",
    examples: [
      { cookie: "_fbp", purpose: "Facebook Pixel — ad targeting and measurement", duration: "3 months" },
      { cookie: "utm_source", purpose: "Tracks marketing campaign source", duration: "30 days" },
      { cookie: "referral_code", purpose: "Tracks referral program attribution", duration: "90 days" },
    ],
  },
];

function CookiePolicyPage() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Navbar />

        <section className="relative overflow-hidden py-20 sm:py-28 mesh-bg">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Cookie className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Transparency</p>
              <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl lg:text-6xl">
                <span className="text-gradient-sun">Cookie</span> Policy
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                We use cookies to make KonnectX work better for you. Here's exactly what we use, why we use it, and how you can control it.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">Last updated: April 1, 2026</p>
            </motion.div>
          </div>
        </section>

        {/* What Are Cookies */}
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card rounded-xl p-6 sm:p-8" style={{ boxShadow: "var(--shadow-card)" }}>
              <h2 className="text-xl font-bold text-foreground">What Are Cookies?</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Cookies are small text files stored on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites work efficiently, provide analytics information, and remember your preferences. KonnectX uses both first-party cookies (set by us) and third-party cookies (set by our partners).
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-semibold text-foreground">First-Party Cookies</p>
                  <p className="mt-1 text-xs text-muted-foreground">Set directly by KonnectX. Used for authentication, preferences, and core functionality.</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-semibold text-foreground">Third-Party Cookies</p>
                  <p className="mt-1 text-xs text-muted-foreground">Set by our analytics and advertising partners. Governed by their respective privacy policies.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Cookie Types */}
        <section className="pb-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-extrabold text-foreground mb-10">
              Cookies We <span className="text-gradient-sun">Use</span>
            </h2>
            <div className="space-y-8">
              {cookieTypes.map((type, i) => (
                <motion.div
                  key={type.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="glass-card rounded-xl p-6 sm:p-8"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <type.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{type.name}</h3>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                    <span className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${type.required ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {type.required ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {type.required ? "Required" : "Optional"}
                    </span>
                  </div>

                  {/* Cookie Table */}
                  <div className="mt-5 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left">
                          <th className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cookie</th>
                          <th className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Purpose</th>
                          <th className="pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {type.examples.map((ex) => (
                          <tr key={ex.cookie} className="border-b border-border/50 last:border-0">
                            <td className="py-2.5 pr-4 font-mono text-xs text-primary">{ex.cookie}</td>
                            <td className="py-2.5 pr-4 text-muted-foreground">{ex.purpose}</td>
                            <td className="py-2.5 text-muted-foreground whitespace-nowrap">{ex.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Managing Cookies & Contact */}
        <section className="pb-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card rounded-xl p-6 sm:p-8" style={{ boxShadow: "var(--shadow-card)" }}>
              <h2 className="text-xl font-bold text-foreground">Managing Your Cookie Preferences</h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>You have full control over cookies. Here's how to manage them:</p>
                <div className="space-y-3">
                  {[
                    { title: "Browser Settings", desc: "Most browsers allow you to block or delete cookies through their settings menu. Note that blocking essential cookies may prevent KonnectX from functioning properly." },
                    { title: "In-App Preferences", desc: "You can manage analytics and marketing cookie preferences in your KonnectX account settings under Privacy & Data." },
                    { title: "Opt-Out Links", desc: "For Google Analytics, visit tools.google.com/dlpage/gaoptout. For Facebook tracking, visit www.facebook.com/settings/?tab=ads." },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-2">
                      <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <span className="font-semibold text-foreground">{item.title}:</span> {item.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="glass-card rounded-xl p-6 sm:p-8" style={{ boxShadow: "var(--shadow-card)" }}>
              <h3 className="text-lg font-bold text-foreground">Questions?</h3>
              <p className="mt-2 text-sm text-muted-foreground">If you have questions about our use of cookies, contact us at konnectx@devlomatix.com or call +91-9712340115.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Privacy Policy", to: "/privacy-policy" as const },
                  { label: "Terms of Service", to: "/terms" as const },
                  { label: "GDPR Compliance", to: "/gdpr" as const },
                ].map((link) => (
                  <Link key={link.label} to={link.to} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/50 hover:border-primary/30">
                    {link.label}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </ThemeProvider>
  );
}
