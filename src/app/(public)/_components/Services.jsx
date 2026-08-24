import { motion } from "framer-motion";
import { Code2, Cpu, Globe, Layers, Rocket, Shield, Sparkles } from "lucide-react";
import Tagline from "./Tagline";

const services = [
    {
        icon: Code2,
        title: "Custom Software Development",
        tag: "Engineering",
        tagColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25",
        gradient: "from-sky-500 to-blue-600",
        shadow: "shadow-sky-500/20",
        hoverBorder: "hover:border-sky-500/50",
        hoverGlow: "hover:shadow-sky-500/10",
        topBar: "from-sky-500 via-blue-500 to-cyan-400",
        description: "Tailored enterprise solutions built from scratch to solve your unique operational bottlenecks and scale seamlessly.",
    },
    {
        icon: Cpu,
        title: "Process Automation",
        tag: "Automation",
        tagColor: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/25",
        gradient: "from-violet-500 to-purple-600",
        shadow: "shadow-violet-500/20",
        hoverBorder: "hover:border-violet-500/50",
        hoverGlow: "hover:shadow-violet-500/10",
        topBar: "from-violet-500 via-purple-500 to-fuchsia-400",
        description: "Streamline high-friction workflows with intelligent triggers, smart bots, and zero-error orchestration.",
    },
    {
        icon: Globe,
        title: "Web & Mobile Apps",
        tag: "Product Design",
        tagColor: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/25",
        gradient: "from-pink-500 to-rose-600",
        shadow: "shadow-pink-500/20",
        hoverBorder: "hover:border-pink-500/50",
        hoverGlow: "hover:shadow-pink-500/10",
        topBar: "from-pink-500 via-rose-500 to-amber-400",
        description: "Pixel-perfect, ultra-responsive cross-platform mobile and web applications with delightful user experience.",
    },
    {
        icon: Layers,
        title: "System Integration",
        tag: "Architecture",
        tagColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
        gradient: "from-amber-500 to-orange-600",
        shadow: "shadow-amber-500/20",
        hoverBorder: "hover:border-amber-500/50",
        hoverGlow: "hover:shadow-amber-500/10",
        topBar: "from-amber-500 via-orange-500 to-yellow-400",
        description: "Unify fragmented ERPs, CRMs, and legacy data pipelines into a single high-throughput event fabric.",
    },
    {
        icon: Shield,
        title: "Cloud Solutions",
        tag: "Infrastructure",
        tagColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
        gradient: "from-emerald-500 to-teal-600",
        shadow: "shadow-emerald-500/20",
        hoverBorder: "hover:border-emerald-500/50",
        hoverGlow: "hover:shadow-emerald-500/10",
        topBar: "from-emerald-500 via-teal-500 to-cyan-400",
        description: "Bank-grade cloud native architecture, Kubernetes clusters, and automated CI/CD deployment pipelines.",
    },
    {
        icon: Rocket,
        title: "MVP Development",
        tag: "Fast Track",
        tagColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25",
        gradient: "from-indigo-500 to-blue-600",
        shadow: "shadow-indigo-500/20",
        hoverBorder: "hover:border-indigo-500/50",
        hoverGlow: "hover:shadow-indigo-500/10",
        topBar: "from-indigo-500 via-blue-500 to-violet-400",
        description: "Turn concepts into market-ready prototypes in record time with battle-tested architectural boilerplates.",
    },
];

const Services = () => {
    return (
        <section id="services" className="py-32 relative overflow-hidden">
            {/* Light theme multi-color background */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/6 via-indigo-500/4 to-rose-500/6 dark:from-background dark:via-background dark:to-background pointer-events-none" />

            {/* Decorative orbs */}
            <div className="absolute top-20 right-10 w-[450px] h-[450px] orb-primary rounded-full blur-[100px] opacity-70 pointer-events-none" />
            <div className="absolute bottom-20 left-10 w-[400px] h-[400px] orb-secondary rounded-full blur-[90px] opacity-60 pointer-events-none" />
            <div className="absolute top-1/2 left-1/3 w-[350px] h-[350px] orb-rose rounded-full blur-[80px] opacity-40 pointer-events-none" />

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
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-violet-500/10 border border-indigo-500/25 shadow-xs mb-4">
                        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xs font-bold uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                            Our Core Capabilities
                        </span>
                    </div>

                    <h2 className="font-display text-4xl md:text-5xl font-extrabold mt-2 mb-6 text-foreground">
                        End-to-End <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-500">Tech Solutions</span>
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed font-normal">
                        From initial blueprint to global cloud deployment, we deliver high-impact software engineering
                        tailored to scale modern businesses.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.08 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -6, transition: { duration: 0.2 } }}
                            className={`group relative glass-card p-8 rounded-2xl overflow-hidden transition-all duration-300 ${service.hoverBorder} hover:shadow-xl ${service.hoverGlow}`}
                        >
                            {/* Top decorative gradient bar */}
                            <div className={`h-1.5 w-full bg-gradient-to-r ${service.topBar} absolute top-0 left-0 opacity-80 group-hover:opacity-100 transition-opacity`} />

                            <div className="flex items-center justify-between mb-6">
                                <div
                                    className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${service.gradient} text-white flex items-center justify-center shadow-md ${service.shadow} group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <service.icon className="w-6 h-6 text-white" />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${service.tagColor}`}>
                                    {service.tag}
                                </span>
                            </div>

                            <h3 className="font-display text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-200">
                                {service.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed text-sm md:text-base font-normal">
                                {service.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
