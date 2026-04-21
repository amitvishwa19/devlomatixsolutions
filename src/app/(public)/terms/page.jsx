'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronRight, 
    BookOpen, 
    ShieldCheck, 
    Users, 
    Ban, 
    Clock, 
    AlertCircle, 
    Gavel, 
    Mail,
    ArrowUp
} from 'lucide-react';

const sections = [
    { id: 'agreement', title: '1. Agreement', icon: BookOpen },
    { id: 'ip', title: '2. Intellectual Property', icon: ShieldCheck },
    { id: 'representations', title: '3. User Representations', icon: Users },
    { id: 'prohibited', title: '4. Prohibited Activities', icon: Ban },
    { id: 'termination', title: '5. Termination', icon: Clock },
    { id: 'liability', title: '6. Liability', icon: AlertCircle },
    { id: 'governing', title: '7. Governing Law', icon: Gavel },
    { id: 'contact', title: '8. Contact Us', icon: Mail },
];

const TermsPage = () => {
    const lastUpdated = "March 24, 2024";
    const [activeSection, setActiveSection] = useState('agreement');
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);

            const scrollPosition = window.scrollY + 200;
            for (const section of sections) {
                const element = document.getElementById(section.id);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(section.id);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    return (
        <main className="flex-grow bg-background">
            {/* Hero Section */}
            <section className="relative py-24 overflow-hidden border-b border-border/50 bg-card/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,hsl(var(--primary)/0.15),transparent_50%)]" />
                <div className="container relative mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-display font-bold text-foreground mb-6 bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
                            Terms of Service
                        </h1>
                        <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
                            A clear and comprehensive guide to our services, mutual responsibilities, and legal commitments at Devlomatix Solutions.
                        </p>
                        <div className="mt-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold backdrop-blur-sm">
                            <Clock size={16} />
                            Last Updated: {lastUpdated}
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="py-20 relative">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-16">
                        
                        {/* Sidebar Navigation */}
                        <aside className="lg:w-72 shrink-0">
                            <div className="sticky top-28 space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/50 px-4">Navigation</h3>
                                <nav className="space-y-1">
                                    {sections.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => scrollToSection(section.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                                                activeSection === section.id 
                                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]' 
                                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                            }`}
                                        >
                                            <section.icon size={18} className={activeSection === section.id ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'} />
                                            <span className="text-sm font-medium">{section.title.split('. ')[1]}</span>
                                            {activeSection === section.id && (
                                                <motion.div layoutId="active-nav" className="ml-auto">
                                                    <ChevronRight size={14} />
                                                </motion.div>
                                            )}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </aside>

                        {/* Content Area */}
                        <div className="flex-grow max-w-4xl space-y-20">
                            
                            <motion.section 
                                id="agreement"
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="scroll-mt-32 p-8 rounded-3xl border border-border/50 bg-card/30 backdrop-blur-md relative overflow-hidden group hover:border-primary/30 transition-colors"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                                <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <BookOpen size={20} />
                                    </div>
                                    1. Agreement to Terms
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-lg">
                                    These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Devlomatix Solutions ("we," "us" or "our"), concerning your access to and use of our website and services.
                                </p>
                                <p className="mt-4 text-muted-foreground leading-relaxed">
                                    By accessing our services, you confirm that you have read, understood, and agreed to be bound by all of these Terms of Service. If you do not agree with all of these terms, then you are expressly prohibited from using the Site and you must discontinue use immediately.
                                </p>
                            </motion.section>

                            <motion.section 
                                id="ip"
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="scroll-mt-32 p-8 rounded-3xl border border-border/50 bg-card/30 backdrop-blur-md relative overflow-hidden group hover:border-primary/30 transition-colors"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                                <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <ShieldCheck size={20} />
                                    </div>
                                    2. Intellectual Property Rights
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Unless otherwise indicated, the Site and Services are our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us.
                                </p>
                                <p className="mt-4 text-muted-foreground leading-relaxed italic border-l-4 border-primary/20 pl-6 bg-primary/5 py-4 rounded-r-xl">
                                    The Content and Marks are provided on the Site "AS IS" for your information and personal use only. Except as expressly provided in these Terms of Service, no part of the Site and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
                                </p>
                            </motion.section>

                            <motion.section 
                                id="representations"
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="scroll-mt-32 p-8 rounded-3xl border border-border/50 bg-card/30 backdrop-blur-md relative overflow-hidden group hover:border-primary/30 transition-colors"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                                <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <Users size={20} />
                                    </div>
                                    3. User Representations
                                </h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {[
                                        "All registration information you submit will be true, accurate, current, and complete.",
                                        "You will maintain the accuracy of such information and promptly update it as necessary.",
                                        "You have the legal capacity and you agree to comply with these Terms of Service.",
                                        "You are not a minor in the jurisdiction in which you reside.",
                                        "You will not access the Site through automated or non-human means.",
                                        "You will not use the Site for any illegal or unauthorized purpose."
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
                                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                            </div>
                                            <span className="text-sm text-muted-foreground">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>

                            <motion.section 
                                id="prohibited"
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="scroll-mt-32 p-8 rounded-3xl border border-border/50 bg-card/30 backdrop-blur-md relative overflow-hidden group hover:border-primary/30 transition-colors"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                                <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <Ban size={20} />
                                    </div>
                                    4. Prohibited Activities
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    You may not access or use the Site for any purpose other than that for which we make the Site available. Prohibited activities include but are not limited to:
                                </p>
                                <ul className="mt-4 space-y-3 text-muted-foreground pl-2">
                                    <li className="flex gap-4">
                                        <span className="text-primary font-bold">•</span>
                                        <span>Systematically retrieving data to create a collection or database.</span>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="text-primary font-bold">•</span>
                                        <span>Tricking, defrauding, or misleading us and other users.</span>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="text-primary font-bold">•</span>
                                        <span>Circumventing security features of the Site.</span>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="text-primary font-bold">•</span>
                                        <span>Harassing, annoying, or threatening our employees or agents.</span>
                                    </li>
                                </ul>
                            </motion.section>

                            <motion.section 
                                id="termination"
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="scroll-mt-32 p-8 rounded-3xl border border-border/50 bg-card/30 backdrop-blur-md relative overflow-hidden group hover:border-primary/30 transition-colors"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                                <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <Clock size={20} />
                                    </div>
                                    5. Term and Termination
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    These Terms of Service shall remain in full force and effect while you use the Site. WITHOUT LIMITING ANY OTHER PROVISION, WE RESERVE THE RIGHT TO DENY ACCESS TO AND USE OF THE SITE TO ANY PERSON FOR ANY REASON.
                                </p>
                            </motion.section>

                            <motion.section 
                                id="liability"
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="scroll-mt-32 p-8 rounded-3xl border border-border/50 bg-card/30 backdrop-blur-md relative overflow-hidden group hover:border-primary/30 transition-colors"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                                <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <AlertCircle size={20} />
                                    </div>
                                    6. Limitation of Liability
                                </h2>
                                <p className="text-muted-foreground leading-relaxed bg-destructive/5 border border-destructive/10 p-6 rounded-2xl italic">
                                    IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SITE.
                                </p>
                            </motion.section>

                            <motion.section 
                                id="governing"
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="scroll-mt-32 p-8 rounded-3xl border border-border/50 bg-card/30 backdrop-blur-md relative overflow-hidden group hover:border-primary/30 transition-colors"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                                <h2 className="text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <Gavel size={20} />
                                    </div>
                                    7. Governing Law
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    These Terms of Service and your use of the Site are governed by and construed in accordance with the laws of applicable jurisdiction, without regard to its conflict of law principles.
                                </p>
                            </motion.section>

                            <motion.section 
                                id="contact"
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="scroll-mt-32 p-8 rounded-3xl border border-primary/20 bg-primary/5 relative overflow-hidden"
                            >
                                <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mb-32 blur-3xl" />
                                <h2 className="text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                                        <Mail size={20} />
                                    </div>
                                    8. Contact Us
                                </h2>
                                <p className="text-muted-foreground leading-relaxed mb-8">
                                    Questions or complaints? We're here to help you understand our terms and ensure a great experience.
                                </p>
                                <a 
                                    href="mailto:legal@devlomatixsolutions.com" 
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                                >
                                    Email Legal Team <ChevronRight size={18} />
                                </a>
                            </motion.section>

                        </div>
                    </div>
                </div>
            </section>

            {/* Scroll to top button */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="fixed bottom-8 right-8 p-3 rounded-full bg-primary text-primary-foreground shadow-2xl z-50 hover:bg-primary/90 transition-colors"
                    >
                        <ArrowUp size={24} />
                    </motion.button>
                )}
            </AnimatePresence>
        </main>
    );
};

export default TermsPage;
