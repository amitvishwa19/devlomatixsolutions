'use client';

import {
    LayoutDashboard,
    Calendar,
    Users,
    Stethoscope,
    Package,
    Receipt,
    CreditCard,
    Building2,
    FileText,
    Radio,
    Tags,
    ArrowRight,
    CheckCircle2,
    Shield,
    TrendingUp,
    Clock,
    Zap,
    Target,
    HeartPulse,
    Bell,
    BarChart3,
    Bed,
    Sparkles,
    ChevronRight,
    Play,
    Globe,
    Lock,
    Cloud,
    Smartphone,
    RefreshCw,
    MessageSquare,
    Mail,
    Phone,
    FileBarChart,
    Clipboard,
    Syringe,
    Microscope,
    Pill,
    Activity,
    CircleDot,
    Layers,
    Server,
    Database,
    Monitor,
    Wifi,
    Star,
    Quote,
    HelpCircle,
    ChevronDown,
    Check,
    X,
    Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import AppointmentDialog from '../_components/AppointmentDialog';
import { useState } from 'react';
import ContactDialog from '../_components/ContactDialog';

const coreModules = [
    { icon: LayoutDashboard, name: 'Dashboard', description: 'Centralized command-and-control with real-time monitoring' },
    { icon: Calendar, name: 'Appointments', description: 'Schedule, track and manage all patient appointments' },
    { icon: Calendar, name: 'Calendar', description: 'Visual calendar view for all hospital activities' },
    { icon: Users, name: 'Patients', description: 'Complete patient management and workflow tracking' },
    { icon: FileText, name: 'Prescriptions', description: 'Digital prescription management system' },
    { icon: HeartPulse, name: 'Services', description: 'Manage all hospital services and departments' },
    { icon: Package, name: 'Inventory', description: 'Medical consumables and equipment tracking' },
    { icon: Receipt, name: 'Invoices', description: 'Automated billing and invoice generation' },
    { icon: CreditCard, name: 'Payments', description: 'Secure payment processing and tracking' },
    { icon: Building2, name: 'Management', description: 'Staff, departments and resource management' },
    { icon: FileText, name: 'Content Management', description: 'Website and service information management' },
    { icon: Radio, name: 'Channels', description: 'Communication and department coordination' },
    { icon: Tags, name: 'Taxonomy', description: 'Categorization and classification system' },
    { icon: Syringe, name: 'Lab Management', description: 'Laboratory tests and results tracking' },
    { icon: Microscope, name: 'Diagnostics', description: 'Imaging and diagnostic reports management' },
    { icon: Pill, name: 'Pharmacy', description: 'Medicine inventory and dispensing system' },
    { icon: Bed, name: 'Bed Management', description: 'Real-time bed occupancy and allocation' },
    { icon: Bell, name: 'Notifications', description: 'Smart alerts and reminders system' },
    { icon: Clipboard, name: 'EMR/EHR', description: 'Electronic medical records management' },
    { icon: Activity, name: 'Vitals Tracking', description: 'Patient vital signs monitoring' },
    { icon: Phone, name: 'Telemedicine', description: 'Virtual consultation and video calls' },
    { icon: BarChart3, name: 'Reports', description: 'Custom analytics and report generation' },
    { icon: RefreshCw, name: 'Queue Management', description: 'Patient flow and waiting optimization' },
    { icon: MessageSquare, name: 'Chat & Communication', description: 'Internal team messaging system' },
];

const functionalAreas = [
    {
        title: 'Operations Management',
        icon: LayoutDashboard,
        color: 'from-blue-500 to-cyan-500',
        features: [
            'Today\'s appointments overview',
            'Task list with priority & urgency',
            'Staff meetings & internal coordination',
            'Emergency handling alerts',
            'Shift management & scheduling',
            'Resource allocation tracking'
        ]
    },
    {
        title: 'Patient Management',
        icon: Users,
        color: 'from-emerald-500 to-teal-500',
        features: [
            'Patient appointment listing',
            'Consultation tracking',
            'Appointment status management',
            'Patient-centric workflow',
            'Medical history records',
            'Patient communication portal'
        ]
    },
    {
        title: 'Doctor Management',
        icon: Stethoscope,
        color: 'from-violet-500 to-purple-500',
        features: [
            'Active doctors count',
            'Doctors on leave tracking',
            'Doctor availability overview',
            'Consultation management',
            'Performance analytics',
            'Schedule optimization'
        ]
    },
    {
        title: 'Inventory Management',
        icon: Package,
        color: 'from-amber-500 to-orange-500',
        features: [
            'Medical consumables tracking',
            'Stock level monitoring',
            'Automated reorder alerts',
            'OT readiness management',
            'Expiry date tracking',
            'Vendor management'
        ]
    },
    {
        title: 'Revenue & Finance',
        icon: TrendingUp,
        color: 'from-rose-500 to-pink-500',
        features: [
            'Today\'s revenue overview',
            'Monthly revenue tracking',
            'Revenue growth analytics',
            'Invoice & payment modules',
            'Insurance claims processing',
            'Financial reporting'
        ]
    },
    {
        title: 'Reports & Analytics',
        icon: BarChart3,
        color: 'from-indigo-500 to-blue-500',
        features: [
            'Custom report builder',
            'Real-time dashboards',
            'Performance metrics',
            'Trend analysis',
            'Export to PDF/Excel',
            'Scheduled reports'
        ]
    }
];

const targetUsers = [
    { icon: Building2, title: 'Hospital Owner / Admin', description: 'Complete visibility and control over operations' },
    { icon: Target, title: 'Operations Manager', description: 'Day-to-day operational efficiency' },
    { icon: Stethoscope, title: 'Doctors', description: 'Patient and consultation management' },
    { icon: Users, title: 'Front Desk Staff', description: 'Appointment and patient handling' },
    { icon: Package, title: 'Inventory Manager', description: 'Stock and supplies management' },
    { icon: Receipt, title: 'Accounts / Billing Team', description: 'Financial operations and reporting' },
    { icon: Syringe, title: 'Lab Technicians', description: 'Test management and reporting' },
    { icon: Pill, title: 'Pharmacists', description: 'Medicine dispensing and tracking' },
    { icon: HeartPulse, title: 'Nurses', description: 'Patient care and vitals monitoring' },
    { icon: Clipboard, title: 'Medical Records Staff', description: 'EMR/EHR management and documentation' },
    { icon: Phone, title: 'IT Administrator', description: 'System configuration and support' },
    { icon: BarChart3, title: 'Data Analysts', description: 'Reports, insights and analytics' },
];

const benefits = [
    {
        category: 'Operational Benefits',
        icon: Zap,
        items: [
            'Centralized control of all operations',
            'Reduced manual coordination overhead',
            'Priority-based task handling',
            'Faster decision-making process',
            'Automated workflow triggers',
            'Real-time status updates'
        ]
    },
    {
        category: 'Clinical Benefits',
        icon: HeartPulse,
        items: [
            'Organized appointments',
            'Better doctor availability management',
            'Faster emergency awareness',
            'Improved patient experience',
            'Reduced waiting times',
            'Better care coordination'
        ]
    },
    {
        category: 'Financial Benefits',
        icon: TrendingUp,
        items: [
            'Complete revenue visibility',
            'Growth tracking & analytics',
            'Invoice & payment control',
            'Reduced operational leakage',
            'Better insurance processing',
            'Cost optimization insights'
        ]
    },
    {
        category: 'Inventory Benefits',
        icon: Package,
        items: [
            'Prevents stock-outs',
            'Reduces emergency procurement',
            'Improves OT readiness',
            'Automated reorder alerts',
            'Reduced wastage',
            'Better vendor negotiations'
        ]
    }
];

const businessValues = [
    { icon: TrendingUp, title: 'Improves hospital efficiency', description: 'Streamlined workflows and automated processes' },
    { icon: Shield, title: 'Reduces operational leakage', description: 'Better tracking and accountability' },
    { icon: Users, title: 'Enhances patient experience', description: 'Faster service and better coordination' },
    { icon: BarChart3, title: 'Enables data-driven management', description: 'Real-time analytics and insights' },
];

const integrations = [
    { icon: CreditCard, name: 'Payment Gateways', description: 'Stripe, PayPal, Razorpay & more' },
    { icon: Mail, name: 'Email Services', description: 'SendGrid, Mailchimp, AWS SES' },
    { icon: MessageSquare, name: 'SMS Notifications', description: 'Twilio, MSG91, Nexmo' },
    { icon: Cloud, name: 'Cloud Storage', description: 'AWS S3, Google Cloud, Azure' },
    { icon: FileBarChart, name: 'Accounting', description: 'QuickBooks, Tally, Zoho Books' },
    { icon: Globe, name: 'Telemedicine', description: 'Zoom, Google Meet integration' },
    { icon: Activity, name: 'Health Devices', description: 'IoT medical device sync' },
    { icon: Database, name: 'HL7/FHIR', description: 'Healthcare data standards' },
    { icon: Smartphone, name: 'Mobile Apps', description: 'iOS & Android native apps' },
    { icon: Shield, name: 'Insurance', description: 'Claims processing integration' },
    { icon: FileText, name: 'E-Prescriptions', description: 'Digital prescription systems' },
    { icon: BarChart3, name: 'BI Tools', description: 'Power BI, Tableau, Looker' },
];

const howItWorks = [
    { step: '01', title: 'Quick Setup', description: 'Sign up and configure your hospital profile in under 10 minutes. No technical expertise required.' },
    { step: '02', title: 'Import Data', description: 'Easily migrate existing patient records, staff data, and inventory from spreadsheets or other systems.' },
    { step: '03', title: 'Configure Workflows', description: 'Set up appointment slots, departments, user roles, and automated notifications based on your needs.' },
    { step: '04', title: 'Go Live', description: 'Start managing operations immediately with real-time dashboards and instant insights.' },
];

const stats = [
    { number: '500+', label: 'Hospitals Trust Us' },
    { number: '2M+', label: 'Patients Managed' },
    { number: '99.9%', label: 'Uptime Guarantee' },
    { number: '50%', label: 'Time Saved' },
];

const testimonials = [
    {
        quote: "This software transformed how we manage our 200-bed hospital. The real-time dashboards give us complete visibility.",
        author: "Dr. Rajesh Kumar",
        role: "Medical Director",
        hospital: "City General Hospital"
    },
    {
        quote: "The inventory management alone saved us 30% on procurement costs. Emergency stock-outs are a thing of the past.",
        author: "Sarah Johnson",
        role: "Operations Manager",
        hospital: "Sunrise Medical Center"
    },
    {
        quote: "Patient satisfaction scores improved by 40% after we implemented this system. Appointment scheduling is now seamless.",
        author: "Dr. Priya Sharma",
        role: "Chief Administrator",
        hospital: "Metro Healthcare"
    },
];

const securityFeatures = [
    { icon: Lock, title: 'End-to-End Encryption', description: 'All data encrypted at rest and in transit' },
    { icon: Shield, title: 'HIPAA Compliant', description: 'Full healthcare regulatory compliance' },
    { icon: Server, title: 'Regular Backups', description: 'Automated daily backups with 30-day retention' },
    { icon: Monitor, title: 'Audit Logs', description: 'Complete activity tracking and logging' },
    { icon: RefreshCw, title: 'Disaster Recovery', description: 'Multi-region failover and recovery' },
    { icon: Wifi, title: 'Secure Access', description: 'Role-based access with 2FA support' },
];

const faqs = [
    {
        question: 'How long does it take to set up the system?',
        answer: 'Most hospitals are up and running within 24-48 hours. Our onboarding team provides dedicated support for data migration and configuration.'
    },
    {
        question: 'Can I migrate data from my existing system?',
        answer: 'Yes! We support data import from Excel, CSV, and most popular HMS systems. Our team can assist with complex migrations.'
    },
    {
        question: 'Is the software HIPAA compliant?',
        answer: 'Absolutely. We maintain full HIPAA compliance with end-to-end encryption, audit logs, and all required security controls.'
    },
    {
        question: 'What kind of support do you provide?',
        answer: 'We offer 24/7 email and chat support, dedicated account managers for enterprise clients, and comprehensive documentation.'
    },
    {
        question: 'Can I customize the software for my hospital?',
        answer: 'Yes, the system is highly customizable. You can configure workflows, add custom fields, create templates, and set up automated rules.'
    },
    {
        question: 'Is there a mobile app available?',
        answer: 'Yes, we have native iOS and Android apps for doctors and staff to access key features on the go.'
    },
];

const pricingPlans = [
    {
        name: 'Starter',
        //price: '₹10,000',

        description: 'Perfect for small clinics and practices',
        popular: false,
        features: [
            'Up to 50 patients/day',
            'Patient Management',
            'Appointment Scheduling',
            'Basic Reports',
            'Email Support',
            '1 Admin User',
            'Basic Dashboard',
        ],
    },
    {
        name: 'Professional',
        //price: '₹15,000',

        description: 'Ideal for growing hospitals',
        popular: true,
        features: [
            'Up to 200 patients/day',
            'Everything in Starter',
            'Inventory Management',
            'Multi-location Support',
            'Advanced Analytics',
            'Priority Support',
            '5 Admin Users',
            'Lab & Pharmacy Module',
            'SMS Notifications',
        ],
    },
    {
        name: 'Enterprise',
        description: 'For large healthcare facilities',
        popular: false,
        features: [
            'Unlimited patients',
            'Everything in Professional',
            'Custom Integrations',
            'Dedicated Account Manager',
            'White-labeling',
            'Unlimited Users',
            'On-premise Deployment',
            'SLA Guarantee',
            'Training & Onboarding',
            'API Access',
        ],
    },
    {
        name: 'Custom',
        period: '',
        description: 'Tailored solutions for unique needs',
        popular: false,
        isCustom: true,
        features: [
            'Fully customized modules',
            'Bespoke workflow design',
            'Custom UI/UX branding',
            'Third-party system integrations',
            'Custom reporting & dashboards',
            'Dedicated development team',
            'Priority feature requests',
            'Custom SLA & support terms',
            'On-site training & deployment',
            'Ongoing maintenance & updates',
        ],
    },
];

const comparisonPlans = [
    { feature: 'Patient Management', starter: true, professional: true, enterprise: true, custom: true },
    { feature: 'Appointment Scheduling', starter: true, professional: true, enterprise: true, custom: true },
    { feature: 'Basic Reports', starter: true, professional: true, enterprise: true, custom: true },
    { feature: 'Dashboard Access', starter: true, professional: true, enterprise: true, custom: true },
    { feature: 'Email Support', starter: true, professional: true, enterprise: true, custom: true },
    { feature: 'Inventory Management', starter: false, professional: true, enterprise: true, custom: true },
    { feature: 'Multi-location Support', starter: false, professional: true, enterprise: true, custom: true },
    { feature: 'Advanced Analytics', starter: false, professional: true, enterprise: true, custom: true },
    { feature: 'Lab & Pharmacy Module', starter: false, professional: true, enterprise: true, custom: true },
    { feature: 'SMS Notifications', starter: false, professional: true, enterprise: true, custom: true },
    { feature: 'Priority Support', starter: false, professional: true, enterprise: true, custom: true },
    { feature: 'Android App', starter: false, professional: true, enterprise: true, custom: true },
    { feature: 'iOS App', starter: false, professional: false, enterprise: true, custom: true },
    { feature: 'Custom Integrations', starter: false, professional: false, enterprise: true, custom: true },
    { feature: 'Dedicated Account Manager', starter: false, professional: false, enterprise: true, custom: true },
    { feature: 'White-labeling', starter: false, professional: false, enterprise: true, custom: true },
    { feature: 'On-premise Deployment', starter: false, professional: false, enterprise: true, custom: true },
    { feature: 'API Access', starter: false, professional: false, enterprise: true, custom: true },
    { feature: 'SLA Guarantee', starter: false, professional: false, enterprise: true, custom: true },
    { feature: 'Fully Customized Modules', starter: false, professional: false, enterprise: false, custom: true },
    { feature: 'Bespoke Workflow Design', starter: false, professional: false, enterprise: false, custom: true },
    { feature: 'Dedicated Development Team', starter: false, professional: false, enterprise: false, custom: true },
];

const Features = () => {
    return (
        <div className="min-h-screen overflow-hidden">
            {/* Hero Section */}
            <section className="relative py-24 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 gradient-mesh" />
                <div className="blob blob-1" />
                <div className="blob blob-2" />

                <div className="   relative mx-auto px-4">
                    <div className="text-center max-w-4xl mx-auto">
                        <div
                            className="inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-medium mb-8 animate-fade-in"
                        >
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-foreground">Hospital Management Software</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            Operational Intelligence System for{' '}
                            <span className="text-sky-500">Modern Healthcare</span>
                        </h1>

                        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            A web-based SaaS dashboard focused on daily hospital operations and administration.
                            Centralized command-and-control for healthcare facilities.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
                            <ContactDialog>
                                <Button
                                    variant='default'
                                    size="lg"
                                    className=" shadow-lg hover:shadow-xl transition-all duration-300 text-base px-10"
                                >
                                    Let's get started
                                    <ArrowRight className="h-5 w-5 ml-2" />
                                </Button>
                            </ContactDialog>
                            <Button variant="outline" size="lg" className="group glass border-border/50 hover:border-primary/50 text-base px-8">
                                <Play className="h-5 w-5 mr-2 text-primary" />
                                Watch Demo
                            </Button>
                        </div>

                        {/* Trust badges */}
                        <div className="flex flex-wrap justify-center gap-8 mt-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Shield className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium">HIPAA Compliant</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Lock className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium">256-bit Encryption</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Cloud className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium">Cloud-Based</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Smartphone className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium">Mobile Ready</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative py-16 bg-primary/5">
                <div className="mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 items-center justify-center">
                        {stats.map((stat, index) => (
                            <div
                                key={stat.label}

                            >

                                <p className=" text-4xl text-primary md:text-5xl lg:text-6xl mb-2 font-extrabold">
                                    {stat.number}
                                </p>
                                <p className="text-muted-foreground font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What It Does */}
            <section className="relative py-20 bg-card/50">
                <div className="section-divider absolute top-0" />

                <div className="   mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            One Dashboard for <span className="text-sky-500">Everything</span>
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Get complete visibility of your hospital operations on a single screen
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        {[
                            { icon: Building2, label: 'Management' },
                            { icon: TrendingUp, label: 'Revenue' },
                            { icon: Calendar, label: 'Appointments' },
                            { icon: Stethoscope, label: 'Doctors' },
                            { icon: Bed, label: 'Beds' },
                            { icon: Package, label: 'Inventory' },
                            { icon: CheckCircle2, label: 'Tasks' },
                            { icon: Bell, label: 'Alerts' },
                        ].map((item, index) => (
                            <div
                                key={item.label}
                                className="group p-6 rounded-2xl border  text-center card-hover animate-slide-up hover:border-primary/30 transition-colors animate-fade-in"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="h-14 w-14 mx-auto rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <item.icon className="h-7 w-7 text-primary-foreground" />
                                </div>
                                <p className="font-semibold text-foreground">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="relative py-24 lg:py-32">
                <div className="   mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium mb-6">
                            <Layers className="h-4 w-4 text-primary" />
                            How It Works
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Get Started in <span className="text-sky-500">4 Simple Steps</span>
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            From signup to going live in just a few hours
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {howItWorks.map((step, index) => (
                            <div
                                key={step.step}
                                className="relative animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {index < howItWorks.length - 1 && (
                                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -translate-x-8" />
                                )}
                                <div className="glass rounded-2xl p-8 h-full">
                                    <div className="text-5xl font-bold text-sky-500 mb-4">{step.step}</div>
                                    <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                                    <p className="text-muted-foreground">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Functional Areas */}
            <section className="relative py-24 lg:py-32 bg-card/30">
                <div className="blob blob-3" />
                <div className="section-divider absolute top-0" />

                <div className="   relative mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium mb-6">
                            <Target className="h-4 w-4 text-primary" />
                            Core Functional Areas
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Comprehensive <span className="text-sky-500">Management Modules</span>
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Everything you need to run your healthcare facility efficiently
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {functionalAreas.map((area, index) => (
                            <Card
                                key={area.title}
                                className="group border-border/50 bg-card/50 glass card-hover overflow-hidden animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <CardContent className="p-8">
                                    <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${area.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        <area.icon className="h-8 w-8 text-primary-foreground" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-4">{area.title}</h3>
                                    <ul className="space-y-3">
                                        {area.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-3 text-muted-foreground">
                                                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Modules Grid */}
            <section className="relative py-24">
                <div className="   mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium mb-6">
                            <LayoutDashboard className="h-4 w-4 text-primary" />
                            Product Modules
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Complete Suite of <span className="text-sky-500">Healthcare Tools</span>
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            16+ integrated modules to digitize your entire hospital operation
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {coreModules.map((module, index) => (
                            <div
                                key={module.name}
                                className="group p-5 rounded-xl  hover:shadow-card duration-300 animate-slide-up border hover:border-primary/30 transition-colors animate-fade-in"
                                style={{ animationDelay: `${index * 0.03}s` }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                        <module.icon className="h-6 w-6 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">{module.name}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-1">{module.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Integrations */}
            <section className="relative py-24 bg-card/50">
                <div className="section-divider absolute top-0" />

                <div className="   mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium mb-6">
                            <Layers className="h-4 w-4 text-primary" />
                            Integrations
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Connect With Your <span className="text-sky-500">Favorite Tools</span>
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Seamlessly integrate with payment gateways, communication tools, and healthcare systems
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {integrations.map((integration, index) => (
                            <div
                                key={integration.name}
                                className="group p-6 rounded-2xl  text-center card-hover animate-slide-up border"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="h-14 w-14 mx-auto rounded-xl border gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 hover:border-primary/30 transition-colors animate-fade-in">
                                    <integration.icon className="h-7 w-7 text-primary-foreground" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">{integration.name}</h3>
                                <p className="text-sm text-muted-foreground">{integration.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Target Users */}
            <section className="relative py-24 lg:py-32">
                <div className="absolute inset-0 gradient-mesh opacity-50" />

                <div className="   relative mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium mb-6">
                            <Users className="h-4 w-4 text-primary" />
                            Who It's For
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Built for Every <span className="text-sky-500">Team Member</span>
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Role-based access and features designed for each user type
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {targetUsers.map((user, index) => (
                            <div
                                key={user.title}
                                className="group p-6 rounded-2xl justify-center items-center   animate-slide-up border hover:border-primary/30 transition-colors animate-fade-in  "
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="h-14 w-14 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ">
                                    <user.icon className="h-7 w-7 text-primary" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-2">{user.title}</h3>
                                <p className="text-sm text-muted-foreground">{user.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="relative py-24 bg-card/30">
                <div className="section-divider absolute top-0" />

                <div className="   mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium mb-6">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            Key Benefits
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Transform Your <span className="text-sky-500">Hospital Operations</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {benefits.map((benefit, index) => (
                            <Card
                                key={benefit.category}
                                className="border-border/50 bg-card/50 glass animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <CardContent className="p-8">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-14 w-14 rounded-xl gradient-primary flex items-center justify-center">
                                            <benefit.icon className="h-7 w-7 text-primary-foreground" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground">{benefit.category}</h3>
                                    </div>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {benefit.items.map((item) => (
                                            <li key={item} className="flex items-center gap-3 text-muted-foreground">
                                                <ChevronRight className="h-5 w-5 text-primary flex-shrink-0" />
                                                <span className="text-sm">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Security */}
            <section className="relative py-24 lg:py-32">
                <div className="blob blob-1" />

                <div className="   relative mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium mb-6">
                            <Shield className="h-4 w-4 text-primary" />
                            Security & Compliance
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Enterprise-Grade <span className="text-sky-500">Security</span>
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Your patient data is protected with industry-leading security measures
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {securityFeatures.map((feature, index) => (
                            <div
                                key={feature.title}
                                className="group p-6 rounded-2xl glass card-hover animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="h-14 w-14 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <feature.icon className="h-7 w-7 text-primary-foreground" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="relative py-24 bg-card/50">
                <div className="section-divider absolute top-0" />

                <div className="   mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium mb-6">
                            <Star className="h-4 w-4 text-primary" />
                            Testimonials
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Trusted by <span className="text-sky-500">Healthcare Leaders</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={testimonial.author}
                                className="glass rounded-2xl p-8 animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <Quote className="h-10 w-10 text-primary/30 mb-4" />
                                <p className="text-foreground mb-6 italic">"{testimonial.quote}"</p>
                                <div>
                                    <p className="font-semibold text-foreground">{testimonial.author}</p>
                                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                    <p className="text-sm text-primary">{testimonial.hospital}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="relative py-24 lg:py-32">
                <div className="blob blob-2" />

                <div className="   relative mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium mb-6">
                            <CreditCard className="h-4 w-4 text-primary" />
                            Pricing
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Simple, Transparent <span className="text-sky-500">Pricing</span>
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Choose the plan that fits your hospital's needs
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
                        {pricingPlans.map((plan, index) => (
                            <div
                                key={plan.name}
                                className={`relative rounded-3xl p-8 animate-slide-up flex flex-col ${plan.popular
                                    ? 'glass-strong border-2 border-primary shadow-glow'
                                    : 'glass'
                                    }`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="badge-gradient text-sm px-4 py-1">Most Popular</span>
                                    </div>
                                )}
                                <div className="text-center mb-8">
                                    <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-4xl md:text-5xl font-bold text-sky-500">{plan.price}</span>
                                        <span className="text-muted-foreground">{plan.period}</span>
                                    </div>
                                </div>
                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-3 text-muted-foreground">
                                            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <ContactDialog>
                                    <Button
                                        variant='default'
                                        size="md"
                                        className=" shadow-lg hover:shadow-xl transition-all duration-300 text-base px-10"
                                    >
                                        Let's get started
                                        <ArrowRight className="h-5 w-5 ml-2" />
                                    </Button>
                                </ContactDialog>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section className="relative py-24 bg-card/50">
                <div className="section-divider absolute top-0" />

                <div className="   mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium mb-6">
                            <Layers className="h-4 w-4 text-primary" />
                            Compare Plans
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Detailed <span className="text-sky-500">Feature Comparison</span>
                        </h2>
                    </div>

                    <div className="max-w-6xl mx-auto glass rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-primary/5">
                                        <th className="text-left py-5 px-6 font-semibold text-foreground">Feature</th>
                                        <th className="text-center py-5 px-4">
                                            <div className="font-semibold text-foreground">Starter</div>
                                            {/* <div className="text-sm text-primary font-bold">₹10,000/mo</div> */}
                                        </th>
                                        <th className="text-center py-5 px-4 bg-primary/10">
                                            <div className="font-semibold text-primary">Professional</div>
                                            {/* <div className="text-sm text-primary font-bold">₹15,000/mo</div> */}
                                        </th>
                                        <th className="text-center py-5 px-4">
                                            <div className="font-semibold text-foreground">Enterprise</div>
                                            {/* <div className="text-sm text-primary font-bold">₹25,000/mo</div> */}
                                        </th>
                                        <th className="text-center py-5 px-4">
                                            <div className="font-semibold text-foreground">Custom</div>
                                            {/* <div className="text-sm text-primary font-bold">Contact Us</div> */}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisonPlans.map((plan, index) => (
                                        <tr key={plan.feature} className="border-b border-border/30 hover:bg-primary/5 transition-colors">
                                            <td className="py-4 px-6 text-foreground font-medium">{plan.feature}</td>
                                            <td className="text-center py-4 px-4">
                                                {plan.starter ? (
                                                    <Check className="h-5 w-5 text-primary mx-auto" />
                                                ) : (
                                                    <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                                                )}
                                            </td>
                                            <td className="text-center py-4 px-4 bg-primary/5">
                                                {plan.professional ? (
                                                    <Check className="h-5 w-5 text-primary mx-auto" />
                                                ) : (
                                                    <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                                                )}
                                            </td>
                                            <td className="text-center py-4 px-4">
                                                {plan.enterprise ? (
                                                    <Check className="h-5 w-5 text-primary mx-auto" />
                                                ) : (
                                                    <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                                                )}
                                            </td>
                                            <td className="text-center py-4 px-4">
                                                {plan.custom ? (
                                                    <Check className="h-5 w-5 text-primary mx-auto" />
                                                ) : (
                                                    <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* Business Value */}
            <section className="relative py-24 bg-card/30">
                <div className="section-divider absolute top-0" />

                <div className="   relative mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium mb-6">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            Business Value
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Drive Real <span className="text-sky-500">Business Impact</span>
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {businessValues.map((value, index) => (
                            <div
                                key={value.title}
                                className="group text-center p-8 rounded-2xl glass card-hover animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="h-16 w-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <value.icon className="h-8 w-8 text-primary-foreground" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-2">{value.title}</h3>
                                <p className="text-sm text-muted-foreground">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQs */}
            <section className="relative py-24 lg:py-32">
                <div className="   mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium mb-6">
                            <HelpCircle className="h-4 w-4 text-primary" />
                            FAQs
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Frequently Asked <span className="text-sky-500">Questions</span>
                        </h2>
                    </div>

                    <div className="max-w-3xl mx-auto">
                        <Accordion type="single" collapsible className="space-y-4">
                            {faqs.map((faq, index) => (
                                <AccordionItem
                                    key={index}
                                    value={`item-${index}`}
                                    className="glass rounded-xl px-6 border-0"
                                >
                                    <AccordionTrigger className="text-left text-foreground hover:no-underline py-6">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground pb-6">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </section>

            {/* Nature Statement */}
            <section className="relative py-20 bg-card/50">
                <div className="section-divider absolute top-0" />

                <div className="   mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="glass rounded-3xl p-10 md:p-14">
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                                This is not just appointment booking or billing software
                            </h2>
                            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                                This is an <span className="text-primary font-semibold">Operational Intelligence System</span> designed
                                specifically for modern clinics and hospitals.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <span className="badge-gradient">Real-time Monitoring</span>
                                <span className="badge-gradient">Data-driven Decisions</span>
                                <span className="badge-gradient">Complete Visibility</span>
                                <span className="badge-gradient">Scalable Architecture</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-24 lg:py-32">
                <div className="   mx-auto px-4">
                    <div className="relative rounded-[2.5rem] overflow-hidden">
                        <div className="absolute inset-0 gradient-primary" />
                        <div className="absolute inset-0 opacity-30">
                            <div className="absolute top-0 left-0 w-96 h-96 bg-white/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                        </div>

                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />

                        <div className="relative px-8 py-16 md:p-20 lg:p-24 text-center">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 max-w-2xl mx-auto">
                                Ready to Transform Your Hospital?
                            </h2>
                            <p className="text-primary-foreground/90 text-lg md:text-xl mb-10 max-w-xl mx-auto">
                                Join 500+ healthcare facilities already using our platform to streamline operations.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                {/* <AppointmentDialog>
                                    <Button
                                        size="lg"
                                        className="bg-background text-primary hover:bg-background/90 shadow-lg hover:shadow-xl transition-all duration-300 text-base px-10"
                                    >
                                        Start Free Trial
                                        <ArrowRight className="h-5 w-5 ml-2" />
                                    </Button>
                                </AppointmentDialog> */}
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-primary-foreground/30 text-white hover:bg-primary-foreground/10 text-base px-10"
                                >
                                    Schedule Demo
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Features;