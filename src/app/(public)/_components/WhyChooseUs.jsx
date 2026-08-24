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
            {/* Rich gradient background for light theme */}
            <div className="absolute inset-0 bg-gradient-to-tl from-indigo-500/6 via-background to-cyan-500/6 dark:from-card/30 dark:via-card/30 dark:to-card/30 pointer-events-none" />

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
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-teal-500/25 shadow-xs mb-4">
                            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            <span className="text-xs font-bold uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400">
                                Unrivaled Strategic Advantage
                            </span>
                        </div>

                        <h2 className="font-display text-4xl md:text-5xl font-extrabold mt-2 mb-6 text-foreground">
                            Your Success Is <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600">Our Priority</span>
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8 leading-relaxed font-normal">
                            We're not just outside contractors – we become your dedicated technology co-pilots.
                            Our relentless engineering rigor sets us apart in shipping software that produces concrete ROI.
                        </p>

                        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border/60">
                            <div className="text-center lg:text-left">
                                <div className="font-display text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600">98%</div>
                                <div className="text-xs md:text-sm font-semibold text-muted-foreground mt-1">Client Retention</div>
                            </div>
                            <div className="text-center lg:text-left">
                                <div className="font-display text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500">4.9★</div>
                                <div className="text-xs md:text-sm font-semibold text-muted-foreground mt-1">Avg Rating</div>
                            </div>
                            <div className="text-center lg:text-left">
                                <div className="font-display text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600">2x</div>
                                <div className="text-xs md:text-sm font-semibold text-muted-foreground mt-1">Faster Delivery</div>
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
                                className={`glass-card p-5.5 rounded-2xl transition-all duration-300 ${feature.hoverBorder} hover:shadow-lg group`}
                            >
                                <div
                                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} text-white flex items-center justify-center mb-3.5 shadow-md ${feature.shadow} group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <feature.icon className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-display font-bold text-foreground mb-1 group-hover:text-primary transition-colors text-base">
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
