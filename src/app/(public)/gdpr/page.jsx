'use client';
import { Navbar } from "../_components/Navbar";
import { Footer } from "../_components/Footer";
import { Shield, Lock, Eye, Trash2, Download, Bell, FileCheck, Server, Globe, Users, CheckCircle, ChevronRight, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const rights = [
  { icon: Eye, title: "Right to Access", desc: "Request a complete copy of all personal data we hold about you, delivered in a machine-readable format within 30 days." },
  { icon: Lock, title: "Right to Rectification", desc: "Correct any inaccurate or incomplete personal data. Update your information through account settings or by contacting us." },
  { icon: Trash2, title: "Right to Erasure", desc: "Request permanent deletion of your personal data from all our systems, including backups, within 90 days." },
  { icon: Download, title: "Right to Portability", desc: "Export your data in JSON or CSV format to transfer to another service provider at any time." },
  { icon: Bell, title: "Right to Object", desc: "Object to processing of your data for direct marketing, profiling, or any purpose not essential to service delivery." },
  { icon: Shield, title: "Right to Restrict", desc: "Request limitation of processing while we verify accuracy of data or assess an objection you've raised." },
];

const measures = [
  { icon: Lock, title: "Encryption", items: ["TLS 1.3 for all data in transit", "AES-256 encryption at rest", "End-to-end encrypted API keys"] },
  { icon: Server, title: "Infrastructure", items: ["SOC 2 Type II certified hosting", "EU data residency options", "24/7 intrusion detection"] },
  { icon: Users, title: "Access Control", items: ["Role-based access (RBAC)", "Multi-factor authentication", "Quarterly access reviews"] },
  { icon: FileCheck, title: "Compliance", items: ["Annual third-party audits", "Data Protection Impact Assessments", "Regular penetration testing"] },
];

const legalBasis = [
  { basis: "Consent", use: "Marketing emails, analytics cookies, optional data collection", how: "Opt-in checkboxes, cookie consent banner" },
  { basis: "Contract", use: "Account management, service delivery, billing", how: "Necessary to fulfill our service agreement with you" },
  { basis: "Legitimate Interest", use: "Security monitoring, fraud prevention, service improvement", how: "Balanced against your privacy rights with DPIA where needed" },
  { basis: "Legal Obligation", use: "Tax records, law enforcement requests, regulatory compliance", how: "Required by applicable Indian and international law" },
];

export default function GdprPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28 mesh-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Globe className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Data Protection</p>
            <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl lg:text-6xl">
              <span className="text-gradient-sun">GDPR</span> Compliance
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              KonnectX is fully committed to protecting your data rights under the General Data Protection Regulation. Privacy by design is built into everything we do.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {["GDPR Compliant", "Data Encryption", "EU Data Residency", "Regular Audits"].map((badge) => (
                <span key={badge} className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {badge}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Your Rights */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Know Your Rights</p>
            <h2 className="mt-2 text-3xl font-extrabold text-foreground">
              Your <span className="text-gradient-sun">Data Rights</span>
            </h2>
            <p className="mt-3 text-muted-foreground">Under GDPR, you have the following rights regarding your personal data.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rights.map((r, i) => (
              <motion.div key={r.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }} className="glass-card rounded-xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><r.icon className="h-6 w-6" /></div>
                <h3 className="mt-4 text-lg font-bold text-foreground">{r.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Basis */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Transparency</p>
            <h2 className="mt-2 text-3xl font-extrabold text-foreground">
              Legal <span className="text-gradient-sun">Basis</span> for Processing
            </h2>
            <p className="mt-3 text-muted-foreground">We always have a lawful reason for processing your data.</p>
          </div>
          <div className="mt-12 overflow-x-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card rounded-xl p-6 sm:p-8" style={{ boxShadow: "var(--shadow-card)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Legal Basis</th>
                    <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">What We Process</th>
                    <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">How It Applies</th>
                  </tr>
                </thead>
                <tbody>
                  {legalBasis.map((row) => (
                    <tr key={row.basis} className="border-b border-border/50 last:border-0">
                      <td className="py-3 pr-4 font-semibold text-primary whitespace-nowrap">{row.basis}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{row.use}</td>
                      <td className="py-3 text-muted-foreground">{row.how}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Security Measures */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Protection</p>
            <h2 className="mt-2 text-3xl font-extrabold text-foreground">
              Security <span className="text-gradient-sun">Measures</span>
            </h2>
            <p className="mt-3 text-muted-foreground">Technical and organizational measures we implement to protect your data.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {measures.map((m, i) => (
              <motion.div key={m.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }} className="glass-card rounded-xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><m.icon className="h-5 w-5" /></div>
                <h3 className="mt-3 font-bold text-foreground">{m.title}</h3>
                <ul className="mt-3 space-y-2">
                  {m.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Processing Agreement + Contact */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card rounded-xl p-6 sm:p-8" style={{ boxShadow: "var(--shadow-card)" }}>
            <h2 className="text-xl font-bold text-foreground">Data Processing Agreement (DPA)</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              KonnectX offers a Data Processing Agreement to all customers who process personal data of EU residents through our platform. Our DPA covers the scope of processing, sub-processor management, data breach notification procedures, and international data transfers. Contact us at konnectx@devlomatix.com to request a copy.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Sub-processor List", desc: "Transparent list of all data sub-processors" },
                { label: "Breach Notification", desc: "72-hour notification as required by GDPR" },
                { label: "Data Transfers", desc: "Standard Contractual Clauses (SCCs) in place" },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-border p-3">
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card rounded-xl p-6 sm:p-8 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
            <h3 className="text-xl font-bold text-foreground">Exercise Your Rights</h3>
            <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
              To exercise any of your GDPR rights, contact our Data Protection Officer. We will respond within 30 days as required by regulation.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-primary-foreground" style={{ background: "var(--gradient-sun)" }}>
                Contact DPO <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="mailto:konnectx@devlomatix.com" className="text-sm font-medium text-primary hover:underline">
                konnectx@devlomatix.com
              </a>
            </div>
          </motion.div>

          <div className="glass-card rounded-xl p-6 sm:p-8" style={{ boxShadow: "var(--shadow-card)" }}>
            <h3 className="text-lg font-bold text-foreground">Related Policies</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Cookie Policy", href: "/cookie-policy" },
              ].map((link) => (
                <Link key={link.label} href={link.href} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/50 hover:border-primary/30">
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
  );
}
