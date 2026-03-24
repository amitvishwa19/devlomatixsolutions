import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";


import heroDashboard from "@/app/(public)/assets/hero-dashboard.jpg";
import ProjectInquiryDialog from "./ProjectInquiryDialog";

const Hero = () => {
    const [isProjectInquiryOpen, setIsProjectInquiryOpen] = useState(false);

    return (
        <div className=" w-full">

            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 w-full ">
                {/* Background gradient for light theme */}
                <div className="absolute inset-0 bg-gradient-to-b from-background via-[hsl(230,40%,97%)] to-background dark:from-background dark:via-background dark:to-background" />

                {/* Background Effects */}
                <div className="absolute inset-0 grid-pattern opacity-40" />

                {/* Colorful orbs */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] orb-primary rounded-full blur-[80px] animate-pulse-glow" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] orb-secondary rounded-full blur-[60px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
                <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] orb-tertiary rounded-full blur-[70px] animate-pulse-glow" style={{ animationDelay: "0.8s" }} />

                {/* Dark theme fallback orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-glow dark:block hidden" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[hsl(260,100%,65%,0.2)] rounded-full blur-[100px] animate-pulse-glow dark:block hidden" style={{ animationDelay: "1.5s" }} />

                {/* Floating Elements */}
                <motion.div
                    className="absolute top-32 right-20 w-20 h-20 glass-card  items-center justify-center hidden lg:flex"
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                    <span className="text-3xl">⚡</span>
                </motion.div>
                <motion.div
                    className="absolute bottom-40 left-20 w-16 h-16 glass-card  items-center justify-center hidden lg:flex"
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                    <span className="text-2xl">🚀</span>
                </motion.div>

                <div className=" mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="text-center lg:text-left">
                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 mb-8"
                            >
                                <Sparkles className="w-4 h-4 text-primary" />
                                <span className="text-sm text-muted-foreground">Transforming Ideas into Digital Reality</span>
                            </motion.div>

                            {/* Main Heading */}
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
                            >
                                We Build{" "}
                                <span className="gradient-text">Software</span>
                                <br />
                                That Drives Growth
                            </motion.h1>

                            {/* Subheading */}
                            <motion.p
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8"
                            >
                                From custom software development to intelligent automation, we deliver
                                end-to-end tech solutions that scale your business and streamline operations.
                            </motion.p>

                            {/* CTA Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4"
                            >
                                <Button
                                    variant="hero"
                                    size="xl"
                                    onClick={() => setIsProjectInquiryOpen(true)}
                                >
                                    Start Your Project
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                                <Button variant="heroOutline" size="xl" asChild>
                                    <Link href="/projects">View Our Work</Link>
                                </Button>
                            </motion.div>

                            {/* Stats */}
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                className="grid grid-cols-3 gap-6 mt-12"
                            >
                                {[
                                    { value: "150+", label: "Projects Delivered" },
                                    { value: "50+", label: "Happy Clients" },
                                    { value: "8+", label: "Years Experience" },
                                ].map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        className="text-center lg:text-left"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4, delay: 0.6 + index * 0.1, type: "spring" }}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                    >
                                        <motion.div
                                            className="font-display text-2xl md:text-3xl font-bold gradient-text"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.8 + index * 0.1 }}
                                        >
                                            {stat.value}
                                        </motion.div>
                                        <div className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Right Image */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative">
                                {/* Glow effect behind image */}
                                <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-[hsl(260,100%,65%,0.3)] rounded-3xl blur-2xl opacity-50" />

                                <img
                                    src={heroDashboard.src}
                                    alt="Modern tech dashboard with data visualizations"
                                    className="relative rounded-2xl border border-border/50 shadow-2xl w-full h-auto"
                                />

                                {/* Floating card overlay */}
                                <motion.div
                                    className="absolute -bottom-6 -left-6 glass-card p-4 shadow-xl"
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <span className="text-green-500 text-lg">✓</span>
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-foreground">Project Delivered</div>
                                            <div className="text-xs text-muted-foreground">Just now</div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Dialog */}
            <ProjectInquiryDialog isOpen={isProjectInquiryOpen} onClose={() => setIsProjectInquiryOpen(false)} />
        </div>
    );
};

export default Hero;
