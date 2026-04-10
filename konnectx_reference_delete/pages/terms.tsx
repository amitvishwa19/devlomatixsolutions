import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ThemeProvider } from "@/hooks/use-theme";
import { FileText, CheckCircle, UserCheck, CreditCard, Server, Copyright, XCircle, Scale, AlertTriangle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of Service — KonnectX" },
      { name: "description", content: "KonnectX terms of service. Read our terms and conditions for using the WhatsApp Business API platform." },
      { property: "og:title", content: "Terms of Service — KonnectX" },
      { property: "og:description", content: "Terms and conditions for using the KonnectX platform." },
    ],
  }),
});

const sections = [
  { id: "acceptance", icon: CheckCircle, title: "Acceptance of Terms", content: [
    { subtitle: "Agreement", text: "By accessing, browsing, or using the KonnectX platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you are using KonnectX on behalf of an organization, you represent that you have the authority to bind that organization." },
    { subtitle: "Modifications", text: "We reserve the right to modify these terms at any time. Material changes will be notified via email or in-app notification at least 30 days before they take effect. Continued use after changes constitute acceptance." },
    { subtitle: "Eligibility", text: "You must be at least 18 years old and legally capable of entering into binding contracts. Businesses must be legally registered entities in their jurisdiction." },
  ]},
  { id: "services", icon: Server, title: "Use of Services", content: [
    { subtitle: "Permitted Use", text: "KonnectX may be used solely for lawful business communication via WhatsApp Business API. You agree to comply with WhatsApp Business Policy, Meta's Commerce Policy, and all applicable local and international laws." },
    { subtitle: "Prohibited Activities", text: "You must not: send spam or unsolicited messages; distribute malware or phishing content; impersonate other businesses; violate intellectual property rights; attempt to reverse-engineer our platform; use our API to build competing products; or exceed rate limits without authorization." },
    { subtitle: "API Usage", text: "API access is subject to rate limits defined by your plan tier. Exceeding limits may result in temporary throttling. Persistent abuse may lead to account suspension." },
    { subtitle: "Content Standards", text: "All messages sent through KonnectX must comply with WhatsApp's content guidelines. We reserve the right to review and remove content that violates these standards." },
  ]},
  { id: "account", icon: UserCheck, title: "Account Responsibilities", content: [
    { subtitle: "Account Security", text: "You are responsible for maintaining the confidentiality of your account credentials, including API keys and access tokens. Enable two-factor authentication for enhanced security." },
    { subtitle: "Unauthorized Access", text: "Notify us immediately at konnectx@devlomatix.com if you suspect unauthorized access to your account. KonnectX is not liable for losses resulting from unauthorized use that you failed to report promptly." },
    { subtitle: "Team Accounts", text: "Account administrators are responsible for managing team member permissions. You are liable for all activities conducted through sub-accounts and team member access." },
  ]},
  { id: "billing", icon: CreditCard, title: "Billing & Payments", content: [
    { subtitle: "Subscription Plans", text: "Paid plans are billed on a half-yearly cycle as selected during signup. All prices are listed in INR and are exclusive of applicable taxes (GST). The current plans are Lite (₹7,194/half-year), Professional (₹11,994/half-year), and Premium (₹20,994/half-year)." },
    { subtitle: "Payment Terms", text: "Payment is due at the beginning of each billing cycle. We accept major credit/debit cards and UPI. Failed payments will be retried up to 3 times over 7 days before service suspension." },
    { subtitle: "Refund Policy", text: "All fees are non-refundable except in cases of platform downtime exceeding our SLA commitments (99.9% uptime). Refund requests must be submitted within 15 days of the billing event." },
    { subtitle: "Price Changes", text: "We reserve the right to change pricing with a minimum of 30 days' notice. Existing subscriptions will be honored at the current rate until the end of the billing cycle." },
  ]},
  { id: "availability", icon: Server, title: "Service Availability & SLA", content: [
    { subtitle: "Uptime Commitment", text: "We strive for 99.9% platform uptime, measured on a monthly basis. This excludes scheduled maintenance windows and force majeure events." },
    { subtitle: "Scheduled Maintenance", text: "Planned maintenance will be communicated at least 48 hours in advance via email and in-app notifications. We schedule maintenance during off-peak hours (IST 2:00 AM – 6:00 AM) whenever possible." },
    { subtitle: "SLA Credits", text: "If monthly uptime falls below 99.9%, affected customers may request service credits: 99.0%–99.9% = 10% credit; 95.0%–99.0% = 25% credit; below 95.0% = 50% credit. Credits are applied to the next billing cycle." },
  ]},
  { id: "ip", icon: Copyright, title: "Intellectual Property", content: [
    { subtitle: "Our Property", text: "All content, trademarks, logos, software, and technology within KonnectX are owned by Devlomatix Technologies. The KonnectX name, logo, and branding are registered trademarks." },
    { subtitle: "Your Content", text: "You retain full ownership of all data, messages, media, and content you upload or transmit through the platform. By using our services, you grant us a limited license to process this content solely to provide the services." },
    { subtitle: "Feedback", text: "Any suggestions, ideas, or feedback you provide about KonnectX may be used by us without obligation or compensation to improve our services." },
  ]},
  { id: "liability", icon: AlertTriangle, title: "Limitation of Liability", content: [
    { subtitle: "Disclaimer", text: "KonnectX is provided 'as is' without warranties of any kind, express or implied. We do not guarantee that the service will be uninterrupted, error-free, or free of harmful components." },
    { subtitle: "Liability Cap", text: "Our total liability for any claims arising from or related to these terms or the services shall not exceed the total fees paid by you in the 12 months preceding the claim." },
    { subtitle: "Exclusions", text: "We are not liable for indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities, even if we have been advised of the possibility of such damages." },
  ]},
  { id: "termination", icon: XCircle, title: "Termination", content: [
    { subtitle: "By You", text: "You may cancel your account at any time through your account settings or by contacting support. Cancellation takes effect at the end of the current billing period." },
    { subtitle: "By Us", text: "We may suspend or terminate your account for violations of these terms, non-payment, suspected fraud, or activities harmful to other users. We will provide notice and an opportunity to cure where reasonable." },
    { subtitle: "Data After Termination", text: "Upon termination, your data will be available for export for 30 days. After this grace period, all data will be permanently and irreversibly deleted from our systems." },
  ]},
  { id: "governing", icon: Scale, title: "Governing Law & Disputes", content: [
    { subtitle: "Jurisdiction", text: "These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Vadodara, Gujarat, India." },
    { subtitle: "Dispute Resolution", text: "Before filing any legal claim, both parties agree to attempt resolution through good-faith negotiation for at least 30 days. Unresolved disputes may be submitted to mediation or arbitration." },
    { subtitle: "Contact", text: "For questions about these terms, contact us at konnectx@devlomatix.com or write to Devlomatix Technologies, Vadodara, Gujarat, India. Phone: +91-9712340115." },
  ]},
];

