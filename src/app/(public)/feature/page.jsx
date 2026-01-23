'use client';
import { motion } from "framer-motion";
import {
    Cloud, Database, Calendar, Users, Stethoscope, FileText,
    Building2, CreditCard, BarChart3, UserCog, ShieldCheck,
    MessageSquare, Pill, Package, Share2, FlaskConical, Scan,
    Smartphone, Bell, ClipboardList, Receipt
} from "lucide-react";

const allFeatures = [
    {
        category: "Auto Cloud Backup",
        description: "Secure your hospital data with automated cloud backup solutions",
        features: [
            { icon: Database, title: "Schedule Data Backup", description: "Set up automated backup schedules to ensure your data is always protected and recoverable." },
            { icon: Cloud, title: "Auto Daily Backup to Cloud", description: "Automatic daily backups to secure cloud storage with encryption and disaster recovery." },
        ]
    },
    {
        category: "Appointment Management",
        description: "Efficient scheduling and patient appointment workflows",
        features: [
            { icon: Calendar, title: "Schedule Appointments", description: "Easy-to-use appointment scheduling with calendar views and availability management." },
            { icon: Users, title: "Manage Patient Appointments", description: "Track, reschedule, and manage all patient appointments from a centralized dashboard." },
        ]
    },
    {
        category: "Patient Administration",
        description: "Complete patient lifecycle management from registration to discharge",
        features: [
            { icon: Users, title: "Patient Registration", description: "Quick and comprehensive patient registration with unique ID generation and demographic capture." },
            { icon: ClipboardList, title: "OPD New / Follow-up Case", description: "Manage outpatient cases including new registrations and follow-up visits efficiently." },
            { icon: Building2, title: "Indoor Admission", description: "Streamlined indoor patient admission with bed allocation and admission documentation." },
            { icon: Bell, title: "Birthday & Allergy Reminders", description: "Automated reminders for patient birthdays and critical allergy alerts for safety." },
        ]
    },
    {
        category: "Diagnosis & Treatment",
        description: "Detailed diagnosis sheets and treatment history for better patient care",
        features: [
            { icon: Stethoscope, title: "Detail Diagnosis Sheet", description: "Comprehensive diagnosis documentation for doctors with symptoms, findings, and recommendations." },
            { icon: FileText, title: "Previous Visits History", description: "Complete history of previous visits with treatment details for continuity of care." },
            { icon: ClipboardList, title: "Daily Treatment Order Sheet", description: "Daily treatment orders for indoor patients with medication and procedure tracking." },
        ]
    },
    {
        category: "Billing & Collection",
        description: "Comprehensive billing and payment collection system",
        features: [
            { icon: Receipt, title: "OPD Billing", description: "Quick outpatient billing with service charges, consultation fees, and instant receipts." },
            { icon: CreditCard, title: "Daily IPD Billing", description: "Daily billing for indoor patients including room charges, services, and consumables." },
            { icon: CreditCard, title: "Cash Collection by User", description: "Track cash collections by individual users with detailed reconciliation reports." },
        ]
    },
    {
        category: "User Management",
        description: "Secure user access control and comprehensive reporting",
        features: [
            { icon: UserCog, title: "User Rights & Restrictions", description: "Granular role-based access control with customizable permissions for each user." },
            { icon: BarChart3, title: "User Collection Report", description: "Detailed reports of collections made by each user for accountability and auditing." },
            { icon: ShieldCheck, title: "User Account Security", description: "Enhanced security features including password policies, session management, and audit logs." },
        ]
    },
    {
        category: "TPA & Company",
        description: "Manage insurance and corporate tie-ups efficiently",
        features: [
            { icon: Building2, title: "TPA Tie-up Management", description: "Manage multiple third-party administrator tie-ups with custom rate cards and approvals." },
            { icon: Building2, title: "Company Tie-ups", description: "Corporate tie-up management with employee verification and billing arrangements." },
            { icon: CreditCard, title: "Tie-up Based Billing", description: "Apply custom charges in billing as per individual TPA and company tie-up agreements." },
        ]
    },
    {
        category: "Marketing Tools",
        description: "Engage patients and doctors with custom communication tools",
        features: [
            { icon: MessageSquare, title: "Custom SMS/Mail Templates", description: "Create and manage custom SMS and email templates for various communication needs." },
            { icon: MessageSquare, title: "Camp SMS/Mails to Patients", description: "Send bulk promotional messages about health camps and special offers to patients." },
            { icon: MessageSquare, title: "SMS/Mails to Doctors", description: "Communicate with referring doctors about patient updates and hospital services." },
        ]
    },
    {
        category: "Reports",
        description: "Comprehensive reporting across all departments",
        features: [
            { icon: BarChart3, title: "OPD Reports", description: "Detailed outpatient department reports including patient visits, revenue, and doctor-wise analysis." },
            { icon: BarChart3, title: "IPD Reports", description: "Indoor patient reports covering admissions, discharges, bed occupancy, and revenue." },
            { icon: BarChart3, title: "Pharmacy Reports", description: "Pharmacy analytics including sales, stock movement, expiry tracking, and profit margins." },
        ]
    },
    {
        category: "Pharmacy",
        description: "Complete pharmacy management with GST compliance",
        features: [
            { icon: Pill, title: "Pharmacy Store & Stock", description: "Complete pharmacy inventory management with stock levels, reorder points, and batch tracking." },
            { icon: Receipt, title: "GST Tax Included", description: "GST-compliant billing with automatic tax calculations and proper invoice formatting." },
            { icon: Pill, title: "Expiry Return Management", description: "Track expiring medicines and manage returns to distributors efficiently." },
        ]
    },
    {
        category: "Central Store",
        description: "Centralized inventory and requisition management",
        features: [
            { icon: Package, title: "Central Store Management", description: "Manage central store inventory with stock tracking, minimum levels, and vendor management." },
            { icon: ClipboardList, title: "Requisition Management", description: "Handle department requisitions with approval workflows and stock allocation." },
        ]
    },
    {
        category: "Sharing Report",
        description: "Define and manage revenue sharing policies",
        features: [
            { icon: Share2, title: "Define Sharing Policy", description: "Set up sharing policies for doctors, departments, and referral partners with flexible rules." },
            { icon: BarChart3, title: "One-Click Sharing Reports", description: "Generate comprehensive sharing reports with a single click for quick settlements." },
        ]
    },
    {
        category: "Pathology",
        description: "Ready-to-use pathology database with extensive templates",
        features: [
            { icon: FlaskConical, title: "Readymade Database", description: "Pre-configured pathology database with common tests and parameters ready to use." },
            { icon: FileText, title: "500+ Reports", description: "Over 500 pre-built report templates covering all common pathology investigations." },
            { icon: ClipboardList, title: "1500+ Parameters", description: "Extensive parameter library with reference ranges and units for accurate reporting." },
        ]
    },
    {
        category: "Radiology",
        description: "Comprehensive radiology templates and reporting",
        features: [
            { icon: Scan, title: "Readymade Database", description: "Pre-configured radiology database with imaging modalities and report structures." },
            { icon: FileText, title: "500+ Templates", description: "Over 500 radiology report templates for X-ray, CT, MRI, and ultrasound studies." },
        ]
    },
    {
        category: "Mobile Application",
        description: "Access patient information on-the-go with our mobile app",
        features: [
            { icon: Smartphone, title: "IPD/OPD Patient List", description: "View and search patient lists for both outpatient and indoor departments on mobile." },
            { icon: Users, title: "Patient Personal Details", description: "Access complete patient demographic and contact information from anywhere." },
            { icon: CreditCard, title: "Billing Status", description: "Check patient billing status, pending amounts, and payment history on mobile." },
        ]
    },
];

