'use client'
import { motion } from "framer-motion";
import { useState } from "react";

import {
    FileText,
    Shield,
    Users,
    CreditCard,
    Scale,
    Clock,
    AlertTriangle,
    RefreshCw,
    Mail,
    ChevronRight,
    Check,
    Server,
    Gavel,
    ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const sections = [
    { id: "acceptance", title: "Acceptance of Terms", icon: FileText },
    { id: "description", title: "Description of Service", icon: Server },
    { id: "responsibilities", title: "User Responsibilities", icon: Users },
    { id: "security", title: "Data Security", icon: Shield },
    { id: "intellectual", title: "Intellectual Property", icon: ScrollText },
    { id: "payment", title: "Payment Terms", icon: CreditCard },
    { id: "liability", title: "Limitation of Liability", icon: AlertTriangle },
    { id: "availability", title: "Service Availability", icon: Clock },
    { id: "termination", title: "Termination", icon: RefreshCw },
    { id: "governing", title: "Governing Law", icon: Gavel },
    { id: "changes", title: "Changes to Terms", icon: Scale },
    { id: "contact", title: "Contact Information", icon: Mail },
];

const TermsOfService = () => {
    const [activeSection, setActiveSection] = useState("acceptance");

    const scrollToSection = (id) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <div className="min-h-screen bg-background w-full">

            <main className="">
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
                                <FileText className="w-8 h-8 text-primary" />
                            </div>
                            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
                                Terms of Service
                            </h1>
                            <p className="text-lg text-muted-foreground mb-6">
                                Please read these terms carefully before using CareWell Hospital Management System
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Last updated: January 23, 2026
                                </span>
                                <span className="hidden md:inline">•</span>
                                <span className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Version 2.1
                                </span>
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
                                        <Link href="/privacy">
                                            <Button variant="outline" size="sm" className="w-full gap-2">
                                                <Shield className="w-4 h-4" />
                                                Privacy Policy
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
                                    {/* Summary Card */}
                                    <div className="bg-primary/5 rounded-xl p-6 mb-10 border border-primary/10">
                                        <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                                            <Check className="w-5 h-5 text-primary" />
                                            Key Points Summary
                                        </h3>
                                        <ul className="grid md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                                            <li className="flex items-start gap-2">
                                                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                                You must be 18+ or an authorized healthcare provider
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                                Maintain confidentiality of your account credentials
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                                Comply with all healthcare data regulations
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                                Subscription fees are billed in advance
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Section 1 */}
                                    <section id="acceptance" className="mb-12 scroll-mt-24">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-primary" />
                                            </div>
                                            <h2 className="font-display text-2xl font-bold text-foreground">
                                                1. Acceptance of Terms
                                            </h2>
                                        </div>
                                        <div className="pl-13 space-y-4 text-muted-foreground leading-relaxed">
                                            <p>
                                                By accessing and using CareWell Hospital Management System ("Service"), you accept and agree to be bound by the terms and provisions of this agreement. These Terms of Service ("Terms") constitute a legally binding agreement between you and Devlomatix.
                                            </p>
                                            <p>
                                                If you are accepting these Terms on behalf of a company, organization, or other legal entity, you represent and warrant that you have the authority to bind such entity to these Terms. If you do not agree to these Terms, you must not access or use our Service.
                                            </p>
                                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-4">
                                                <p className="text-amber-700 dark:text-amber-400 text-sm">
                                                    <strong>Important:</strong> By using CareWell, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Section 2 */}
                                    <section id="description" className="mb-12 scroll-mt-24">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Server className="w-5 h-5 text-primary" />
                                            </div>
                                            <h2 className="font-display text-2xl font-bold text-foreground">
                                                2. Description of Service
                                            </h2>
                                        </div>
                                        <div className="pl-13 space-y-4 text-muted-foreground leading-relaxed">
                                            <p>
                                                CareWell provides a comprehensive cloud-based hospital management system that includes:
                                            </p>
                                            <div className="grid md:grid-cols-2 gap-3 my-4">
                                                {[
                                                    "Patient registration & management",
                                                    "OPD/IPD administration",
                                                    "Billing & invoicing",
                                                    "Pharmacy management",
                                                    "Pathology & radiology",
                                                    "Appointment scheduling",
                                                    "Reports & analytics",
                                                    "Mobile application access",
                                                ].map((item) => (
                                                    <div key={item} className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2">
                                                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                                        <span className="text-sm text-foreground">{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <p>
                                                The Service is provided "as is" and we reserve the right to modify, suspend, or discontinue any aspect of the Service at any time with reasonable notice.
                                            </p>
                                        </div>
                                    </section>

                                    {/* Section 3 */}
                                    <section id="responsibilities" className="mb-12 scroll-mt-24">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Users className="w-5 h-5 text-primary" />
                                            </div>
                                            <h2 className="font-display text-2xl font-bold text-foreground">
                                                3. User Responsibilities
                                            </h2>
                                        </div>
                                        <div className="pl-13 space-y-4 text-muted-foreground leading-relaxed">
                                            <p>As a user of our Service, you agree to:</p>
                                            <ul className="space-y-3">
                                                {[
                                                    "Provide accurate and complete information when registering for the Service",
                                                    "Maintain the confidentiality of your account credentials and notify us immediately of any unauthorized access",
                                                    "Use the Service only for lawful purposes and in compliance with all applicable healthcare regulations",
                                                    "Ensure all patient data entered is accurate and obtained with proper consent",
                                                    "Not share your account access with unauthorized individuals",
                                                    "Maintain appropriate security measures on devices accessing the Service",
                                                    "Comply with HIPAA, NABH, and other applicable healthcare data protection standards",
                                                ].map((item, index) => (
                                                    <li key={index} className="flex items-start gap-3">
                                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                                            {index + 1}
                                                        </span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </section>

                                    {/* Section 4 */}
                                    <section id="security" className="mb-12 scroll-mt-24">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Shield className="w-5 h-5 text-primary" />
                                            </div>
                                            <h2 className="font-display text-2xl font-bold text-foreground">
                                                4. Data Security and Privacy
                                            </h2>
                                        </div>
                                        <div className="pl-13 space-y-4 text-muted-foreground leading-relaxed">
                                            <p>
                                                We implement industry-standard security measures to protect your data. Our security infrastructure includes:
                                            </p>
                                            <div className="grid gap-4 my-4">
                                                {[
                                                    { title: "End-to-End Encryption", desc: "AES-256 encryption for data at rest, TLS 1.3 for data in transit" },
                                                    { title: "Access Control", desc: "Role-based permissions with multi-factor authentication" },
                                                    { title: "Audit Logging", desc: "Comprehensive logs of all system access and data modifications" },
                                                    { title: "Automated Backups", desc: "Daily encrypted backups with geo-redundant storage" },
                                                ].map((item) => (
                                                    <div key={item.title} className="bg-secondary/50 rounded-lg p-4">
                                                        <h4 className="font-medium text-foreground mb-1">{item.title}</h4>
                                                        <p className="text-sm">{item.desc}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <p>
                                                You acknowledge that you are responsible for ensuring your use of the Service complies with all applicable data protection laws. For complete details, please refer to our{" "}
                                                <Link href="/privacy" className="text-primary hover:underline">
                                                    Privacy Policy
                                                </Link>
                                                .
                                            </p>
                                        </div>
                                    </section>

                                    {/* Section 5 */}
                                    <section id="intellectual" className="mb-12 scroll-mt-24">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <ScrollText className="w-5 h-5 text-primary" />
                                            </div>
                                            <h2 className="font-display text-2xl font-bold text-foreground">
                                                5. Intellectual Property
                                            </h2>
                                        </div>
                                        <div className="pl-13 space-y-4 text-muted-foreground leading-relaxed">
                                            <p>
                                                The Service and its original content, features, and functionality are owned by Devlomatix and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                                            </p>
                                            <p>You may not:</p>
                                            <ul className="list-disc list-inside space-y-2 ml-4">
                                                <li>Copy, modify, or distribute any part of the Service without written consent</li>
                                                <li>Reverse engineer, decompile, or attempt to extract source code</li>
                                                <li>Remove or alter any proprietary notices or labels</li>
                                                <li>Use the CareWell name, logo, or branding without authorization</li>
                                            </ul>
                                            <p>
                                                You retain ownership of all data you input into the Service. By using the Service, you grant us a limited license to process and store your data solely for the purpose of providing the Service.
                                            </p>
                                        </div>
                                    </section>

                                    {/* Section 6 */}
                                    <section id="payment" className="mb-12 scroll-mt-24">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <CreditCard className="w-5 h-5 text-primary" />
                                            </div>
                                            <h2 className="font-display text-2xl font-bold text-foreground">
                                                6. Payment Terms
                                            </h2>
                                        </div>
                                        <div className="pl-13 space-y-4 text-muted-foreground leading-relaxed">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                                                    <thead className="bg-secondary">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left font-medium text-foreground">Term</th>
                                                            <th className="px-4 py-3 text-left font-medium text-foreground">Details</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border">
                                                        <tr>
                                                            <td className="px-4 py-3 font-medium text-foreground">Billing Cycle</td>
                                                            <td className="px-4 py-3">Monthly or annual, billed in advance</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-3 font-medium text-foreground">Payment Methods</td>
                                                            <td className="px-4 py-3">Credit card, bank transfer, UPI</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-3 font-medium text-foreground">Refund Policy</td>
                                                            <td className="px-4 py-3">Non-refundable except as required by law</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-3 font-medium text-foreground">Price Changes</td>
                                                            <td className="px-4 py-3">30 days advance notice required</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="px-4 py-3 font-medium text-foreground">Late Payment</td>
                                                            <td className="px-4 py-3">May result in service suspension</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Section 7 */}
                                    <section id="liability" className="mb-12 scroll-mt-24">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <AlertTriangle className="w-5 h-5 text-primary" />
                                            </div>
                                            <h2 className="font-display text-2xl font-bold text-foreground">
                                                7. Limitation of Liability
                                            </h2>
                                        </div>
                                        <div className="pl-13 space-y-4 text-muted-foreground leading-relaxed">
                                            <p>
                                                To the maximum extent permitted by applicable law, Devlomatix and its directors, employees, partners, agents, suppliers, or affiliates shall not be liable for:
                                            </p>
                                            <ul className="list-disc list-inside space-y-2 ml-4">
                                                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                                                <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
                                                <li>Damages resulting from unauthorized access to your data</li>
                                                <li>Damages resulting from interruption or cessation of service</li>
                                            </ul>
                                            <p>
                                                Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
                                            </p>
                                        </div>
                                    </section>

                                    {/* Section 8 */}
                                    <section id="availability" className="mb-12 scroll-mt-24">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-primary" />
                                            </div>
                                            <h2 className="font-display text-2xl font-bold text-foreground">
                                                8. Service Availability
                                            </h2>
                                        </div>
                                        <div className="pl-13 space-y-4 text-muted-foreground leading-relaxed">
                                            <p>
                                                We strive to maintain <strong className="text-foreground">99.9% uptime</strong> for our services. However, we do not guarantee uninterrupted access. Planned maintenance will be communicated at least 48 hours in advance whenever possible.
                                            </p>
                                            <p>
                                                We shall not be liable for service interruptions due to:
                                            </p>
                                            <ul className="list-disc list-inside space-y-2 ml-4">
                                                <li>Scheduled maintenance and system updates</li>
                                                <li>Force majeure events (natural disasters, war, pandemic)</li>
                                                <li>Third-party service provider outages</li>
                                                <li>Your internet connectivity or equipment issues</li>
                                            </ul>
                                        </div>
                                    </section>

                                    {/* Section 9 */}
                                    <section id="termination" className="mb-12 scroll-mt-24">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <RefreshCw className="w-5 h-5 text-primary" />
                                            </div>
                                            <h2 className="font-display text-2xl font-bold text-foreground">
                                                9. Termination
                                            </h2>
                                        </div>
                                        <div className="pl-13 space-y-4 text-muted-foreground leading-relaxed">
                                            <p>
                                                Either party may terminate this agreement:
                                            </p>
                                            <ul className="list-disc list-inside space-y-2 ml-4">
                                                <li><strong className="text-foreground">By you:</strong> Cancel anytime through your account settings or by contacting support</li>
                                                <li><strong className="text-foreground">By us:</strong> Immediately for breach of Terms, or with 30 days notice for any other reason</li>
                                            </ul>
                                            <p>Upon termination:</p>
                                            <ul className="list-disc list-inside space-y-2 ml-4">
                                                <li>Your access to the Service will cease immediately</li>
                                                <li>You may export your data within 30 days of termination</li>
                                                <li>We will securely delete your data within 90 days unless legally required to retain</li>
                                            </ul>
                                        </div>
                                    </section>

                                    {/* Section 10 */}
                                    <section id="governing" className="mb-12 scroll-mt-24">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Gavel className="w-5 h-5 text-primary" />
                                            </div>
                                            <h2 className="font-display text-2xl font-bold text-foreground">
                                                10. Governing Law
                                            </h2>
                                        </div>
                                        <div className="pl-13 space-y-4 text-muted-foreground leading-relaxed">
                                            <p>
                                                These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                                            </p>
                                            <p>
                                                Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts located in Vadodara, Gujarat, India.
                                            </p>
                                        </div>
                                    </section>

                                    {/* Section 11 */}
                                    <section id="changes" className="mb-12 scroll-mt-24">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Scale className="w-5 h-5 text-primary" />
                                            </div>
                                            <h2 className="font-display text-2xl font-bold text-foreground">
                                                11. Changes to Terms
                                            </h2>
                                        </div>
                                        <div className="pl-13 space-y-4 text-muted-foreground leading-relaxed">
                                            <p>
                                                We reserve the right to modify these Terms at any time. When we make material changes:
                                            </p>
                                            <ul className="list-disc list-inside space-y-2 ml-4">
                                                <li>We will notify you via email or in-app notification</li>
                                                <li>The updated Terms will be posted on this page</li>
                                                <li>The "Last updated" date will be revised</li>
                                            </ul>
                                            <p>
                                                Your continued use of the Service after changes constitutes acceptance of the updated Terms. If you disagree with the changes, you should discontinue use of the Service.
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
                                                12. Contact Information
                                            </h2>
                                        </div>
                                        <div className="pl-13 space-y-4 text-muted-foreground leading-relaxed">
                                            <p>
                                                If you have any questions about these Terms of Service, please contact us:
                                            </p>
                                            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
                                                <h4 className="font-display font-semibold text-foreground text-lg mb-4">
                                                    Devlomatix - Legal Team
                                                </h4>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground mb-1">Email</p>
                                                        <p className="font-medium text-foreground">legal@carewell.devlomatix.in</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground mb-1">Phone</p>
                                                        <p className="font-medium text-foreground">(+91) 9712340450</p>
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

export default TermsOfService;
