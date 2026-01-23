'use client'
import { motion } from "framer-motion";
import { useState } from "react";
import {
    Shield,
    Eye,
    Database,
    Lock,
    Share2,
    Clock,
    UserCheck,
    Cookie,
    Baby,
    Globe,
    RefreshCw,
    Mail,
    ChevronRight,
    Check,
    FileText,
    Server,
    AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const sections = [
    { id: "introduction", title: "Introduction", icon: Shield },
    { id: "collection", title: "Information We Collect", icon: Database },
    { id: "usage", title: "How We Use Your Data", icon: Eye },
    { id: "security", title: "Data Security", icon: Lock },
    { id: "sharing", title: "Data Sharing", icon: Share2 },
    { id: "retention", title: "Data Retention", icon: Clock },
    { id: "rights", title: "Your Rights", icon: UserCheck },
    { id: "cookies", title: "Cookies & Tracking", icon: Cookie },
    { id: "children", title: "Children's Privacy", icon: Baby },
    { id: "international", title: "International Transfers", icon: Globe },
    { id: "changes", title: "Policy Changes", icon: RefreshCw },
    { id: "contact", title: "Contact Us", icon: Mail },
];

const PrivacyPolicy = () => {
    const [activeSection, setActiveSection] = useState("introduction");

    const scrollToSection = (id) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <div className="min-h-screen bg-background w-full">

            <main className="pt-20 md:pt-24">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 to-background py-16 md:py-24">
                    <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                    <div className="container mx-auto px-4 md:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="max-w-3xl mx-auto text-center"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                                <Shield className="w-8 h-8 text-primary" />
                            </div>
                            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
                                Privacy Policy
                            </h1>
                            <p className="text-lg text-muted-foreground mb-6">
                                Your privacy is important to us. Learn how CareWell protects and handles your data.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Last updated: January 23, 2026
                                </span>
                                <span className="hidden md:inline">•</span>
                                <Badge variant="secondary" className="gap-1">
                                    <Lock className="w-3 h-3" />
                                    HIPAA Compliant
                                </Badge>
                                <Badge variant="secondary" className="gap-1">
                                    <Shield className="w-3 h-3" />
                                    ISO 27001
                                </Badge>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Quick Navigation + Content */}
                <section className="section-padding">
                    <div className="container mx-auto px-4 md:px-8">
                        <div className="grid lg:grid-cols-4 gap-8">
                            {/* Sidebar Navigation */}
                            <motion.aside
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                                className="lg:col-span-1"
                            >
                                <div className="sticky top-24 bg-card rounded-2xl border border-border p-6">
                                    <h3 className="font-display font-semibold text-foreground mb-4">
                                        Quick Navigation
                                    </h3>
                                    <nav className="space-y-1">
                                        {sections.map((section) => {
                                            const Icon = section.icon;
                                            return (
                                                <button
                                                    key={section.id}
                                                    onClick={() => scrollToSection(section.id)}
                                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${activeSection === section.id
                                                        ? "bg-primary/10 text-primary font-medium"
                                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                                        }`}
                                                >
                                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                                    <span className="truncate">{section.title}</span>
                                                </button>
                                            );
                                        })}
                                    </nav>
                                    <div className="mt-6 pt-6 border-t border-border">
                                        <Link href="/terms">
                                            <Button variant="outline" size="sm" className="w-full gap-2">
                                                <FileText className="w-4 h-4" />
                                                Terms of Service
                                                <ChevronRight className="w-4 h-4 ml-auto" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </motion.aside>

                            {/* Main Content */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="lg:col-span-3"
                            >
                                <div className="bg-card rounded-2xl border border-border p-6 md:p-10">
                                    {/* Privacy Commitment Card */}
                                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-6 mb-10 border border-green-500/20">
                                        <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                                            Our Privacy Commitment
                                        </h3>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                                    <Lock className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground text-sm">Encrypted</p>
                                                    <p className="text-xs text-muted-foreground">AES-256 & TLS 1.3</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                                    <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground text-sm">Transparent</p>
                                                    <p className="text-xs text-muted-foreground">Clear data practices</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                                    <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground text-sm">Your Control</p>
                                                    <p className="text-xs text-muted-foreground">Export & delete anytime</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 1 */}
                                    <section id="introduction" className="mb-12 scroll-mt-24">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Shield className="w-5 h-5 text-primary" />
                                            </div>
                                            <h2 className="font-display text-2xl font-bold text-foreground">
                                                1. Introduction
                                            </h2>
                                        </div>
                                        <div className="pl-13 space-y-4 text-muted-foreground leading-relaxed">
                                            <p>
                                                At CareWell by Devlomatix ("we", "our", or "us"), we are committed to protecting your privacy and ensuring the security of your personal and health information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Hospital Management System.
                                            </p>
                                            <p>
                                                This policy applies to all users of CareWell, including hospital administrators, healthcare providers, staff members, and any other individuals who access or use our services. By using CareWell, you consent to the data practices described in this policy.
                                            </p>
                                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
                                                <p className="text-blue-700 dark:text-blue-400 text-sm flex items-start gap-2">
                                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                                    <span>
                                                        <strong>Healthcare Data:</strong> As a healthcare software provider, we handle Protected Health Information (PHI) in accordance with HIPAA, NABH, and applicable Indian data protection regulations.
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Section 2 */}
                                    <section id="collection" className="mb-12 scroll-mt-24">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Database className="w-5 h-5 text-primary" />
                                            </div>
                                            <h2 className="font-display text-2xl font-bold text-foreground">
                                                2. Information We Collect
                                            </h2>
                                        </div>
                                        <div className="pl-13 space-y-6 text-muted-foreground leading-relaxed">
                                            {/* Personal Information */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                                                    <UserCheck className="w-5 h-5 text-primary" />
                                                    Personal Information
                                                </h3>
                                                <div className="grid md:grid-cols-2 gap-2">
                                                    {[
                                                        "Name and contact details",
                                                        "Email address and phone number",
                                                        "Organization and job title",
                                                        "Billing and payment information",
                                                        "Account credentials",
                                                        "Profile preferences",
                                                    ].map((item) => (
                                                        <div key={item} className="flex items-center gap-2 text-sm">
                                                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                                            <span>{item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Health Information */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                                                    <Shield className="w-5 h-5 text-red-500" />
                                                    Protected Health Information (PHI)
                                                </h3>
                                                <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                                                    <p className="text-sm mb-3">
                                                        PHI is handled with the highest level of security and only as directed by healthcare providers:
                                                    </p>
                                                    <div className="grid md:grid-cols-2 gap-2">
                                                        {[
                                                            "Patient medical records",
                                                            "Diagnostic and treatment data",
                                                            "Laboratory and imaging results",
                                                            "Prescription information",
                                                            "Health history",
                                                            "Insurance details",
                                                        ].map((item) => (
                                                            <div key={item} className="flex items-center gap-2 text-sm">
                                                                <Lock className="w-4 h-4 text-red-500 flex-shrink-0" />
                                                                <span>{item}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Technical Information */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                                                    <Server className="w-5 h-5 text-primary" />
                                                    Technical Information
                                                </h3>
                                                <div className="grid md:grid-cols-2 gap-2">
                                                    {[
                                                        "IP address and device info",
                                                        "Browser type and OS",
                                                        "Usage logs and access patterns",
                                                        "Cookies and session data",
                                                    ].map((item) => (
                                                        <div key={item} className="flex items-center gap-2 text-sm">
                                                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                                            <span>{item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Section 3 */}
                                    <section id="usage" className="mb-12 scroll-mt-24">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Eye className="w-5 h-5 text-primary" />
                                            </div>
                                            <h2 className="font-display text-2xl font-bold text-foreground">
                                                3. How We Use Your Information
                                            </h2>
                                        </div>
                                        <div className="pl-13 space-y-4 text-muted-foreground leading-relaxed">
                                            <p>We use your information for the following purposes:</p>
                                            <div className="grid gap-4 my-4">
                                                {[
                                                    { title: "Service Delivery", desc: "To provide, maintain, and improve our HMS platform", icon: Server },
                                                    { title: "Communication", desc: "To send updates, support responses, and important notices", icon: Mail },
                                                    { title: "Security", desc: "To detect, prevent, and address security threats and fraud", icon: Shield },
                                                    { title: "Analytics", desc: "To understand usage patterns and improve our features", icon: Eye },
                                                    { title: "Compliance", desc: "To meet legal, regulatory, and contractual obligations", icon: FileText },
                                                    { title: "Support", desc: "To provide customer service and technical assistance", icon: UserCheck },
                                                ].map((item) => {
                                                    const Icon = item.icon;
                                                    return (
                                                        <div key={item.title} className="flex items-start gap-4 bg-secondary/50 rounded-lg p-4">
                                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                                <Icon className="w-5 h-5 text-primary" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium text-foreground">{item.title}</h4>
                                                                <p className="text-sm">{item.desc}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </section>

                                    {/* Section 4 */}
                                    <section id="security" className="mb-12 scroll-mt-24">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Lock className="w-5 h-5 text-primary" />
                                            </div>
                                            <h2 className="font-display text-2xl font-bold text-foreground">
                                                4. Data Security
                                            </h2>
                                        </div>
                                        <div className="pl-13 space-y-4 text-muted-foreground leading-relaxed">
                                            <p>
                                                We implement comprehensive, industry-leading security measures to protect your data:
                                            </p>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                                                    <thead className="bg-secondary">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left font-medium text-foreground">Security Layer</th>
                                                            <th className="px-4 py-3 text-left font-medium text-foreground">Implementation</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border">
                                                        <tr>
                                                            <td className="px-4 py-3 font-medium text-foreground">Encryption at Rest</td>
                                                            <td className="px-4 py-3">AES-256 encryption for all stored data</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-3 font-medium text-foreground">Encryption in Transit</td>
                                                            <td className="px-4 py-3">TLS 1.3 for all data transfers</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-3 font-medium text-foreground">Access Control</td>
                                                            <td className="px-4 py-3">Role-based access with MFA support</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-3 font-medium text-foreground">Audit Logging</td>
                                                            <td className="px-4 py-3">Complete trails of all data access</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-3 font-medium text-foreground">Backups</td>
                                                            <td className="px-4 py-3">Daily encrypted, geo-redundant backups</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-3 font-medium text-foreground">Monitoring</td>
                                                            <td className="px-4 py-3">24/7 security monitoring and alerts</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Section 5 */}
                                    <section id="sharing" className="mb-12 scroll-mt-24">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Share2 className="w-5 h-5 text-primary" />
                                            </div>
                                            <h2 className="font-display text-2xl font-bold text-foreground">
                                                5. Data Sharing and Disclosure
                                            </h2>
                                        </div>
                                        <div className="pl-13 space-y-4 text-muted-foreground leading-relaxed">
                                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
                                                <p className="text-green-700 dark:text-green-400 font-medium flex items-center gap-2">
                                                    <Check className="w-5 h-5" />
                                                    We do NOT sell your personal information. Ever.
                                                </p>
                                            </div>
                                            <p>We may share your information only in these limited circumstances:</p>
                                            <div className="space-y-3 mt-4">
                                                {[
                                                    { title: "With Your Consent", desc: "When you explicitly authorize sharing" },
                                                    { title: "Service Providers", desc: "Trusted vendors who help operate our platform (under strict agreements)" },
                                                    { title: "Legal Requirements", desc: "When required by law, court order, or government authority" },
                                                    { title: "Business Transfers", desc: "In connection with a merger, acquisition, or sale (with notice)" },
                                                    { title: "Safety & Security", desc: "To protect rights, safety, and security of users" },
                                                ].map((item, index) => (
                                                    <div key={item.title} className="flex items-start gap-3">
                                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                                            {index + 1}
                                                        </span>
                                                        <div>
                                                            <span className="font-medium text-foreground">{item.title}:</span>{" "}
                                                            <span>{item.desc}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </section>

                                    {/* Section 6 */}
                                    <section id="retention" className="mb-12 scroll-mt-24">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-primary" />
                                            </div>
                                            <h2 className="font-display text-2xl font-bold text-foreground">
                                                6. Data Retention
                                            </h2>
                                        </div>
                                        <div className="pl-13 space-y-4 text-muted-foreground leading-relaxed">
                                            <p>
                                                We retain your information for as long as necessary to provide our services and fulfill the purposes outlined in this policy:
                                            </p>
                                            <div className="grid md:grid-cols-2 gap-4 my-4">
                                                <div className="bg-secondary/50 rounded-lg p-4">
                                                    <h4 className="font-medium text-foreground mb-2">Account Data</h4>
                                                    <p className="text-sm">Retained while account is active + 30 days after termination</p>
                                                </div>
                                                <div className="bg-secondary/50 rounded-lg p-4">
                                                    <h4 className="font-medium text-foreground mb-2">Health Records</h4>
                                                    <p className="text-sm">Per applicable healthcare regulations (typically 7+ years)</p>
                                                </div>
                                                <div className="bg-secondary/50 rounded-lg p-4">
                                                    <h4 className="font-medium text-foreground mb-2">Billing Records</h4>
                                                    <p className="text-sm">7 years for tax and audit compliance</p>
                                                </div>
                                                <div className="bg-secondary/50 rounded-lg p-4">
                                                    <h4 className="font-medium text-foreground mb-2">Audit Logs</h4>
                                                    <p className="text-sm">Minimum 3 years for security compliance</p>
                                                </div>
                                            </div>
                                            <p>
                                                Upon termination, you may request data export within 30 days. We securely delete data within 90 days unless legally required to retain.
                                            </p>
                                        </div>
                                    </section>

                                    {/* Section 7 */}
                                    <section id="rights" className="mb-12 scroll-mt-24">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <UserCheck className="w-5 h-5 text-primary" />
                                            </div>
                                            <h2 className="font-display text-2xl font-bold text-foreground">
                                                7. Your Rights
                                            </h2>
                                        </div>
                                        <div className="pl-13 space-y-4 text-muted-foreground leading-relaxed">
                                            <p>You have the following rights regarding your personal information:</p>
                                            <div className="grid md:grid-cols-2 gap-4 my-4">
                                                {[
                                                    { title: "Access", desc: "Request a copy of your personal data", icon: Eye },
                                                    { title: "Correction", desc: "Request correction of inaccurate data", icon: RefreshCw },
                                                    { title: "Deletion", desc: "Request deletion (subject to legal requirements)", icon: Database },
                                                    { title: "Portability", desc: "Export your data in machine-readable format", icon: Share2 },
                                                    { title: "Objection", desc: "Object to certain processing activities", icon: AlertCircle },
                                                    { title: "Withdrawal", desc: "Withdraw consent at any time", icon: UserCheck },
                                                ].map((item) => {
                                                    const Icon = item.icon;
                                                    return (
                                                        <div key={item.title} className="flex items-start gap-3 bg-secondary/50 rounded-lg p-4">
                                                            <Icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                                            <div>
                                                                <h4 className="font-medium text-foreground">{item.title}</h4>
                                                                <p className="text-sm">{item.desc}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <p>
                                                To exercise these rights, contact us at{" "}
                                                <a href="mailto:privacy@carewell.devlomatix.in" className="text-primary hover:underline">
                                                    privacy@carewell.devlomatix.in
                                                </a>
                                                . We will respond within 30 days.
                                            </p>
                                        </div>
                                    </section>

                                    {/* Section 8 */}
                                    <section id="cookies" className="mb-12 scroll-mt-24">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Cookie className="w-5 h-5 text-primary" />
                                            </div>
                                            <h2 className="font-display text-2xl font-bold text-foreground">
                                                8. Cookies and Tracking
                                            </h2>
                                        </div>
                                        <div className="pl-13 space-y-4 text-muted-foreground leading-relaxed">
                                            <p>We use cookies and similar technologies for:</p>
                                            <div className="grid gap-3 my-4">
                                                {[
                                                    { type: "Essential", desc: "Required for authentication and security", required: true },
                                                    { type: "Functional", desc: "Remember your preferences and settings", required: false },
                                                    { type: "Analytics", desc: "Understand usage patterns to improve service", required: false },
                                                ].map((cookie) => (
                                                    <div key={cookie.type} className="flex items-center justify-between bg-secondary/50 rounded-lg p-4">
                                                        <div>
                                                            <h4 className="font-medium text-foreground">{cookie.type} Cookies</h4>
                                                            <p className="text-sm">{cookie.desc}</p>
                                                        </div>
                                                        <Badge variant={cookie.required ? "default" : "secondary"}>
                                                            {cookie.required ? "Required" : "Optional"}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                            <p>
                                                You can control cookies through your browser settings. Disabling essential cookies may affect service functionality.
                                            </p>
                                        </div>
                                    </section>

                                    {/* Section 9 */}
                                    <section id="children" className="mb-12 scroll-mt-24">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Baby className="w-5 h-5 text-primary" />
                                            </div>
                                            <h2 className="font-display text-2xl font-bold text-foreground">
                                                9. Children's Privacy
                                            </h2>
                                        </div>
                                        <div className="pl-13 space-y-4 text-muted-foreground leading-relaxed">
                                            <p>
                                                Our Service is not intended for individuals under 18 unless used by authorized healthcare providers managing pediatric patient records. In such cases:
                                            </p>
                                            <ul className="list-disc list-inside space-y-2 ml-4">
                                                <li>Data is entered and managed by authorized healthcare staff</li>
                                                <li>Parental/guardian consent must be obtained as required by law</li>
                                                <li>All pediatric data receives the same protection as adult PHI</li>
                                            </ul>
                                        </div>
                                    </section>

                                    {/* Section 10 */}
                                    <section id="international" className="mb-12 scroll-mt-24">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Globe className="w-5 h-5 text-primary" />
                                            </div>
                                            <h2 className="font-display text-2xl font-bold text-foreground">
                                                10. International Data Transfers
                                            </h2>
                                        </div>
                                        <div className="pl-13 space-y-4 text-muted-foreground leading-relaxed">
                                            <p>
                                                Your data is primarily stored in India. If transferred internationally, we ensure:
                                            </p>
                                            <ul className="list-disc list-inside space-y-2 ml-4">
                                                <li>Appropriate safeguards per applicable data protection laws</li>
                                                <li>Standard contractual clauses with receiving parties</li>
                                                <li>Same level of protection as required in your jurisdiction</li>
                                            </ul>
                                        </div>
                                    </section>

                                    {/* Section 11 */}
                                    <section id="changes" className="mb-12 scroll-mt-24">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <RefreshCw className="w-5 h-5 text-primary" />
                                            </div>
                                            <h2 className="font-display text-2xl font-bold text-foreground">
                                                11. Changes to This Policy
                                            </h2>
                                        </div>
                                        <div className="pl-13 space-y-4 text-muted-foreground leading-relaxed">
                                            <p>
                                                We may update this Privacy Policy from time to time. When we make material changes:
                                            </p>
                                            <ul className="list-disc list-inside space-y-2 ml-4">
                                                <li>We will notify you via email and/or in-app notification</li>
                                                <li>The updated policy will be posted on this page</li>
                                                <li>The "Last updated" date will be revised</li>
                                            </ul>
                                            <p>
                                                We encourage you to review this policy periodically. Continued use after changes constitutes acceptance.
                                            </p>
                                        </div>
                                    </section>

                                    {/* Section 12 */}
                                    <section id="contact" className="scroll-mt-24">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Mail className="w-5 h-5 text-primary" />
                                            </div>
                                            <h2 className="font-display text-2xl font-bold text-foreground">
                                                12. Contact Us
                                            </h2>
                                        </div>
                                        <div className="pl-13 space-y-4 text-muted-foreground leading-relaxed">
                                            <p>
                                                If you have questions about this Privacy Policy or our data practices, please contact us:
                                            </p>
                                            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
                                                <h4 className="font-display font-semibold text-foreground text-lg mb-4">
                                                    Devlomatix - Data Protection Team
                                                </h4>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground mb-1">Privacy Inquiries</p>
                                                        <p className="font-medium text-foreground">privacy@carewell.devlomatix.in</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground mb-1">Data Protection Officer</p>
                                                        <p className="font-medium text-foreground">dpo@carewell.devlomatix.in</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground mb-1">Phone</p>
                                                        <p className="font-medium text-foreground">(+91) 9712340450</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground mb-1">Response Time</p>
                                                        <p className="font-medium text-foreground">Within 30 days</p>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <p className="text-sm text-muted-foreground mb-1">Address</p>
                                                        <p className="font-medium text-foreground">
                                                            Devlomatix Technologies Pvt. Ltd.<br />
                                                            Vadodara, Gujarat 390001, India
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </main>

        </div>
    );
};

export default PrivacyPolicy;
