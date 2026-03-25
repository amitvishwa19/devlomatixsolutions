'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronRight, 
    Info, 
    Database, 
    Activity, 
    Share2, 
    ShieldCheck, 
    Fingerprint, 
    Mail,
    ArrowUp,
    Clock
} from 'lucide-react';

const sections = [
    { id: 'introduction', title: '1. Introduction', icon: Info },
    { id: 'collection', title: '2. Data Collection', icon: Database },
    { id: 'usage', title: '3. Data Usage', icon: Activity },
    { id: 'sharing', title: '4. Data Sharing', icon: Share2 },
    { id: 'security', title: '5. Security', icon: ShieldCheck },
    { id: 'rights', title: '6. Your Rights', icon: Fingerprint },
    { id: 'contact', title: '7. Contact Us', icon: Mail },
];

const PrivacyPage = () => {
    const lastUpdated = "March 24, 2024";
    const [activeSection, setActiveSection] = useState('introduction');
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
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_-20%,hsl(var(--primary)/0.15),transparent_50%)]" />
                <div className="container relative mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-display font-bold text-foreground mb-6 bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
                            Privacy Policy
                        </h1>
                        <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
                            Transparency and trust are the foundation of AcsTechHub. Learn how we handle your data with the highest security standards.
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
                                                <motion.div layoutId="active-nav-privacy" className="ml-auto">
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
                                id="introduction"
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="scroll-mt-32 p-8 rounded-3xl border border-border/50 bg-card/30 backdrop-blur-md relative overflow-hidden group hover:border-primary/30 transition-colors"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                                <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <Info size={20} />
                                    </div>
                                    1. Introduction
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-lg text-balance">
                                    Welcome to AcsTechHub. We are committed to protecting your personal data and your right to privacy. This policy explains what information we collect, how we use it, and what rights you have in relation to it.
                                </p>
                            </motion.section>

                            <motion.section 
                                id="collection"
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="scroll-mt-32 p-8 rounded-3xl border border-border/50 bg-card/30 backdrop-blur-md relative overflow-hidden group hover:border-primary/30 transition-colors"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                                <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <Database size={20} />
                                    </div>
                                    2. Information We Collect
                                </h2>
                                <p className="text-muted-foreground leading-relaxed mb-6">
                                    We collect personal information that you voluntarily provide to us when you register on our platform or engage with our services.
                                </p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {[
                                        { label: "Personal Identifiers", detail: "Name, email address, and contact details." },
                                        { label: "Account Credentials", detail: "Passwords and security info for auth." },
                                        { label: "Usage Data", detail: "Analytics on how you interact with us." },
                                        { label: "Device Info", detail: "IP address, browser type, and OS." }
                                    ].map((item, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors">
                                            <div className="font-bold text-foreground text-sm mb-1">{item.label}</div>
                                            <div className="text-xs text-muted-foreground">{item.detail}</div>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>

                            <motion.section 
                                id="usage"
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="scroll-mt-32 p-8 rounded-3xl border border-border/50 bg-card/30 backdrop-blur-md relative overflow-hidden group hover:border-primary/30 transition-colors"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                                <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <Activity size={20} />
                                    </div>
                                    3. How We Use Your Information
                                </h2>
                                <ul className="space-y-4">
                                    {[
                                        "Facilitating account creation and management.",
                                        "Sending administrative and service-related notifications.",
                                        "Fulfilling and managing your project requests.",
                                        "Delivering targeted content and specialized features.",
                                        "Protecting our services and ensuring platform safety."
                                    ].map((text, i) => (
                                        <li key={i} className="flex items-start gap-4 text-muted-foreground">
                                            <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 text-primary font-bold text-xs">{i + 1}</div>
                                            <p className="leading-relaxed">{text}</p>
                                        </li>
                                    ))}
                                </ul>
                            </motion.section>

                            <motion.section 
                                id="sharing"
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="scroll-mt-32 p-8 rounded-3xl border border-border/50 bg-card/30 backdrop-blur-md relative overflow-hidden group hover:border-primary/30 transition-colors"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                                <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <Share2 size={20} />
                                    </div>
                                    4. Sharing Your Information
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    We only share information with your consent, to comply with laws, to provide you with services, or to protect your rights. <span className="text-foreground font-semibold italic underline decoration-primary/30">We do not sell your personal information to third parties.</span>
                                </p>
                            </motion.section>

                            <motion.section 
                                id="security"
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
                                    5. Data Security
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. Encryption, firewalls, and secure access controls are standard across our platform.
                                </p>
                            </motion.section>

                            <motion.section 
                                id="rights"
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="scroll-mt-32 p-8 rounded-3xl border border-border/50 bg-card/30 backdrop-blur-md relative overflow-hidden group hover:border-primary/30 transition-colors"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                                <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <Fingerprint size={20} />
                                    </div>
                                    6. Your Privacy Rights
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Depending on your location, you may have rights under applicable data protection laws. These include the right to access, rectify, or erase your personal information, or to restrict its processing.
                                </p>
                                <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10 italic text-sm text-muted-foreground">
                                    To exercise any of these rights, please reach out to our privacy officer via the contact information provided below.
                                </div>
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
                                    7. Contact Us
                                </h2>
                                <p className="text-muted-foreground leading-relaxed mb-8">
                                    If you have questions or comments about this policy, we're ready to provide the answers you need.
                                </p>
                                <a 
                                    href="mailto:support@acstechhub.com" 
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                                >
                                    Contact Support <ChevronRight size={18} />
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

export default PrivacyPage;