'use client'

import React from 'react'
import heroDashboard from "@/assets/images/info-page/hero-dashboard.jpg";
import operationsFeature from "@/assets/images/info-page/operations-feature.jpg";
import patientFeature from "@/assets/images/info-page/patient-feature.jpg";
import inventoryFeature from "@/assets/images/info-page/inventory-feature.jpg";
import telemedicineFeature from "@/assets/images/info-page/telemedicine-feature.jpg";
import labFeature from "@/assets/images/info-page/lab-feature.jpg";
import {
    Calendar,
    Users,
    Stethoscope,
    Package,
    DollarSign,
    ClipboardList,
    Bell,
    LayoutDashboard,
    FileText,
    CreditCard,
    Settings,
    MessageSquare,
    Tags,
    Building,
    UserCog,
    Briefcase,
    HeartPulse,
    Activity,
    TrendingUp,
    ShieldCheck,
    Zap,
    Clock,
    ArrowRight,
    CheckCircle2,
    Play,
    Video,
    FlaskConical,
    Pill,
    BedDouble,
    Ambulance,
    Droplets,
    Scan,
    Smartphone,
    Globe,
    Lock,
    BarChart3,
    FileCheck,
    Wallet,
    Shield,
    Cloud,
    Database,
    Webhook,
    Mail,
    Phone,
    Receipt,
    ClipboardCheck,
    Syringe,
    Microscope,
    Radio,
    Building2,
    UserPlus,
    CalendarClock,
    MapPin,
    Layers
} from "lucide-react";
import Header from './_components/Header';
import StatCard from './_components/StatCard';
import FeatureCard from './_components/FeatureCard';
import AdvancedFeatureCard from './_components/AdvancedFeatureCard';
import CompactFeature from './_components/CompactFeature';
import ModuleItem from './_components/ModuleItem';
import IntegrationCard from './_components/IntegrationCard';
import UserRoleCard from './_components/UserRoleCard';
import BenefitItem from './_components/BenefitItem';
import PricingCard from './_components/PricingCard';
import { Button } from '@/components/ui/button';
import Footer from './_components/Footer';




