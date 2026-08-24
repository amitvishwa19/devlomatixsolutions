import { motion } from "framer-motion";
import { CheckCircle, Clock, HeadphonesIcon, TrendingUp, Shield, Cpu, Sparkles } from "lucide-react";

const features = [
    {
        icon: CheckCircle,
        title: "Proven Track Record",
        gradient: "from-emerald-500 to-teal-600",
        shadow: "shadow-emerald-500/25",
        hoverBorder: "hover:border-emerald-500/50",
        description: "150+ successful projects delivered across diverse industries with a 98% client satisfaction rate.",
    },
    {
        icon: Clock,
        title: "On-Time Delivery",
        gradient: "from-sky-500 to-blue-600",
        shadow: "shadow-sky-500/25",
        hoverBorder: "hover:border-sky-500/50",
        description: "We respect deadlines. Our agile sprint methodology ensures your project launches exactly when promised.",
    },
    {
        icon: HeadphonesIcon,
        title: "24/7 Dedicated Support",
        gradient: "from-violet-500 to-purple-600",
        shadow: "shadow-violet-500/25",
        hoverBorder: "hover:border-violet-500/50",
        description: "Round-the-clock proactive monitoring and engineer-level technical support to keep systems humming.",
    },
    {
        icon: TrendingUp,
        title: "Scalable Solutions",
        gradient: "from-amber-500 to-orange-600",
        shadow: "shadow-amber-500/25",
        hoverBorder: "hover:border-amber-500/50",
        description: "Future-proof microservices architecture that seamlessly handles 100x traffic spikes without costly rewrites.",
    },
    {
        icon: Shield,
        title: "Enterprise Security",
        gradient: "from-rose-500 to-pink-600",
        shadow: "shadow-rose-500/25",
        hoverBorder: "hover:border-rose-500/50",
        description: "Bank-grade encryption protocols and strict adherence to GDPR, HIPAA, and SOC 2 Type II compliance.",
    },
    {
        icon: Cpu,
        title: "Cutting-Edge Tech",
        gradient: "from-indigo-500 to-cyan-600",
        shadow: "shadow-indigo-500/25",
        hoverBorder: "hover:border-indigo-500/50",
        description: "We leverage modern AI/LLM models, edge computing, and reactive architectures for unmatched performance.",
    },
];

const WhyChooseUs = () => {
    return (
        <section id="why-choose-us" className="py-32 relative overflow-hidden">
            {/* Rich gradient background for dark/light */}
            <div className="absolute inset-0 bg-gradient-to-tl from-indigo-500/6 via-background to-cyan-500/6 dark:bg-[radial-gradient(circle_at_bottom_left,rgba(229,26,26,0.10),transparent_40%),radial-gradient(circle_at_top_right,rgba(253,131,11,0.10),transparent_35%)] pointer-events-none" />

            {/* Decorative orbs */}
            <div className="absolute top-1/3 right-0 w-[500px] h-[500px] orb-secondary rounded-full blur-[100px] opacity-70 pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] orb-primary rounded-full blur-[90px] opacity-60 pointer-events-none" />
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/25 shadow-xs mb-4">
                            <Sparkles className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-orange-500 dark:text-orange-400">
                                Unrivaled Strategic Advantage
                            </span>
                        </div>

                        <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-6 text-foreground tracking-tight leading-tight">
                            Six Core Reasons Enterprise Teams{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-400 dark:from-red-400 dark:via-orange-400 dark:to-amber-300">
                                Scale With Us.
                            </span>
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8 leading-relaxed font-normal">
                            We don't just build code; we engineer sustained technological advantage. Our architecture principles ensure extreme fault-tolerance, zero vendor lock-in, and measurable ROI.
                        </p>

                        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border/60">
                            <div className="text-center lg:text-left">
                                <div className="zx-stat-num">98%</div>
                                <div className="text-xs md:text-sm font-medium text-muted-foreground mt-1">Client Retention</div>
                            </div>
                            <div className="text-center lg:text-left">
                                <div className="zx-stat-num">4.9★</div>
                                <div className="text-xs md:text-sm font-medium text-muted-foreground mt-1">Avg Partner Rating</div>
                            </div>
                            <div className="text-center lg:text-left">
                                <div className="zx-stat-num">2x</div>
                                <div className="text-xs md:text-sm font-medium text-muted-foreground mt-1">Faster Time to Market</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Features Grid */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.08, type: "spring" }}
                                viewport={{ once: true }}
                                whileHover={{
                                    y: -5,
                                    scale: 1.02,
                                    transition: { duration: 0.2 }
                                }}
                                className={`glass-card dark:zx-card p-6 rounded-2xl transition-all duration-300 ${feature.hoverBorder} hover:shadow-lg group relative overflow-hidden`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div
                                        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} text-white flex items-center justify-center shadow-md ${feature.shadow} group-hover:scale-105 transition-transform duration-300`}
                                    >
                                        <feature.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="zx-badge font-mono text-[11px]">
                                        0{index + 1}
                                    </span>
                                </div>
                                <h3 className="font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors text-base tracking-tight">
                                    {feature.title}
                                </h3>
                                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-normal">
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
