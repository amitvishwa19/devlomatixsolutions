'use client'
import React from 'react'
import { motion } from "framer-motion";
import { Target, Heart, Zap, Users, Award, Globe, MapPin, Calendar, Briefcase, GraduationCap } from "lucide-react";
import PageTransition from '../components/PageTransition';

const team = [
    {
        name: "Arjun Mehta",
        role: "Founder & CEO",
        bio: "15+ years leading tech innovation across Fortune 500 companies. Former VP of Engineering at TCS.",
    },
    {
        name: "Priya Sharma",
        role: "CTO",
        bio: "Former Google engineer with expertise in scalable architecture. PhD in Computer Science from IIT Delhi.",
    },
    {
        name: "Vikram Patel",
        role: "Head of Design",
        bio: "Award-winning designer with work featured in Awwwards. Previously led design at Flipkart.",
    },
    {
        name: "Ananya Reddy",
        role: "Lead Developer",
        bio: "Full-stack expert passionate about clean, maintainable code. Open source contributor.",
    },
    {
        name: "Karthik Iyer",
        role: "Operations Director",
        bio: "MBA from IIM Bangalore. 10+ years ensuring seamless project delivery and client satisfaction.",
    },
    {
        name: "Neha Gupta",
        role: "Head of Automation",
        bio: "Specialist in AI-driven process optimization. Former ML researcher at Microsoft Research India.",
    },
];

const values = [
    {
        icon: Target,
        title: "Excellence",
        description: "We set the highest standards and deliver nothing less than exceptional quality in every project.",
    },
    {
        icon: Heart,
        title: "Client-First",
        description: "Your success is our success. We build lasting partnerships based on trust and transparency.",
    },
    {
        icon: Zap,
        title: "Innovation",
        description: "We embrace cutting-edge technologies to create solutions that keep you ahead of the curve.",
    },
    {
        icon: Users,
        title: "Collaboration",
        description: "Great solutions emerge from diverse perspectives working together toward a common goal.",
    },
];

const stats = [
    { value: "2016", label: "Founded" },
    { value: "150+", label: "Projects Completed" },
    { value: "50+", label: "Team Members" },
    { value: "12", label: "Countries Served" },
];

const timeline = [
    {
        year: "2016",
        title: "The Beginning",
        description: "Started as a 4-person team with a vision to democratize enterprise-grade software.",
    },
    {
        year: "2018",
        title: "First Major Client",
        description: "Partnered with a Fortune 500 company, establishing our reputation for enterprise solutions.",
    },
    {
        year: "2020",
        title: "Automation Division",
        description: "Launched our AI & automation practice, helping businesses streamline operations.",
    },
    {
        year: "2022",
        title: "Global Expansion",
        description: "Opened offices in Bangalore and Hyderabad, serving clients across 12 countries.",
    },
    {
        year: "2024",
        title: "50+ Team Members",
        description: "Grew to a diverse team of world-class engineers, designers, and strategists.",
    },
];

const offices = [
    {
        city: "Gurugram",
        address: "Cyber Hub, DLF Phase 2",
        type: "Headquarters",
    },
    {
        city: "Bangalore",
        address: "Koramangala, 5th Block",
        type: "Tech Hub",
    },
    {
        city: "Hyderabad",
        address: "HITEC City, Madhapur",
        type: "Development Center",
    },
];

const careers = [
    {
        title: "Senior Full-Stack Developer",
        location: "Remote / Gurugram",
        type: "Full-time",
    },
    {
        title: "UI/UX Designer",
        location: "Remote / Bangalore",
        type: "Full-time",
    },
    {
        title: "DevOps Engineer",
        location: "Remote",
        type: "Full-time",
    },
    {
        title: "Project Manager",
        location: "Hyderabad",
        type: "Full-time",
    },
];

