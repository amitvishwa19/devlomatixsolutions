'use client';
import { Navbar } from "../_components/Navbar";
import { Footer } from "../_components/Footer";
import { Shield, Eye, Database, Share2, Lock, Clock, UserCheck, Mail, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

const sections = [
  { id: "collect", icon: Database, title: "Information We Collect", content: [
    { subtitle: "Personal Information", text: "When you create an account, we collect your name, email address, phone number, company name, and billing details. This information is necessary to provide our services and communicate with you." },
    { subtitle: "Usage Data", text: "We automatically collect information about how you interact with our platform, including IP address, browser type and version, operating system, pages visited, time spent on pages, click patterns, and referring URLs." },
    { subtitle: "Device Information", text: "We collect device identifiers, screen resolution, language preferences, and timezone to optimize your experience across devices." },
    { subtitle: "WhatsApp Business Data", text: "When you connect your WhatsApp Business account, we process message metadata, delivery reports, and conversation analytics as required to provide our services." },
  ]},
  { id: "use", icon: Eye, title: "How We Use Your Information", content: [
    { subtitle: "Service Delivery", text: "To provide, maintain, and improve our WhatsApp Business API platform, process your transactions, and deliver customer support." },
    { subtitle: "Communication", text: "To send service-related notifications, security alerts, billing updates, and occasional product announcements (which you can opt out of at any time)." },
    { subtitle: "Analytics & Improvement", text: "To analyze usage patterns, monitor platform performance, conduct A/B testing, and develop new features based on aggregated, anonymized data." },
    { subtitle: "Legal Compliance", text: "To comply with legal obligations, respond to lawful requests from authorities, and enforce our terms of service." },
  ]},
  { id: "sharing", icon: Share2, title: "Data Sharing & Third Parties", content: [
    { subtitle: "We Never Sell Your Data", text: "KonnectX does not sell, rent, or trade your personal information to any third party for marketing purposes. Period." },
    { subtitle: "Service Providers", text: "We share data with trusted service providers who assist in operating our platform — including cloud hosting (encrypted at rest), payment processing (PCI DSS compliant), and analytics services — under strict data processing agreements." },
    { subtitle: "Legal Requirements", text: "We may disclose information when required by law, court order, or governmental regulation, or when necessary to protect our rights, safety, or property." },
    { subtitle: "Business Transfers", text: "In the event of a merger, acquisition, or sale of assets, your data may be transferred. We will notify you before your data is subject to a different privacy policy." },
  ]},
  { id: "security", icon: Lock, title: "Data Security", content: [
    { subtitle: "Encryption", text: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. API keys and secrets are stored using industry-standard vault systems." },
    { subtitle: "Access Controls", text: "We implement role-based access controls (RBAC), multi-factor authentication for admin access, and regular access reviews. Only authorized personnel can access personal data." },
    { subtitle: "Infrastructure", text: "Our infrastructure is hosted on SOC 2 Type II certified cloud providers with 24/7 monitoring, intrusion detection systems, and automated threat response." },
    { subtitle: "Audits", text: "We conduct regular security audits, penetration testing, and vulnerability assessments. Our security practices are reviewed annually by independent third parties." },
  ]},
  { id: "retention", icon: Clock, title: "Data Retention", content: [
    { subtitle: "Active Accounts", text: "We retain your personal data for as long as your account is active and as needed to provide our services. Message data is retained according to your plan's retention settings." },
    { subtitle: "After Account Closure", text: "Upon account termination, we retain your data for 30 days to allow for reactivation. After this period, data is permanently and irreversibly deleted from all systems, including backups within 90 days." },
    { subtitle: "Legal Obligations", text: "Certain data may be retained longer when required by law (e.g., billing records for tax purposes are kept for 7 years)." },
  ]},
  { id: "rights", icon: UserCheck, title: "Your Rights", content: [
    { subtitle: "Access & Portability", text: "You have the right to request a copy of all personal data we hold about you in a machine-readable format (JSON or CSV) at any time." },
    { subtitle: "Correction & Deletion", text: "You can update your information through your account settings or request corrections. You may also request complete deletion of your personal data ('right to be forgotten')." },
    { subtitle: "Opt-Out", text: "You may opt out of marketing communications at any time via the unsubscribe link in emails or through your notification preferences. This does not affect service-related communications." },
    { subtitle: "Restriction & Objection", text: "You have the right to restrict or object to certain processing activities, including automated decision-making and profiling." },
  ]},
  { id: "contact", icon: Mail, title: "Contact Us", content: [
    { subtitle: "Data Protection Officer", text: "For any privacy-related inquiries, data access requests, or complaints, contact our Data Protection Officer at konnectx@devlomatix.com." },
    { subtitle: "Response Time", text: "We aim to respond to all privacy requests within 15 business days. Complex requests may take up to 30 days, and we will keep you informed of any delays." },
    { subtitle: "Office Address", text: "KonnectX by Devlomatix Technologies, Vadodara, Gujarat, India. Phone: +91-9712340115." },
  ]},
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("collect");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28 mesh-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Your Privacy Matters</p>
            <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl lg:text-6xl">
              <span className="text-gradient-sun">Privacy</span> Policy
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              We believe in transparency. This policy explains exactly how we collect, use, and protect your data — no legal jargon, just clear language.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">Last updated: April 1, 2026 · Effective: April 1, 2026</p>
          </motion.div>
        </div>
      </section>

      {/* Content with Sidebar */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-12">
            {/* Sidebar TOC */}
            <aside className="hidden lg:block">
              <nav className="sticky top-24 space-y-1">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">On this page</p>
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={() => setActiveSection(s.id)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                      activeSection === s.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <s.icon className="h-4 w-4 shrink-0" />
                    {s.title}
                  </a>
                ))}
              </nav>
            </aside>

            {/* Main Content */}
            <div className="space-y-12">
              {sections.map((s, i) => (
                <motion.section
                  key={s.id}
                  id={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className="glass-card rounded-xl p-6 sm:p-8"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
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

              {/* Related Links */}
              <div className="glass-card rounded-xl p-6 sm:p-8" style={{ boxShadow: "var(--shadow-card)" }}>
                <h3 className="text-lg font-bold text-foreground">Related Policies</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Terms of Service", href: "/terms" },
                    { label: "Cookie Policy", href: "/cookie-policy" },
                    { label: "GDPR Compliance", href: "/gdpr" },
                  ].map((link) => (
                    <Link key={link.label} href={link.href} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/50 hover:border-primary/30">
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
  );
}