const Features = () => {
    return (
        <div className="min-h-screen overflow-hidden w-full">
            <main className="pt-16 md:pt-20">
                {/* Hero Section */}
                <section className="py-20 md:py-28 bg-gradient-to-b from-primary/5 to-background">
                    <div className="container mx-auto px-4 md:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center max-w-4xl mx-auto"
                        >
                            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                                15+ Modules | 40+ Features
                            </span>
                            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                                Everything You Need to{" "}
                                <span className="text-primary">Run Your Hospital</span>
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                                Our comprehensive HMS solution covers every aspect of hospital operations,
                                from patient care to financial management and everything in between.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Features Grid by Category */}
                {allFeatures.map((category, categoryIndex) => (
                    <section
                        key={category.category}
                        className={`py-16 md:py-20 bg-card ${categoryIndex % 2 === 1 ? 'bg-secondary/30' : ''}`}
                    >
                        <div className="container mx-auto px-4 md:px-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="text-center mb-12"
                            >
                                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                                    {category.category}
                                </h2>
                                <p className="text-muted-foreground max-w-2xl mx-auto">
                                    {category.description}
                                </p>
                            </motion.div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {category.features.map((feature, index) => (
                                    <motion.div
                                        key={feature.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                            <feature.icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                ))}

                {/* CTA Section */}
                <section className="py-20 md:py-28 bg-gradient-to-br from-primary/10 via-background to-accent/10">
                    <div className="container mx-auto px-4 md:px-8 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                                Ready to Transform Your Hospital?
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                                Schedule a personalized demo and see how CareWell HMS can streamline your operations.
                            </p>
                            <a
                                href="/contact"
                                className="inline-flex items-center justify-center px-8 py-4 rounded-xl hero-gradient text-primary-foreground font-semibold shadow-glow hover:shadow-xl transition-all"
                            >
                                Request a Demo
                            </a>
                        </motion.div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Features;