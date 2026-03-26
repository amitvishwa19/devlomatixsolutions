'use client'
import React from 'react'
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Clock, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageTransition from '../components/PageTransition';
import Link from 'next/link';

const caseStudies = [
    {
        id: 1,
        title: "E-Commerce Platform Transformation",
        client: "RetailMax Inc.",
        industry: "Retail & E-Commerce",
        duration: "8 months",
        teamSize: "12 developers",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop",
        challenge: "Legacy system couldn't handle peak traffic, resulting in 40% cart abandonment during sales events.",
        solution: "Built a scalable microservices architecture with real-time inventory management and AI-powered recommendations.",
        technologies: ["React", "Node.js", "PostgreSQL", "Redis", "AWS", "Docker"],
        results: [
            { metric: "Revenue Increase", value: "156%", icon: TrendingUp },
            { metric: "Load Time", value: "-68%", icon: Clock },
            { metric: "User Retention", value: "+89%", icon: Users },
        ],
        testimonial: {
            quote: "The new platform handles 10x our previous traffic without breaking a sweat. Our Black Friday sales were record-breaking.",
            author: "Sarah Chen",
            role: "CTO, RetailMax Inc."
        }
    },
    {
        id: 2,
        title: "Healthcare Management System",
        client: "MediCare Solutions",
        industry: "Healthcare",
        duration: "12 months",
        teamSize: "8 developers",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=500&fit=crop",
        challenge: "Paper-based processes causing delays in patient care and regulatory compliance issues.",
        solution: "HIPAA-compliant digital platform with automated workflows, real-time patient monitoring, and integrated billing.",
        technologies: ["React", "Python", "FastAPI", "MongoDB", "Azure", "HL7 FHIR"],
        results: [
            { metric: "Admin Time Saved", value: "75%", icon: Clock },
            { metric: "Patient Satisfaction", value: "+92%", icon: Users },
            { metric: "Compliance Rate", value: "100%", icon: CheckCircle },
        ],
        testimonial: {
            quote: "This system transformed how we deliver care. Doctors spend more time with patients instead of paperwork.",
            author: "Dr. Michael Roberts",
            role: "Medical Director, MediCare Solutions"
        }
    },
    {
        id: 3,
        title: "FinTech Payment Gateway",
        client: "PayFlow Technologies",
        industry: "Financial Services",
        duration: "10 months",
        teamSize: "15 developers",
        image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=500&fit=crop",
        challenge: "Complex multi-currency transactions with high failure rates and slow settlement times.",
        solution: "Real-time payment processing engine with AI fraud detection and instant cross-border settlements.",
        technologies: ["Go", "Rust", "PostgreSQL", "Kafka", "Kubernetes", "AWS"],
        results: [
            { metric: "Transaction Speed", value: "99.9%", icon: TrendingUp },
            { metric: "Fraud Reduction", value: "-94%", icon: CheckCircle },
            { metric: "Processing Volume", value: "5M/day", icon: Users },
        ],
        testimonial: {
            quote: "We went from processing thousands to millions of transactions daily. The fraud detection alone saved us millions.",
            author: "James Wilson",
            role: "CEO, PayFlow Technologies"
        }
    },
    {
        id: 4,
        title: "Supply Chain Automation",
        client: "LogiPro International",
        industry: "Logistics",
        duration: "6 months",
        teamSize: "10 developers",
        image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=500&fit=crop",
        challenge: "Manual tracking processes causing delays, lost shipments, and poor visibility across the supply chain.",
        solution: "IoT-enabled tracking platform with predictive analytics and automated warehouse management.",
        technologies: ["React Native", "Python", "TensorFlow", "IoT", "GCP", "BigQuery"],
        results: [
            { metric: "Delivery Accuracy", value: "99.7%", icon: CheckCircle },
            { metric: "Cost Reduction", value: "-42%", icon: TrendingUp },
            { metric: "Visibility", value: "Real-time", icon: Clock },
        ],
        testimonial: {
            quote: "We can now track every package in real-time across 50 countries. Customer complaints dropped to near zero.",
            author: "Lisa Park",
            role: "VP Operations, LogiPro"
        }
    },
];

export default function CaseStudyPage() {
    return (
        <PageTransition>
            <div className="min-h-screen bg-background">


                {/* Hero Section */}
                <section className="pt-32 pb-20 relative overflow-hidden">
                    <div className="absolute inset-0 grid-pattern opacity-30" />
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

                    <div className="container mx-auto px-6 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center max-w-4xl mx-auto"
                        >
                            <Badge variant="secondary" className="mb-6">
                                Success Stories
                            </Badge>
                            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
                                Real Results for
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent"> Real Businesses</span>
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                Explore how we've helped companies transform their operations,
                                scale their platforms, and achieve measurable business outcomes.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Case Studies Grid */}
                <section className="py-20">
                    <div className="container mx-auto px-6">
                        <div className="space-y-32">
                            {caseStudies.map((study, index) => (
                                <motion.div
                                    key={study.id}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                    className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? "lg:grid-flow-dense" : ""
                                        }`}
                                >
                                    {/* Image */}
                                    <div className={index % 2 === 1 ? "lg:col-start-2" : ""}>
                                        <div className="relative group">
                                            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <img
                                                src={study.image}
                                                alt={study.title}
                                                className="relative rounded-2xl w-full h-80 object-cover"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <Badge className="bg-primary text-primary-foreground">
                                                    {study.industry}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" /> {study.duration}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" /> {study.teamSize}
                                            </span>
                                        </div>

                                        <h2 className="text-3xl md:text-4xl font-display font-bold">
                                            {study.title}
                                        </h2>
                                        <p className="text-lg text-muted-foreground">{study.client}</p>

                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-semibold text-foreground mb-2">The Challenge</h4>
                                                <p className="text-muted-foreground">{study.challenge}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-foreground mb-2">Our Solution</h4>
                                                <p className="text-muted-foreground">{study.solution}</p>
                                            </div>
                                        </div>

                                        {/* Technologies */}
                                        <div className="flex flex-wrap gap-2">
                                            {study.technologies.map((tech) => (
                                                <Badge key={tech} variant="outline" className="text-xs">
                                                    {tech}
                                                </Badge>
                                            ))}
                                        </div>

                                        {/* Results */}
                                        <div className="grid grid-cols-3 gap-4 py-6 border-y border-border">
                                            {study.results.map((result) => (
                                                <div key={result.metric} className="text-center">
                                                    <result.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                                                    <div className="text-2xl font-bold text-primary">{result.value}</div>
                                                    <div className="text-xs text-muted-foreground">{result.metric}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Testimonial */}
                                        <blockquote className="glass-card p-4 rounded-xl">
                                            <p className="text-sm italic text-muted-foreground mb-2">
                                                "{study.testimonial.quote}"
                                            </p>
                                            <footer className="text-sm">
                                                <span className="font-semibold text-foreground">{study.testimonial.author}</span>
                                                <span className="text-muted-foreground"> — {study.testimonial.role}</span>
                                            </footer>
                                        </blockquote>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20">
                    <div className="container mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="glass-card p-12 rounded-3xl text-center relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
                            <div className="relative z-10">
                                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                                    Ready to Be Our Next Success Story?
                                </h2>
                                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                                    Let's discuss how we can help transform your business with custom software solutions.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link href="/calculator">
                                        <Button variant="hero" size="lg">
                                            Get Project Estimate
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </Button>
                                    </Link>
                                    <Link href="/consultation">
                                        <Button variant="outline" size="lg">
                                            Book Free Consultation
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>


            </div>
        </PageTransition>
    )
}