export default function AboutPage() {
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
                            <span className="text-primary text-sm font-medium tracking-wider uppercase">About Us</span>
                            <h1 className="font-display text-4xl md:text-6xl font-bold mt-4 mb-6">
                                Driving Digital{" "}
                                <span className="gradient-text">Transformation</span>
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                We're a team of passionate technologists, designers, and strategists
                                dedicated to building software that transforms businesses and creates
                                lasting impact.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Story Section */}
                <section className="py-20">
                    <div className="container mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                            >
                                <span className="text-primary text-sm font-medium tracking-wider uppercase">Our Story</span>
                                <h2 className="font-display text-3xl md:text-4xl font-bold mt-4 mb-6">
                                    From Vision to <span className="gradient-text">Reality</span>
                                </h2>
                                <div className="space-y-4 text-muted-foreground leading-relaxed">
                                    <p>
                                        Founded in 2016, AcsTechHub began with a simple mission: to bridge the gap
                                        between ambitious business goals and the technology needed to achieve them.
                                    </p>
                                    <p>
                                        What started as a small team of four developers has grown into a
                                        full-service software agency with over 50 talented professionals across
                                        design, development, automation, and strategy.
                                    </p>
                                    <p>
                                        Today, we partner with startups, enterprises, and everything in between,
                                        delivering solutions that drive real business outcomes. Our commitment to
                                        excellence and innovation remains at the heart of everything we do.
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                                className="grid grid-cols-2 gap-4"
                            >
                                {stats.map((stat, index) => (
                                    <div
                                        key={index}
                                        className="glass-card p-6 text-center hover:border-primary/50 transition-colors duration-300"
                                    >
                                        <div className="font-display text-3xl md:text-4xl font-bold gradient-text mb-2">
                                            {stat.value}
                                        </div>
                                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Timeline Section */}
                <section className="py-20 bg-card/30">
                    <div className="container mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <span className="text-primary text-sm font-medium tracking-wider uppercase">Our Journey</span>
                            <h2 className="font-display text-3xl md:text-4xl font-bold mt-4 mb-6">
                                Key <span className="gradient-text">Milestones</span>
                            </h2>
                        </motion.div>

                        <div className="max-w-4xl mx-auto">
                            {timeline.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="flex gap-6 mb-8 last:mb-0"
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-[hsl(260,100%,65%)] flex items-center justify-center flex-shrink-0">
                                            <Calendar className="w-5 h-5 text-primary-foreground" />
                                        </div>
                                        {index < timeline.length - 1 && (
                                            <div className="w-0.5 h-full bg-border/50 mt-2" />
                                        )}
                                    </div>
                                    <div className="glass-card p-6 flex-1 hover:border-primary/50 transition-colors duration-300">
                                        <span className="text-primary font-display font-bold">{item.year}</span>
                                        <h3 className="font-display text-xl font-semibold text-foreground mt-1">
                                            {item.title}
                                        </h3>
                                        <p className="text-muted-foreground mt-2">{item.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-20">
                    <div className="container mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <span className="text-primary text-sm font-medium tracking-wider uppercase">Our Values</span>
                            <h2 className="font-display text-3xl md:text-4xl font-bold mt-4 mb-6">
                                What <span className="gradient-text">Drives Us</span>
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Our core values shape every decision we make and every solution we build.
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {values.map((value, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="glass-card p-6 text-center hover:border-primary/50 transition-all duration-300"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-[hsl(260,100%,65%,0.2)] flex items-center justify-center mx-auto mb-4">
                                        <value.icon className="w-7 h-7 text-primary" />
                                    </div>
                                    <h3 className="font-display text-lg font-semibold mb-2 text-foreground">
                                        {value.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {value.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section id="about" className="py-20 bg-card/30">
                    <div className="container mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <span className="text-primary text-sm font-medium tracking-wider uppercase">Our Team</span>
                            <h2 className="font-display text-3xl md:text-4xl font-bold mt-4 mb-6">
                                Meet the <span className="gradient-text">Experts</span>
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                A diverse team of talented individuals united by a passion for technology and innovation.
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {team.map((member, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -8 }}
                                    className="glass-card p-6 group hover:border-primary/50 transition-all duration-300"
                                >
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-[hsl(260,100%,65%)] flex items-center justify-center mb-4 group-hover:shadow-[0_0_30px_hsl(192,100%,50%,0.3)] transition-shadow duration-300">
                                        <span className="font-display text-2xl font-bold text-primary-foreground">
                                            {member.name.split(" ").map(n => n[0]).join("")}
                                        </span>
                                    </div>
                                    <h3 className="font-display text-xl font-semibold text-foreground">
                                        {member.name}
                                    </h3>
                                    <p className="text-primary text-sm font-medium mb-2">{member.role}</p>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {member.bio}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Offices Section */}
                <section className="py-20">
                    <div className="container mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <span className="text-primary text-sm font-medium tracking-wider uppercase">Our Offices</span>
                            <h2 className="font-display text-3xl md:text-4xl font-bold mt-4 mb-6">
                                Global <span className="gradient-text">Presence</span>
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                With offices across three continents, we're always close to our clients.
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {offices.map((office, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="glass-card p-6 text-center hover:border-primary/50 transition-all duration-300"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-[hsl(260,100%,65%,0.2)] flex items-center justify-center mx-auto mb-4">
                                        <MapPin className="w-6 h-6 text-primary" />
                                    </div>
                                    <span className="text-xs text-primary font-medium uppercase tracking-wider">
                                        {office.type}
                                    </span>
                                    <h3 className="font-display text-xl font-semibold text-foreground mt-2">
                                        {office.city}
                                    </h3>
                                    <p className="text-muted-foreground text-sm mt-2">{office.address}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Careers Section */}
                <section className="py-20 bg-card/30">
                    <div className="container mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <span className="text-primary text-sm font-medium tracking-wider uppercase">Careers</span>
                            <h2 className="font-display text-3xl md:text-4xl font-bold mt-4 mb-6">
                                Join Our <span className="gradient-text">Team</span>
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                We're always looking for talented individuals who share our passion for innovation.
                            </p>
                        </motion.div>

                        <div className="max-w-3xl mx-auto space-y-4">
                            {careers.map((job, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/50 transition-all duration-300 group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-[hsl(260,100%,65%,0.2)] flex items-center justify-center flex-shrink-0">
                                            <Briefcase className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                                                {job.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">{job.location}</p>
                                        </div>
                                    </div>
                                    <span className="px-4 py-2 rounded-lg bg-secondary/50 text-sm font-medium text-muted-foreground">
                                        {job.type}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />

                    <div className="container mx-auto px-6 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="max-w-3xl mx-auto text-center"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-[hsl(260,100%,65%,0.2)] mb-6">
                                <Globe className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                                Our <span className="gradient-text">Mission</span>
                            </h2>
                            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                                "To empower businesses worldwide with innovative technology solutions
                                that unlock their full potential and drive sustainable growth in an
                                ever-evolving digital landscape."
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-6">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50">
                                    <Award className="w-5 h-5 text-primary" />
                                    <span className="text-sm text-muted-foreground">ISO 27001 Certified</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50">
                                    <Users className="w-5 h-5 text-primary" />
                                    <span className="text-sm text-muted-foreground">AWS Partners</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50">
                                    <GraduationCap className="w-5 h-5 text-primary" />
                                    <span className="text-sm text-muted-foreground">Google Cloud Partner</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>


            </div>
        </PageTransition>
    )
}
