import { motion } from "framer-motion";
import { ArrowRight, Play, Cloud, FlaskConical, Smartphone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroDashboard from "@/assets/images/public/hero-dashboard.jpg";
import ContactFormModal from "../ContactFormModal";
import PointerLabel from "../PointerLabel";

const highlights = [
    { icon: Cloud, text: "Auto Cloud Backup" },
    { icon: FlaskConical, text: "500+ Pathology Reports" },
    { icon: Smartphone, text: "Mobile App" },
    { icon: Shield, text: "100% Data Security" },
];

const HeroSection = () => {
    return (
        <section className="relative overflow-hidden bg-background min-h-screen flex items-center">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
            </div>

            <div className="container mx-auto px-4 md:px-8 lg:px-16 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-8"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="module-badge"
                        >
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            Trusted by 500+ Healthcare Facilities
                        </motion.div>

                        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                            Complete{" "}
                            <span className="hero-gradient-text">Hospital Management</span>{" "}
                            System
                        </h1>

                        <p className="text-lg md:text-sm text-muted-foreground max-w-xl">
                            15+ integrated modules including OPD/IPD, Pathology with 500+ reports,
                            Pharmacy, Billing & TPA management. All with auto cloud backup.
                        </p>

                        {/* Feature Highlights */}
                        <div className="flex flex-wrap gap-3">
                            {highlights.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-foreground"
                                >
                                    <item.icon className="w-4 h-4 text-primary" />
                                    {item.text}
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <ContactFormModal title="Get Started Free">
                                <Button size="lg" className="hero-gradient text-primary-foreground px-8 py-6 text-lg rounded-xl shadow-glow hover:shadow-xl transition-all">
                                    Get Started Free
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </ContactFormModal>
                            <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-xl border-2 hover:bg-accent transition-all">
                                <Play className="mr-2 h-5 w-5" />
                                Watch Demo
                            </Button>
                        </div>

                        <div className="flex items-center gap-8 pt-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 border-2 border-background flex items-center justify-center"
                                    >
                                        <span className="text-xs font-medium text-primary">
                                            {String.fromCharCode(64 + i)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <svg
                                            key={i}
                                            className="w-5 h-5 fill-star"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground">4.9/5 from 2,000+ reviews</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Content - Hero Image */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative"
                    >
                        <div className="relative">
                            {/* Rotating Dashed Border */}
                            <div className="absolute -inset-6">
                                <svg
                                    className="w-full h-full animate-[spin_20s_linear_infinite]"
                                    viewBox="0 0 100 100"
                                    preserveAspectRatio="none"
                                >
                                    <rect
                                        x="2"
                                        y="2"
                                        width="96"
                                        height="96"
                                        rx="8"
                                        ry="8"
                                        fill="none"
                                        stroke="hsl(var(--primary) / 0.3)"
                                        strokeWidth="0.4"
                                        strokeDasharray="4 2"
                                    />
                                </svg>
                            </div>

                            {/* Second rotating border (opposite direction) */}
                            <div className="absolute -inset-10">
                                <svg
                                    className="w-full h-full animate-[spin_25s_linear_infinite_reverse]"
                                    viewBox="0 0 100 100"
                                    preserveAspectRatio="none"
                                >
                                    <rect
                                        x="2"
                                        y="2"
                                        width="96"
                                        height="96"
                                        rx="10"
                                        ry="10"
                                        fill="none"
                                        stroke="hsl(var(--primary) / 0.2)"
                                        strokeWidth="0.3"
                                        strokeDasharray="3 3"
                                    />
                                </svg>
                            </div>

                            <div className="absolute inset-0 hero-gradient rounded-3xl blur-2xl opacity-20 scale-105" />
                            <img
                                src={heroDashboard.src}
                                alt="Hospital Management Dashboard"
                                className="relative rounded-2xl shadow-2xl border border-border/50"
                            />
                        </div>

                        {/* Floating Stats Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="absolute -bottom-6 -left-6 glass-card rounded-2xl p-4 shadow-xl"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl hero-gradient flex items-center justify-center">
                                    <span className="text-xl font-bold text-primary-foreground">+</span>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-primary">15+</p>
                                    <p className="text-sm text-muted-foreground">Modules</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            className="absolute -top-4 -right-4  rounded-xl px-4 py-2 "
                        >
                            <PointerLabel >
                                <div className="flex items-center gap-2">
                                    <Cloud className="w-5 h-5 text-primary" />
                                    <span className="text-sm font-medium text-primary">Auto Backup</span>
                                </div>
                            </PointerLabel>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
