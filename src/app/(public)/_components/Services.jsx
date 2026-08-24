import { motion } from "framer-motion";
import { Code2, Cpu, Globe, Layers, Rocket, Shield, Sparkles } from "lucide-react";
import Tagline from "./Tagline";

const services = [
    {
        icon: Code2,
        title: "Custom Software Development",
        description: "Tailored solutions built from scratch to meet your unique business requirements and scale with your growth.",
    },
    {
        icon: Cpu,
        title: "Process Automation",
        description: "Streamline operations with intelligent automation that reduces manual work and eliminates errors.",
    },
    {
        icon: Globe,
        title: "Web & Mobile Apps",
        description: "Beautiful, responsive applications that deliver exceptional user experiences across all platforms.",
    },
    {
        icon: Layers,
        title: "System Integration",
        description: "Connect disparate systems and data sources for seamless information flow across your organization.",
    },
    {
        icon: Shield,
        title: "Cloud Solutions",
        description: "Secure, scalable cloud infrastructure and migration services to modernize your tech stack.",
    },
    {
        icon: Rocket,
        title: "MVP Development",
        description: "Rapidly prototype and launch your product to market with our agile development approach.",
    },
];

const Services = () => {
    return (
        <section id="services" className="py-32 relative overflow-hidden">
            {/* Light theme gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/8 dark:from-background dark:via-background dark:to-background pointer-events-none" />

            {/* Decorative orbs */}
            <div className="absolute top-20 right-10 w-[400px] h-[400px] orb-primary rounded-full blur-[100px] opacity-60 pointer-events-none" />
            <div className="absolute bottom-20 left-10 w-[350px] h-[350px] orb-secondary rounded-full blur-[80px] opacity-50 pointer-events-none" />

            <div className="absolute inset-0 grid-pattern opacity-25 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <Tagline text="Transforming Ideas into Digital Reality" icon={<Sparkles className="w-4 h-4 text-primary" />} />

                    <h2 className="font-display text-4xl md:text-5xl font-extrabold mt-4 mb-6 text-foreground">
                        End-to-End <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600 to-indigo-600">Tech Solutions</span>
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                        From ideation to deployment, we provide comprehensive software services
                        that empower businesses to thrive in the digital age.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="group glass-card p-8 hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-2"
                        >
                            <div
                                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 via-blue-500/10 to-accent/15 border border-primary/20 flex items-center justify-center mb-6 shadow-xs group-hover:scale-110 group-hover:shadow-[0_0_25px_hsl(var(--primary)/0.25)] transition-all duration-300"
                            >
                                <service.icon className="w-7 h-7 text-primary" />
                            </div>
                            <h3 className="font-display text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                                {service.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                                {service.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