function TermsPage() {
  const [activeSection, setActiveSection] = useState("acceptance");

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Navbar />

        <section className="relative overflow-hidden py-20 sm:py-28 mesh-bg">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Legal</p>
              <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl lg:text-6xl">
                <span className="text-gradient-sun">Terms</span> of Service
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Clear, fair, and transparent terms that govern your use of KonnectX. We've kept the legal jargon to a minimum.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">Last updated: April 1, 2026 · Effective: April 1, 2026</p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-12">
              <aside className="hidden lg:block">
                <nav className="sticky top-24 space-y-1">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">On this page</p>
                  {sections.map((s) => (
                    <a key={s.id} href={`#${s.id}`} onClick={() => setActiveSection(s.id)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${activeSection === s.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
                      <s.icon className="h-4 w-4 shrink-0" />
                      {s.title}
                    </a>
                  ))}
                </nav>
              </aside>

              <div className="space-y-12">
                {sections.map((s, i) => (
                  <motion.section key={s.id} id={s.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="glass-card rounded-xl p-6 sm:p-8" style={{ boxShadow: "var(--shadow-card)" }}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <s.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground">{i + 1}. {s.title}</h2>
                    </div>
                    <div className="space-y-5">
                      {s.content.map((item) => (
                        <div key={item.subtitle}>
                          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <ChevronRight className="h-3.5 w-3.5 text-primary" />
                            {item.subtitle}
                          </h3>
                          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground pl-5.5">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </motion.section>
                ))}

                <div className="glass-card rounded-xl p-6 sm:p-8" style={{ boxShadow: "var(--shadow-card)" }}>
                  <h3 className="text-lg font-bold text-foreground">Related Policies</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {[
                      { label: "Privacy Policy", to: "/privacy-policy" as const },
                      { label: "Cookie Policy", to: "/cookie-policy" as const },
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
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </ThemeProvider>
  );
}
