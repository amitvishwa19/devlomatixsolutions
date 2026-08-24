'use client'
import React from 'react'
import { motion } from "framer-motion";
import { Code2, Cpu, Globe, Layers, Rocket, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from '../_components/PageTransition';

const services = [
    {
        icon: Code2,
        title: "Custom Software Development",
        description: "Tailored solutions built from scratch to meet your unique business requirements and scale with your growth.",
        features: ["Full-stack development", "API design & integration", "Database architecture", "Performance optimization"],
    },
    {
        icon: Cpu,
        title: "Process Automation",
        description: "Streamline operations with intelligent automation that reduces manual work and eliminates errors.",
        features: ["Workflow automation", "Data processing pipelines", "Business rule engines", "Integration platforms"],
    },
    {
        icon: Globe,
        title: "Web & Mobile Apps",
        description: "Beautiful, responsive applications that deliver exceptional user experiences across all platforms.",
        features: ["Progressive web apps", "Native mobile apps", "Cross-platform solutions", "UI/UX design"],
    },
    {
        icon: Layers,
        title: "System Integration",
        description: "Connect disparate systems and data sources for seamless information flow across your organization.",
        features: ["API development", "Legacy system integration", "Data synchronization", "Middleware solutions"],
    },
    {
        icon: Shield,
        title: "Cloud Solutions",
        description: "Secure, scalable cloud infrastructure and migration services to modernize your tech stack.",
        features: ["Cloud migration", "Infrastructure as code", "DevOps practices", "Security compliance"],
    },
    {
        icon: Rocket,
        title: "MVP Development",
        description: "Rapidly prototype and launch your product to market with our agile development approach.",
        features: ["Rapid prototyping", "Market validation", "Iterative development", "Launch support"],
    },
];
export default function ServicePage() {
    return (
        <PageTransition>
            <div className="min-h-screen bg-background">


                {/* Hero Section */}
                <section className="pt-32 pb-20 relative overflow-hidden">
                    <div className="absolute inset-0 grid-pattern opacity-25 pointer-events-none" />
                    <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] orb-primary rounded-full blur-[100px] opacity-40 pointer-events-none" />
                    <div className="container mx-auto px-6 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center max-w-3xl mx-auto"
                        >
                            <span className="text-primary text-xs font-semibold tracking-wider uppercase bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Our Services</span>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-5 mb-5 text-foreground">
                                End-to-End <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-orange-500 to-amber-500">Tech Solutions</span>
                            </h1>
                            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto font-normal">
                                From ideation to deployment, we provide comprehensive software services
                                that empower businesses to thrive in the digital age.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Services Grid */}
                <section className="py-20">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {services.map((service, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                    className="group glass-card p-8 hover:border-primary/50 transition-all duration-300"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 via-blue-500/10 to-accent/15 border border-primary/20 flex items-center justify-center mb-6 shadow-xs group-hover:scale-110 group-hover:shadow-[0_0_25px_hsl(var(--primary)/0.25)] transition-all duration-300">
                                        <service.icon className="w-7 h-7 text-primary" />
                                    </div>
                                    <h3 className="font-display text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                                        {service.title}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed mb-6 text-sm md:text-base">
                                        {service.description}
                                    </p>
                                    <ul className="space-y-2.5 pt-4 border-t border-border/40">
                                        {service.features.map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20">
                    <div className="container mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="glass-card p-12 text-center"
                        >
                            <h2 className="font-display text-3xl md:text-4xl font-extrabold mb-4 text-foreground">
                                Ready to Start Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600 to-indigo-600">Project</span>?
                            </h2>
                            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                                Let's discuss how we can help transform your business with our technology solutions.
                            </p>
                            <Button variant="hero" size="xl">
                                Get in Touch
                            </Button>
                        </motion.div>
                    </div>
                </section>


            </div>
        </PageTransition>
    )
}
