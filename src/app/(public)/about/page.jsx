'use client'
import { motion } from "framer-motion";
import { Target, Eye, Heart, Award, Users, Globe, Shield, Zap } from "lucide-react";

const values = [
    {
        icon: Heart,
        title: "Patient-Centric",
        description: "Every feature we build prioritizes patient outcomes and care quality."
    },
    {
        icon: Shield,
        title: "Security First",
        description: "HIPAA-compliant infrastructure with enterprise-grade data protection."
    },
    {
        icon: Zap,
        title: "Innovation",
        description: "Continuously evolving with the latest healthcare technology trends."
    },
    {
        icon: Users,
        title: "Collaboration",
        description: "Building solutions through partnership with healthcare professionals."
    },
];

const stats = [
    { value: "500+", label: "Hospitals" },
    { value: "15M+", label: "Patients Served" },
    { value: "50+", label: "Countries" },
    { value: "99.9%", label: "Uptime" },
];

const team = [
    {
        name: "Dr. Sarah Chen",
        role: "Chief Executive Officer",
        description: "Former Chief Medical Officer with 20+ years in healthcare technology.",
    },
    {
        name: "Michael Rodriguez",
        role: "Chief Technology Officer",
        description: "Led engineering teams at major health-tech companies for 15 years.",
    },
    {
        name: "Dr. James Okonkwo",
        role: "Chief Medical Advisor",
        description: "Practicing physician and healthcare informatics expert.",
    },
    {
        name: "Emily Watson",
        role: "VP of Product",
        description: "Passionate about creating intuitive healthcare software solutions.",
    },
];
const About = () => {


    return (
        <div className="min-h-screen bg-background w-full">

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
                                About HospitalHMS
                            </span>
                            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                                Transforming Healthcare{" "}
                                <span className="text-primary">Through Technology</span>
                            </h1>
                            <p className="text-lg md:text-md text-muted-foreground max-w-2xl mx-auto">
                                We're on a mission to make healthcare management simpler, more efficient,
                                and more accessible for hospitals of all sizes around the world.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Mission & Vision */}
                <section className="py-16 md:py-24">
                    <div className="container mx-auto px-4 md:px-8">
                        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
                            >
                                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                                    <Target className="w-7 h-7 text-primary" />
                                </div>
                                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                                    Our Mission
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    To empower healthcare institutions with innovative, integrated technology
                                    solutions that enhance patient care, streamline operations, and drive
                                    better health outcomes for communities worldwide.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
                            >
                                <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center mb-6">
                                    <Eye className="w-7 h-7 text-accent-foreground" />
                                </div>
                                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                                    Our Vision
                                </h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    To be the global standard for hospital management systems, recognized
                                    for excellence in healthcare technology innovation and our unwavering
                                    commitment to improving patient outcomes.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className="py-16 md:py-20 bg-secondary/30">
                    <div className="container mx-auto px-4 md:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="text-center"
                                >
                                    <div className="font-display text-4xl md:text-5xl font-bold text-primary mb-2">
                                        {stat.value}
                                    </div>
                                    <div className="text-muted-foreground font-medium">
                                        {stat.label}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Values */}
                <section className="py-16 md:py-24">
                    <div className="container mx-auto px-4 md:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-12"
                        >
                            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                                Our Core Values
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                The principles that guide everything we do
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {values.map((value, index) => (
                                <motion.div
                                    key={value.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="p-6 rounded-2xl bg-card border border-border text-center hover:border-primary/50 transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                        <value.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                                        {value.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm">
                                        {value.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Team */}
                {/* <section className="py-16 md:py-24 bg-secondary/30">
                    <div className="container mx-auto px-4 md:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-12"
                        >
                            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                                Leadership Team
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Experienced professionals dedicated to transforming healthcare
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {team.map((member, index) => (
                                <motion.div
                                    key={member.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow"
                                >
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl font-bold text-primary-foreground">
                                            {member.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                    <h3 className="font-display text-lg font-semibold text-foreground text-center mb-1">
                                        {member.name}
                                    </h3>
                                    <p className="text-primary text-sm text-center mb-3">
                                        {member.role}
                                    </p>
                                    <p className="text-muted-foreground text-sm text-center">
                                        {member.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section> */}

                {/* Global Presence */}
                <section className="py-16 md:py-24 bg-secondary/30">
                    <div className="container mx-auto px-4 md:px-8">
                        <div className="flex flex-col lg:flex-row items-center gap-12">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="flex-1"
                            >
                                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                                    <Globe className="w-7 h-7 text-primary" />
                                </div>
                                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                                    Global Presence
                                </h2>
                                <p className="text-muted-foreground leading-relaxed mb-6">
                                    With installations in over 50 countries across 6 continents, HospitalHMS
                                    is trusted by healthcare institutions of all sizes—from small clinics to
                                    large hospital networks.
                                </p>
                                <ul className="space-y-3">
                                    {["24/7 Global Support", "Multi-language Interface", "Local Compliance Ready", "Regional Data Centers"].map((item) => (
                                        <li key={item} className="flex items-center gap-3 text-foreground">
                                            <Award className="w-5 h-5 text-primary" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="flex-1 w-full"
                            >
                                <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 border border-border flex items-center justify-center">
                                    <Globe className="w-24 h-24 text-primary/40" />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </main>

        </div>
    );
};

export default About;
