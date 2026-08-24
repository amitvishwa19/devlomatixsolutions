import { motion } from "framer-motion";
import { CheckCircle, Clock, HeadphonesIcon, TrendingUp, Shield, Cpu, Sparkles } from "lucide-react";
import Tagline from "./Tagline";

const features = [
    {
        icon: CheckCircle,
        title: "Proven Track Record",
        description: "150+ successful projects delivered across diverse industries with a 98% client satisfaction rate.",
    },
    {
        icon: Clock,
        title: "On-Time Delivery",
        description: "We respect deadlines. Our agile methodology ensures your project launches when promised.",
    },
    {
        icon: HeadphonesIcon,
        title: "24/7 Support",
        description: "Round-the-clock technical support and maintenance to keep your systems running smoothly.",
    },
    {
        icon: TrendingUp,
        title: "Scalable Solutions",
        description: "Future-proof architecture that grows with your business without costly rewrites.",
    },
    {
        icon: Shield,
        title: "Enterprise Security",
        description: "Bank-grade security protocols and compliance with industry standards like GDPR, HIPAA, and SOC 2.",
    },
    {
        icon: Cpu,
        title: "Cutting-Edge Tech",
        description: "We leverage the latest technologies including AI/ML, blockchain, and cloud-native solutions.",
    },
];

const WhyChooseUs = () => {
    return (
        <section id="why-choose-us" className="py-32 relative overflow-hidden">
            {/* Rich gradient background for light theme */}
            <div className="absolute inset-0 bg-gradient-to-tl from-accent/8 via-background to-primary/6 dark:from-card/30 dark:via-card/30 dark:to-card/30 pointer-events-none" />

            {/* Decorative orbs */}
            <div className="absolute top-1/3 right-0 w-[500px] h-[500px] orb-tertiary rounded-full blur-[100px] opacity-70 pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] orb-primary rounded-full blur-[90px] opacity-50 pointer-events-none" />
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content with Image */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <Tagline text="Why Choose Us" icon={<Sparkles className="w-4 h-4 text-primary" />} />

                        <h2 className="font-display text-4xl md:text-5xl font-extrabold mt-4 mb-6 text-foreground">
                            Your Success Is <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600 to-indigo-600">Our Priority</span>
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                            We're not just developers – we're your strategic technology partners.
                            Our commitment to excellence sets us apart in delivering solutions that
                            drive real business outcomes.
                        </p>

                        <div className="grid grid-cols-3 gap-6 pt-4 border-t border-border/40">
                            <div className="text-center lg:text-left">
                                <div className="font-display text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">98%</div>
                                <div className="text-xs md:text-sm font-medium text-muted-foreground mt-1">Client Retention</div>
                            </div>
                            <div className="text-center lg:text-left">
                                <div className="font-display text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">4.9</div>
                                <div className="text-xs md:text-sm font-medium text-muted-foreground mt-1">Avg Rating</div>
                            </div>
                            <div className="text-center lg:text-left">
                                <div className="font-display text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">2x</div>
                                <div className="text-xs md:text-sm font-medium text-muted-foreground mt-1">Faster Delivery</div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20, rotate: -2 }}
                                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1, type: "spring" }}
                                viewport={{ once: true }}
                                whileHover={{
                                    y: -5,
                                    scale: 1.02,
                                    transition: { duration: 0.2 }
                                }}
                                className="glass-card p-5 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50 transition-all duration-300 group"
                            >
                                <motion.div
                                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 border border-primary/20 flex items-center justify-center mb-3 shadow-xs"
                                    whileHover={{ rotate: 360, scale: 1.1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <feature.icon className="w-5 h-5 text-primary" />
                                </motion.div>
                                <h3 className="font-display font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
