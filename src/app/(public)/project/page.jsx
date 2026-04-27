'use client'
import React from 'react'
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";
import PageTransition from '../_components/PageTransition';
import ContactDialog from '../_components/ContactDialog';
import ProjectInquiryDialog from '../_components/ProjectInquiryDialog';

const projects = [
    {
        title: "Curexa",
        category: "Healthcare",
        description: "A modern healthcare platform providing comprehensive patient care services, wellness programs, and health management tools for individuals and families.",
        tech: ["React", "Node.js", "PostgreSQL", "Tailwind CSS", "AWS"],
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop",
        results: "Live platform serving real patients and caregivers",
        link: "https://curexa.devlomatix.com",
    },
    {
        title: "FinanceFlow",
        category: "Fintech",
        description: "An AI-powered financial analytics dashboard for enterprise clients. Real-time data visualization, predictive analytics, and automated reporting.",
        tech: ["Next.js", "Python", "TensorFlow", "Redis", "GCP"],
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
        results: "3x faster report generation, 99.9% uptime",
        link: null,
    },
    {
        title: "LogiTrack",
        category: "Logistics",
        description: "End-to-end supply chain management system with real-time tracking, route optimization, and inventory management capabilities.",
        tech: ["Vue.js", "Go", "MongoDB", "Docker", "Kubernetes"],
        image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop",
        results: "30% cost reduction in logistics operations",
        link: null,
    },
    {
        title: "EduLearn LMS",
        category: "Education",
        description: "A modern learning management system with interactive courses, progress tracking, gamification, and AI-powered personalized learning paths.",
        tech: ["React", "Django", "PostgreSQL", "OpenAI", "AWS"],
        image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=600&fit=crop",
        results: "200K+ students enrolled, 95% course completion rate",
        link: null,
    },
    {
        title: "RetailPro",
        category: "E-commerce",
        description: "A headless commerce platform with multi-channel selling, inventory sync, and advanced analytics for retail businesses.",
        tech: ["Next.js", "Shopify API", "GraphQL", "Stripe", "Vercel"],
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
        results: "$2M+ monthly transactions processed",
        link: null,
    },
    {
        title: "AutomateHQ",
        category: "Automation",
        description: "A no-code workflow automation platform enabling businesses to connect apps and automate repetitive tasks with visual builders.",
        tech: ["TypeScript", "Node.js", "Redis", "PostgreSQL", "Docker"],
        image: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&h=600&fit=crop",
        results: "500+ integrations, 1M+ workflows executed monthly",
        link: null,
    },
    {
        title: "HealthGPT",
        category: "AI & Healthcare",
        description: "AI-powered health assistant that helps users understand medical reports and symptoms through a secure, HIPAA-compliant interface.",
        tech: ["Next.js", "OpenAI API", "Supabase", "Tailwind CSS"],
        image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop",
        results: "98% accuracy in medical terminology analysis",
        link: null,
    },
    {
        title: "EcoTrack",
        category: "Sustainability",
        description: "Sustainability dashboard for businesses to monitor carbon footprint, manage waste, and track renewable energy adoption with real-time analytics.",
        tech: ["React", "D3.js", "Node.js", "PostgreSQL"],
        image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop",
        results: "Helped clients reduce carbon emissions by 15%",
        link: null,
    },
    {
        title: "CryptoVault",
        category: "Fintech",
        description: "Secure, multi-signature wallet platform for institutional investors with real-time asset valuation and compliance reporting.",
        tech: ["Solidity", "Ethers.js", "React", "Hardhat"],
        image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&h=600&fit=crop",
        results: "$500M+ in digital assets secured",
        link: null,
    },
    {
        title: "LearnLoop",
        category: "Education",
        description: "Adaptive learning platform using ML to personalize course content based on student performance and learning style.",
        tech: ["Vue.js", "Python", "Scikit-learn", "AWS"],
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop",
        results: "40% improvement in student engagement scores",
        link: null,
    },
];

export default function ProjectPage() {
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isProjectInquiryOpen, setIsProjectInquiryOpen] = useState(false);
    return (
        <PageTransition>
            <div className="min-h-screen bg-background">


                {/* Hero Section */}
                <section className="relative pt-32 pb-20 overflow-hidden">
                    <div className="absolute inset-0 grid-pattern opacity-30" />
                    <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-primary/15 rounded-full blur-[120px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[hsl(260,100%,65%,0.15)] rounded-full blur-[100px]" />

                    <div className="container mx-auto px-6 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="max-w-3xl mx-auto text-center"
                        >
                            <span className="text-primary text-sm font-medium tracking-wider uppercase">Our Work</span>
                            <h1 className="font-display text-4xl md:text-6xl font-bold mt-4 mb-6">
                                Featured{" "}
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Projects</span>
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                Explore our portfolio of successful projects across various industries.
                                Each solution is crafted to solve real business challenges.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Projects Grid */}
                <section className="py-20">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {projects.map((project, index) => (
                                <motion.article
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -8 }}
                                    className={`group glass-card overflow-hidden hover:border-primary/50 transition-all duration-300 ${project.link ? "cursor-pointer" : ""}`}
                                    onClick={() => project.link && window.open(project.link, "_blank", "noopener,noreferrer")}
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={project.image}
                                            alt={project.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                                        <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium backdrop-blur-sm">
                                            {project.category}
                                        </span>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                                            {project.title}
                                            {project.link && <span className="ml-2 text-xs text-muted-foreground">↗</span>}
                                        </h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
                                            {project.description}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {project.tech.slice(0, 4).map((tech, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-1 rounded-md bg-secondary/50 text-xs text-muted-foreground"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                                            <p className="text-xs text-primary font-medium">{project.results}</p>
                                            {project.link && (
                                                <span className="text-xs text-primary font-medium">Visit Site ↗</span>
                                            )}
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />

                    <div className="container mx-auto px-6 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="max-w-2xl mx-auto text-center"
                        >
                            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                                Ready to Build Your{" "}
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Next Project?</span>
                            </h2>
                            <p className="text-muted-foreground text-lg mb-8">
                                Let's discuss how we can help bring your vision to life with our expertise.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button
                                    variant="hero"
                                    size="xl"
                                    onClick={() => setIsProjectInquiryOpen(true)}
                                >
                                    Start Your Project
                                </Button>
                                <Button
                                    variant="heroOutline"
                                    size="xl"
                                    onClick={() => setIsContactOpen(true)}
                                >
                                    Start a Conversation
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </section>



                {/* Dialogs */}
                <ContactDialog isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
                <ProjectInquiryDialog isOpen={isProjectInquiryOpen} onClose={() => setIsProjectInquiryOpen(false)} />
            </div>
        </PageTransition>
    )
}
