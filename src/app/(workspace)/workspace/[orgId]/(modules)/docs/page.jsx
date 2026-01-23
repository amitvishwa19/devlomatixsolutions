'use client'
import React, { useState } from 'react'
import { ContentTopbar } from '../../(misc)/_components/ContentTopbar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion } from "framer-motion";
import { Search, Book, FileText, Video, Code, ChevronRight, ExternalLink, Clock, ArrowRight, Sparkles, Shield, Zap, Database, Users, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function DocumentPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    const categories = [
        { id: "all", label: "All", icon: Book },
        { id: "getting-started", label: "Getting Started", icon: Sparkles },
        { id: "modules", label: "Modules", icon: Database },
        { id: "integrations", label: "Integrations", icon: Zap },
        { id: "security", label: "Security", icon: Shield },
        { id: "api", label: "API Reference", icon: Code },
    ];

    const quickStartGuides = [
        {
            title: "Quick Start Guide",
            description: "Get up and running with CareWell HMS in under 30 minutes",
            icon: Sparkles,
            time: "15 min read",
            category: "getting-started",
        },
        {
            title: "Hospital Setup",
            description: "Configure your hospital profile, departments, and staff accounts",
            icon: Settings,
            time: "20 min read",
            category: "getting-started",
        },
        {
            title: "User Management",
            description: "Learn how to create users, assign roles, and manage permissions",
            icon: Users,
            time: "10 min read",
            category: "getting-started",
        },
    ];

    const documentation = [
        {
            category: "modules",
            title: "Patient Administration",
            description: "Complete guide to patient registration, admission, discharge, and transfer (ADT) workflows.",
            icon: FileText,
            articles: 12,
        },
        {
            category: "modules",
            title: "Appointment Management",
            description: "Set up appointment scheduling, doctor availability, and automated reminders.",
            icon: FileText,
            articles: 8,
        },
        {
            category: "modules",
            title: "Billing & Invoicing",
            description: "Configure billing rules, insurance claims, and generate GST-compliant invoices.",
            icon: FileText,
            articles: 15,
        },
        {
            category: "modules",
            title: "Pharmacy Management",
            description: "Inventory tracking, prescription management, and drug interaction alerts.",
            icon: FileText,
            articles: 10,
        },
        {
            category: "modules",
            title: "Pathology & Laboratory",
            description: "Lab test management, sample tracking, and report generation.",
            icon: FileText,
            articles: 9,
        },
        {
            category: "modules",
            title: "Radiology & Imaging",
            description: "DICOM integration, image storage, and radiology reporting workflows.",
            icon: FileText,
            articles: 7,
        },
        {
            category: "integrations",
            title: "Payment Gateway Integration",
            description: "Integrate Razorpay, PayU, or other payment gateways for online payments.",
            icon: Zap,
            articles: 4,
        },
        {
            category: "integrations",
            title: "SMS & WhatsApp Notifications",
            description: "Set up automated patient notifications via SMS and WhatsApp.",
            icon: Zap,
            articles: 5,
        },
        {
            category: "integrations",
            title: "ABHA Integration",
            description: "Connect with Ayushman Bharat Digital Mission for health records.",
            icon: Zap,
            articles: 6,
        },
        {
            category: "security",
            title: "Data Security & Encryption",
            description: "Understanding CareWell's security measures and data protection.",
            icon: Shield,
            articles: 8,
        },
        {
            category: "security",
            title: "HIPAA Compliance",
            description: "How CareWell ensures HIPAA compliance for patient data.",
            icon: Shield,
            articles: 5,
        },
        {
            category: "security",
            title: "Access Control & Audit Logs",
            description: "Configure role-based access and review audit trails.",
            icon: Shield,
            articles: 6,
        },
        {
            category: "api",
            title: "REST API Overview",
            description: "Introduction to CareWell's REST API for custom integrations.",
            icon: Code,
            articles: 10,
        },
        {
            category: "api",
            title: "Authentication & Tokens",
            description: "API authentication methods, OAuth, and token management.",
            icon: Code,
            articles: 4,
        },
        {
            category: "api",
            title: "Webhooks",
            description: "Set up webhooks for real-time event notifications.",
            icon: Code,
            articles: 3,
        },
    ];

    const videoTutorials = [
        {
            title: "Complete HMS Setup Tutorial",
            duration: "45 min",
            thumbnail: "/placeholder.svg",
        },
        {
            title: "OPD Workflow Walkthrough",
            duration: "20 min",
            thumbnail: "/placeholder.svg",
        },
        {
            title: "Billing Module Deep Dive",
            duration: "30 min",
            thumbnail: "/placeholder.svg",
        },
    ];

    const filteredDocs = documentation.filter((doc) => {
        const matchesCategory = activeCategory === "all" || doc.category === activeCategory;
        const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });


    return (
        <div className='absolute inset-0 flex flex-col gap-2'>



            <ContentTopbar
                title='Carewell Docs'
                description='Secure, centralized medical documentation for modern healthcare.'
                icon='file-text'

            />

            <ScrollArea className='h-[85vh] flex flex-grow  rounded-md'>
                <div className="">

                    <main className="pt-24 pb-16">
                        {/* Hero Section */}
                        <section className="container mx-auto px-4 mb-16">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center max-w-3xl mx-auto"
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                                    <Book className="w-4 h-4" />
                                    Documentation & Help Center
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                                    How can we help you?
                                </h1>
                                <p className="text-lg text-muted-foreground mb-8">
                                    Find guides, tutorials, and API documentation to make the most of CareWell HMS.
                                </p>

                                {/* Search */}
                                <div className="relative max-w-xl mx-auto">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search documentation..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-12 h-14 text-lg rounded-2xl border-2 focus:border-primary"
                                    />
                                </div>
                            </motion.div>
                        </section>

                        {/* Quick Start */}
                        <section className="container mx-auto px-4 mb-16">
                            <h2 className="text-2xl font-bold text-foreground mb-6">Quick Start</h2>
                            <div className="grid md:grid-cols-3 gap-4">
                                {quickStartGuides.map((guide, idx) => (
                                    <motion.a
                                        key={idx}
                                        href="#"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="group p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 hover:border-primary/40 transition-all"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                            <guide.icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                                            {guide.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            {guide.description}
                                        </p>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Clock className="w-4 h-4 mr-1" />
                                            {guide.time}
                                        </div>
                                    </motion.a>
                                ))}
                            </div>
                        </section>

                        {/* Categories & Documentation */}
                        <section className="container mx-auto px-4 mb-16">
                            {/* Category Tabs */}
                            <div className="flex flex-wrap gap-2 mb-8">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.id
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary hover:bg-secondary/80 text-foreground"
                                            }`}
                                    >
                                        <cat.icon className="w-4 h-4" />
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            {/* Documentation Grid */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredDocs.map((doc, idx) => (
                                    <motion.a
                                        key={idx}
                                        href="#"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group p-6 rounded-2xl bg-background border border-border hover:border-primary/30 hover:shadow-lg transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                                                <doc.icon className="w-5 h-5 text-primary" />
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                                            {doc.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                            {doc.description}
                                        </p>
                                        <span className="text-xs text-muted-foreground">
                                            {doc.articles} articles
                                        </span>
                                    </motion.a>
                                ))}
                            </div>

                            {filteredDocs.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">No documentation found matching your search.</p>
                                </div>
                            )}
                        </section>

                        {/* Video Tutorials */}
                        <section className="container mx-auto px-4 mb-16">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-foreground">Video Tutorials</h2>
                                <Button variant="ghost" className="gap-2">
                                    View All <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="grid md:grid-cols-3 gap-6">
                                {videoTutorials.map((video, idx) => (
                                    <motion.a
                                        key={idx}
                                        href="#"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="group relative overflow-hidden rounded-2xl"
                                    >
                                        <div className="aspect-video bg-secondary relative">
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                                                    <Video className="w-6 h-6 text-primary ml-1" />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs">
                                                {video.duration}
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                {video.title}
                                            </h3>
                                        </div>
                                    </motion.a>
                                ))}
                            </div>
                        </section>

                        {/* Help CTA */}
                        <section className="container mx-auto px-4">
                            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-3xl p-8 md:p-12 text-center border border-primary/20">
                                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                                    Can't find what you're looking for?
                                </h2>
                                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                                    Our support team is here to help. Reach out to us via chat, email, or schedule a call with our experts.
                                </p>
                                <div className="flex flex-wrap justify-center gap-4">
                                    <Button asChild size="lg" className="gap-2">
                                        <Link href="/contact">
                                            Contact Support
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="lg" className="gap-2">
                                        <Link href="/book-demo">
                                            Schedule a Demo
                                            <ExternalLink className="w-4 h-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </section>
                    </main>

                </div>
            </ScrollArea>


        </div >
    )
}