export default function InfoPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-section" />
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6 animate-fade-up">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                <Zap className="w-4 h-4" />
                                Cloud-Based SaaS Platform
                            </div>

                            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                                Transform Your{" "}
                                <span className="text-gradient">Hospital Operations</span>
                            </h1>

                            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                                A centralized command-and-control dashboard for healthcare facilities.
                                Digitize operations, manage appointments, track revenue, and coordinate staff — all from one powerful platform.
                            </p>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <Button variant="hero" size="lg">
                                    Start Free Trial
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                                <Button variant="outline" size="lg">
                                    <Play className="w-5 h-5" />
                                    Watch Overview
                                </Button>
                            </div>

                            <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                    <span>No credit card required</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                    <span>14-day free trial</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative animate-fade-up" style={{ animationDelay: "200ms" }}>
                            <div className="relative rounded-2xl overflow-hidden shadow-elevated">
                                <img
                                    src={heroDashboard}
                                    alt="HMSPro Dashboard Interface showing appointments, schedules, revenue analytics and inventory management"
                                    className="w-full h-auto"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
                            </div>

                            <div className="absolute -bottom-4 -left-4 bg-card rounded-xl p-4 shadow-card border border-border/50 animate-float">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Activity className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Revenue Growth</p>
                                        <p className="font-display font-bold text-foreground">+27.5%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -top-4 -right-4 bg-card rounded-xl p-4 shadow-card border border-border/50 animate-float" style={{ animationDelay: "1s" }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-accent" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Today's Patients</p>
                                        <p className="font-display font-bold text-foreground">142</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-card border-y border-border/50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <StatCard value="500+" label="Hospitals Trust Us" delay={0} />
                        <StatCard value="2M+" label="Patients Managed" delay={100} />
                        <StatCard value="99.9%" label="Uptime Guarantee" delay={200} />
                        <StatCard value="24/7" label="Support Available" delay={300} />
                    </div>
                </div>
            </section>

            {/* Core Features Section */}
            <section id="features" className="py-20 md:py-28">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-primary font-medium text-sm uppercase tracking-wider">Core Functional Areas</span>
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
                            Everything You Need to Run Your Hospital
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            From patient management to inventory tracking, our comprehensive suite covers every aspect of hospital operations.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={ClipboardList}
                            title="Operations Management"
                            description="Streamline daily hospital operations with intelligent task management and coordination tools."
                            items={[
                                "Today's appointments overview",
                                "Priority-based task management",
                                "Staff meetings coordination",
                                "Emergency handling alerts"
                            ]}
                            delay={0}
                        />

                        <FeatureCard
                            icon={Users}
                            title="Patient Management"
                            description="Comprehensive patient-centric workflow management for seamless care delivery."
                            items={[
                                "Appointment scheduling & tracking",
                                "Consultation management",
                                "Status tracking (Scheduled/Pending)",
                                "Patient history access"
                            ]}
                            delay={100}
                        />

                        <FeatureCard
                            icon={Stethoscope}
                            title="Doctor Management"
                            description="Complete visibility into doctor availability and consultation management."
                            items={[
                                "Active doctors dashboard",
                                "Leave management",
                                "Availability overview",
                                "Consultation tracking"
                            ]}
                            delay={200}
                        />

                        <FeatureCard
                            icon={Package}
                            title="Inventory Management"
                            description="Real-time tracking of medical consumables and equipment."
                            items={[
                                "Medical supplies tracking",
                                "Stock level monitoring",
                                "Automated reorder alerts",
                                "Equipment maintenance logs"
                            ]}
                            delay={300}
                        />

                        <FeatureCard
                            icon={DollarSign}
                            title="Revenue & Finance"
                            description="Complete financial visibility with real-time revenue tracking and reporting."
                            items={[
                                "Daily/monthly revenue overview",
                                "Revenue growth analytics",
                                "Invoice management",
                                "Payment processing"
                            ]}
                            delay={400}
                        />

                        <FeatureCard
                            icon={Bell}
                            title="Alerts & Notifications"
                            description="Stay informed with intelligent alerts for critical updates and emergencies."
                            items={[
                                "Emergency notifications",
                                "Stock-out warnings",
                                "Appointment reminders",
                                "Staff alerts"
                            ]}
                            delay={500}
                        />
                    </div>
                </div>
            </section>

            {/* Advanced SaaS Features Section */}
            <section className="py-20 bg-gradient-section">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-primary font-medium text-sm uppercase tracking-wider">Advanced Modules</span>
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
                            Enterprise-Grade Healthcare Solutions
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Modern SaaS capabilities designed for hospitals of all sizes — from clinics to multi-chain healthcare systems.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AdvancedFeatureCard
                            icon={Video}
                            title="Telemedicine & Video Consultations"
                            description="Enable remote patient care with integrated video consultation platform."
                            features={[
                                "HD video calls with screen sharing",
                                "Virtual waiting room",
                                "E-prescription during calls",
                                "Recording & transcription",
                                "Multi-party consultations"
                            ]}
                            gradient="teal"
                        />

                        <AdvancedFeatureCard
                            icon={FlaskConical}
                            title="Laboratory Information System"
                            description="Complete lab management from sample collection to report delivery."
                            features={[
                                "Sample tracking & barcoding",
                                "Test catalog management",
                                "Auto-generated reports",
                                "Integration with analyzers",
                                "Critical value alerts"
                            ]}
                            gradient="blue"
                        />

                        <AdvancedFeatureCard
                            icon={Pill}
                            title="Pharmacy Management"
                            description="End-to-end pharmacy operations with inventory and dispensing."
                            features={[
                                "Drug inventory tracking",
                                "Expiry management",
                                "Prescription verification",
                                "Drug interaction alerts",
                                "Supplier management"
                            ]}
                            gradient="green"
                        />

                        <AdvancedFeatureCard
                            icon={BedDouble}
                            title="Bed & Ward Management"
                            description="Real-time visibility into bed availability and patient allocation."
                            features={[
                                "Visual bed occupancy map",
                                "Ward-wise allocation",
                                "Transfer management",
                                "Housekeeping integration",
                                "ICU/CCU monitoring"
                            ]}
                            gradient="coral"
                        />

                        <AdvancedFeatureCard
                            icon={FileCheck}
                            title="Electronic Medical Records (EMR)"
                            description="Comprehensive digital patient records with complete medical history."
                            features={[
                                "Complete patient history",
                                "Clinical documentation",
                                "Image & document storage",
                                "E-signatures",
                                "ICD-10 coding"
                            ]}
                            gradient="purple"
                        />

                        <AdvancedFeatureCard
                            icon={Receipt}
                            title="Billing & Insurance Claims"
                            description="Streamlined billing with insurance claim processing and TPA integration."
                            features={[
                                "Multi-payer billing",
                                "Insurance pre-authorization",
                                "Claim submission & tracking",
                                "Denial management",
                                "Revenue cycle analytics"
                            ]}
                            gradient="teal"
                        />

                        <AdvancedFeatureCard
                            icon={Ambulance}
                            title="Emergency & Ambulance"
                            description="Manage emergency services with GPS tracking and dispatch."
                            features={[
                                "Real-time ambulance tracking",
                                "Dispatch management",
                                "Emergency triage",
                                "First responder coordination",
                                "Route optimization"
                            ]}
                            gradient="coral"
                        />

                        <AdvancedFeatureCard
                            icon={Droplets}
                            title="Blood Bank Management"
                            description="Complete blood inventory and transfusion management system."
                            features={[
                                "Blood unit tracking",
                                "Donor management",
                                "Cross-match verification",
                                "Expiry alerts",
                                "Transfusion records"
                            ]}
                            gradient="coral"
                        />

                        <AdvancedFeatureCard
                            icon={Scan}
                            title="Radiology & Imaging (RIS/PACS)"
                            description="Manage radiology workflows with DICOM image storage."
                            features={[
                                "DICOM image viewing",
                                "Radiology worklist",
                                "Report templates",
                                "Image sharing",
                                "AI-assisted diagnosis"
                            ]}
                            gradient="blue"
                        />
                    </div>
                </div>
            </section>

            {/* Telemedicine Showcase */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <span className="text-primary font-medium text-sm uppercase tracking-wider">Telemedicine</span>
                            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                                Virtual Care Without Boundaries
                            </h2>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Extend your reach beyond physical walls. Our integrated telemedicine platform enables seamless
                                virtual consultations with the same quality of care as in-person visits.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <CompactFeature
                                    icon={Video}
                                    title="HD Video Calls"
                                    description="Crystal clear video with low latency"
                                />
                                <CompactFeature
                                    icon={FileText}
                                    title="E-Prescriptions"
                                    description="Digital prescriptions during calls"
                                />
                                <CompactFeature
                                    icon={CalendarClock}
                                    title="Smart Scheduling"
                                    description="Automated appointment booking"
                                />
                                <CompactFeature
                                    icon={Shield}
                                    title="HIPAA Compliant"
                                    description="End-to-end encrypted sessions"
                                />
                            </div>
                            <Button variant="hero" size="lg">
                                Explore Telemedicine
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </div>
                        <div>
                            <img
                                src={telemedicineFeature}
                                alt="Telemedicine video consultation interface"
                                className="rounded-2xl shadow-elevated"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Lab Management Showcase */}
            <section className="py-20 bg-gradient-section">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="order-2 lg:order-1">
                            <img
                                src={labFeature}
                                alt="Laboratory information management system interface"
                                className="rounded-2xl shadow-elevated"
                            />
                        </div>
                        <div className="order-1 lg:order-2 space-y-6">
                            <span className="text-primary font-medium text-sm uppercase tracking-wider">Laboratory System</span>
                            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                                Precision Lab Management
                            </h2>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                From sample collection to result delivery, manage your entire laboratory workflow with
                                precision and efficiency. Integrate with lab equipment for automated data capture.
                            </p>
                            <ul className="space-y-3">
                                {[
                                    "Barcode-based sample tracking",
                                    "Automated result entry from analyzers",
                                    "Critical value alerts to physicians",
                                    "Patient portal for report access",
                                    "Quality control management"
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-3 text-foreground">
                                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* OPD/IPD Management Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-primary font-medium text-sm uppercase tracking-wider">Patient Journey</span>
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
                            Complete OPD & IPD Management
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Seamlessly manage outpatient and inpatient workflows from registration to discharge.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* OPD */}
                        <div className="bg-card rounded-2xl p-8 border border-border/50 hover:shadow-card transition-shadow">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                                <UserPlus className="w-7 h-7 text-primary" />
                            </div>
                            <h3 className="font-display font-bold text-2xl text-foreground mb-4">Outpatient (OPD)</h3>
                            <p className="text-muted-foreground mb-6">
                                Streamline outpatient visits with efficient queue management and quick consultations.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: Users, label: "Queue Management" },
                                    { icon: Calendar, label: "Appointment Booking" },
                                    { icon: ClipboardCheck, label: "Quick Registration" },
                                    { icon: Stethoscope, label: "Consultation Notes" },
                                    { icon: Pill, label: "Prescription" },
                                    { icon: Receipt, label: "Billing" }
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <item.icon className="w-4 h-4 text-primary" />
                                        <span>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* IPD */}
                        <div className="bg-card rounded-2xl p-8 border border-border/50 hover:shadow-card transition-shadow">
                            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                                <BedDouble className="w-7 h-7 text-accent" />
                            </div>
                            <h3 className="font-display font-bold text-2xl text-foreground mb-4">Inpatient (IPD)</h3>
                            <p className="text-muted-foreground mb-6">
                                Comprehensive inpatient care management from admission to discharge with detailed tracking.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: BedDouble, label: "Bed Allocation" },
                                    { icon: ClipboardList, label: "Treatment Plans" },
                                    { icon: Syringe, label: "Nursing Charts" },
                                    { icon: Activity, label: "Vitals Monitoring" },
                                    { icon: FileText, label: "Discharge Summary" },
                                    { icon: DollarSign, label: "Final Bill" }
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <item.icon className="w-4 h-4 text-accent" />
                                        <span>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Multi-Branch & Analytics */}
            <section className="py-20 bg-gradient-section">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <span className="text-primary font-medium text-sm uppercase tracking-wider">Enterprise Features</span>
                            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                                Built for Healthcare Chains
                            </h2>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Whether you operate a single clinic or a network of hospitals, our platform scales with you.
                                Centralized management with branch-level insights.
                            </p>

                            <div className="space-y-4">
                                <div className="p-4 bg-card rounded-xl border border-border/50">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Building2 className="w-5 h-5 text-primary" />
                                        <h4 className="font-display font-semibold text-foreground">Multi-Branch Management</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-8">
                                        Manage multiple locations from a single dashboard with role-based access
                                    </p>
                                </div>

                                <div className="p-4 bg-card rounded-xl border border-border/50">
                                    <div className="flex items-center gap-3 mb-2">
                                        <BarChart3 className="w-5 h-5 text-primary" />
                                        <h4 className="font-display font-semibold text-foreground">Advanced Analytics</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-8">
                                        Real-time dashboards with KPIs, trends, and predictive analytics
                                    </p>
                                </div>

                                <div className="p-4 bg-card rounded-xl border border-border/50">
                                    <div className="flex items-center gap-3 mb-2">
                                        <MapPin className="w-5 h-5 text-primary" />
                                        <h4 className="font-display font-semibold text-foreground">Geo-distributed Data</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-8">
                                        Data residency compliance with regional data centers
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { value: "15+", label: "Countries Supported" },
                                { value: "50K+", label: "Daily Transactions" },
                                { value: "100+", label: "Branch Limit" },
                                { value: "Real-time", label: "Data Sync" }
                            ].map((stat) => (
                                <div key={stat.label} className="p-6 bg-card rounded-2xl border border-border/50 text-center">
                                    <div className="font-display text-3xl font-bold text-gradient mb-2">{stat.value}</div>
                                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Modules Section */}
            <section id="modules" className="py-20 md:py-28">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-primary font-medium text-sm uppercase tracking-wider">All Modules</span>
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
                            Comprehensive Suite of 25+ Modules
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Every module is designed for healthcare workflows with precision and efficiency.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <ModuleItem icon={LayoutDashboard} name="Dashboard" description="Central command center" />
                        <ModuleItem icon={Calendar} name="Appointments" description="Patient scheduling" />
                        <ModuleItem icon={Users} name="Patients" description="Patient database" />
                        <ModuleItem icon={Stethoscope} name="Doctors" description="Physician management" />
                        <ModuleItem icon={FileText} name="Prescriptions" description="Digital Rx management" />
                        <ModuleItem icon={FlaskConical} name="Laboratory" description="Lab information system" />
                        <ModuleItem icon={Scan} name="Radiology" description="Imaging & PACS" />
                        <ModuleItem icon={Pill} name="Pharmacy" description="Drug dispensing" />
                        <ModuleItem icon={BedDouble} name="Bed Management" description="Ward allocation" />
                        <ModuleItem icon={Package} name="Inventory" description="Supplies tracking" />
                        <ModuleItem icon={Ambulance} name="Emergency" description="Ambulance dispatch" />
                        <ModuleItem icon={Droplets} name="Blood Bank" description="Blood inventory" />
                        <ModuleItem icon={Video} name="Telemedicine" description="Video consultations" />
                        <ModuleItem icon={Receipt} name="Billing" description="Invoicing & payments" />
                        <ModuleItem icon={Shield} name="Insurance" description="Claims processing" />
                        <ModuleItem icon={BarChart3} name="Analytics" description="Reports & insights" />
                        <ModuleItem icon={UserCog} name="HR & Staff" description="Employee management" />
                        <ModuleItem icon={Building2} name="Multi-Branch" description="Chain management" />
                        <ModuleItem icon={Smartphone} name="Mobile App" description="iOS & Android" />
                        <ModuleItem icon={Webhook} name="API Access" description="Third-party integration" />
                    </div>
                </div>
            </section>

            {/* Integrations Section */}
            <section className="py-20 bg-gradient-section">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-primary font-medium text-sm uppercase tracking-wider">Integrations</span>
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
                            Seamlessly Connect Your Ecosystem
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Pre-built integrations with leading healthcare and business platforms.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <IntegrationCard icon={Wallet} name="Payment Gateways" category="Stripe, Razorpay, PayPal" />
                        <IntegrationCard icon={Mail} name="Email Services" category="SendGrid, Mailgun" />
                        <IntegrationCard icon={MessageSquare} name="SMS & WhatsApp" category="Twilio, MSG91" />
                        <IntegrationCard icon={Database} name="Lab Equipment" category="HL7/FHIR Integration" />
                        <IntegrationCard icon={Cloud} name="Cloud Storage" category="AWS S3, Google Cloud" />
                        <IntegrationCard icon={Lock} name="SSO Providers" category="Okta, Azure AD" />
                        <IntegrationCard icon={BarChart3} name="Analytics" category="Google Analytics, Mixpanel" />
                        <IntegrationCard icon={Webhook} name="Custom APIs" category="REST & GraphQL" status="available" />
                    </div>
                </div>
            </section>

            {/* Security & Compliance */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-primary font-medium text-sm uppercase tracking-wider">Security & Compliance</span>
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
                            Enterprise-Grade Security
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Your patient data is protected with industry-leading security standards and compliance certifications.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Shield, title: "HIPAA Compliant", desc: "Full healthcare data protection" },
                            { icon: Lock, title: "End-to-End Encryption", desc: "AES-256 data encryption" },
                            { icon: Database, title: "Data Backup", desc: "Automated daily backups" },
                            { icon: ShieldCheck, title: "SOC 2 Type II", desc: "Audited security controls" }
                        ].map((item) => (
                            <div key={item.title} className="text-center p-6 bg-card rounded-2xl border border-border/50">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <item.icon className="w-7 h-7 text-primary" />
                                </div>
                                <h4 className="font-display font-semibold text-foreground mb-2">{item.title}</h4>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Target Users Section */}
            <section id="users" className="py-20 bg-gradient-section">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-primary font-medium text-sm uppercase tracking-wider">Target Users</span>
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
                            Designed for Every Role
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Tailored interfaces and permissions for each user type in your healthcare facility.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <UserRoleCard
                            icon={Building}
                            title="Hospital Owner / Admin"
                            description="Complete oversight of all operations, finances, and strategic metrics"
                        />
                        <UserRoleCard
                            icon={UserCog}
                            title="Operations Manager"
                            description="Day-to-day operational control and staff coordination"
                        />
                        <UserRoleCard
                            icon={Stethoscope}
                            title="Doctors"
                            description="Patient consultations, schedules, and prescription management"
                        />
                        <UserRoleCard
                            icon={Users}
                            title="Front Desk Staff"
                            description="Appointment booking, patient check-ins, and inquiries"
                        />
                        <UserRoleCard
                            icon={Microscope}
                            title="Lab Technicians"
                            description="Sample processing, result entry, and quality control"
                        />
                        <UserRoleCard
                            icon={HeartPulse}
                            title="Nursing Staff"
                            description="Patient care, vitals monitoring, and medication administration"
                        />
                        <UserRoleCard
                            icon={Package}
                            title="Inventory Manager"
                            description="Stock management, procurement, and equipment tracking"
                        />
                        <UserRoleCard
                            icon={Briefcase}
                            title="Accounts / Billing"
                            description="Invoice generation, payments, and financial reporting"
                        />
                        <UserRoleCard
                            icon={Radio}
                            title="Radiologists"
                            description="Image interpretation, reporting, and diagnostics"
                        />
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section id="benefits" className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-primary font-medium text-sm uppercase tracking-wider">Benefits</span>
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
                            Transform Your Healthcare Operations
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Experience measurable improvements across all aspects of your hospital management.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <BenefitItem
                            icon={Zap}
                            title="Operational Benefits"
                            items={[
                                "Centralized control",
                                "Reduced manual coordination",
                                "Priority-based task handling",
                                "Faster decision-making"
                            ]}
                            accentColor="primary"
                        />

                        <BenefitItem
                            icon={HeartPulse}
                            title="Clinical Benefits"
                            items={[
                                "Organized appointments",
                                "Better doctor availability",
                                "Faster emergency awareness",
                                "Improved patient care"
                            ]}
                            accentColor="accent"
                        />

                        <BenefitItem
                            icon={TrendingUp}
                            title="Financial Benefits"
                            items={[
                                "Revenue visibility",
                                "Growth tracking",
                                "Invoice control",
                                "Reduced leakage"
                            ]}
                            accentColor="primary"
                        />

                        <BenefitItem
                            icon={Package}
                            title="Inventory Benefits"
                            items={[
                                "Prevents stock-outs",
                                "Reduces emergency procurement",
                                "Improves OT readiness",
                                "Equipment tracking"
                            ]}
                            accentColor="accent"
                        />
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-20 bg-gradient-section">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-primary font-medium text-sm uppercase tracking-wider">Pricing</span>
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Choose the plan that fits your healthcare facility. All plans include core features.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
                        <PricingCard
                            name="Starter"
                            description="Perfect for small clinics and practices"
                            price="$99"
                            period="month"
                            features={[
                                "Up to 5 doctors",
                                "Patient management",
                                "Appointment scheduling",
                                "Basic billing",
                                "Email support"
                            ]}
                            buttonText="Start Free Trial"
                        />

                        <PricingCard
                            name="Professional"
                            description="For growing hospitals and multi-specialty clinics"
                            price="$299"
                            period="month"
                            highlighted
                            features={[
                                "Up to 25 doctors",
                                "All Starter features",
                                "Lab & Pharmacy modules",
                                "Telemedicine",
                                "Insurance claims",
                                "Priority support"
                            ]}
                            buttonText="Start Free Trial"
                        />

                        <PricingCard
                            name="Enterprise"
                            description="For large hospitals and healthcare chains"
                            price="Custom"
                            period="year"
                            features={[
                                "Unlimited doctors",
                                "All Professional features",
                                "Multi-branch management",
                                "Advanced analytics",
                                "Custom integrations",
                                "Dedicated account manager"
                            ]}
                            buttonText="Contact Sales"
                        />
                    </div>
                </div>
            </section>

            {/* Mobile App Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <span className="text-primary font-medium text-sm uppercase tracking-wider">Mobile Access</span>
                            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                                Hospital in Your Pocket
                            </h2>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Access your hospital management system from anywhere with our native mobile apps.
                                Stay connected to your operations on the go.
                            </p>

                            <div className="space-y-4">
                                {[
                                    { icon: Smartphone, title: "Doctor App", desc: "View schedules, patient records, and write prescriptions" },
                                    { icon: Users, title: "Patient App", desc: "Book appointments, view reports, and video consultations" },
                                    { icon: Bell, title: "Push Notifications", desc: "Instant alerts for emergencies and appointments" }
                                ].map((item) => (
                                    <div key={item.title} className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <item.icon className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-display font-semibold text-foreground">{item.title}</h4>
                                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button variant="default" size="lg">
                                    <Smartphone className="w-5 h-5" />
                                    App Store
                                </Button>
                                <Button variant="outline" size="lg">
                                    <Globe className="w-5 h-5" />
                                    Google Play
                                </Button>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-card">
                                        <Calendar className="w-8 h-8 text-primary mb-3" />
                                        <h4 className="font-semibold text-foreground">Today's Schedule</h4>
                                        <p className="text-2xl font-bold text-gradient mt-2">12 Patients</p>
                                    </div>
                                    <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-card">
                                        <Activity className="w-8 h-8 text-accent mb-3" />
                                        <h4 className="font-semibold text-foreground">Pending Tasks</h4>
                                        <p className="text-2xl font-bold text-foreground mt-2">5 Tasks</p>
                                    </div>
                                </div>
                                <div className="space-y-4 mt-8">
                                    <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-card">
                                        <Video className="w-8 h-8 text-primary mb-3" />
                                        <h4 className="font-semibold text-foreground">Video Calls</h4>
                                        <p className="text-2xl font-bold text-gradient mt-2">3 Pending</p>
                                    </div>
                                    <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-card">
                                        <Bell className="w-8 h-8 text-accent mb-3" />
                                        <h4 className="font-semibold text-foreground">Alerts</h4>
                                        <p className="text-2xl font-bold text-foreground mt-2">2 New</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Business Value Section */}
            <section className="py-20 bg-gradient-dark text-primary-foreground">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-primary-foreground/70 font-medium text-sm uppercase tracking-wider">Business Value</span>
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mt-4 mb-6">
                            More Than Just Software
                        </h2>
                        <p className="text-primary-foreground/70 text-lg">
                            This is an Operational Intelligence System for clinics and hospitals — not just appointment booking or billing software.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: "40% Efficiency", desc: "Average improvement in hospital efficiency" },
                            { title: "60% Faster", desc: "Patient check-in and registration time" },
                            { title: "30% Revenue", desc: "Increase through reduced leakage" },
                            { title: "95% Uptime", desc: "Guaranteed system availability" }
                        ].map((item, index) => (
                            <div
                                key={item.title}
                                className="p-6 rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 hover:bg-primary-foreground/10 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                                    <span className="font-display font-bold text-primary-foreground">{String(index + 1).padStart(2, '0')}</span>
                                </div>
                                <h3 className="font-display font-semibold text-primary-foreground mb-2">{item.title}</h3>
                                <p className="text-sm text-primary-foreground/70">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 md:py-28">
                <div className="container mx-auto px-4">
                    <div className="relative rounded-3xl bg-gradient-hero p-8 md:p-16 text-center overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-96 h-96 bg-primary-foreground rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-foreground rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                        </div>

                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
                                Ready to Transform Your Hospital?
                            </h2>
                            <p className="text-primary-foreground/80 text-lg mb-8">
                                Join 500+ healthcare facilities already using HMSPro to streamline their operations and improve patient care.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Button
                                    variant="secondary"
                                    size="xl"
                                    className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                                >
                                    Start Free Trial
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="xl"
                                    className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                                >
                                    Schedule Demo
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
