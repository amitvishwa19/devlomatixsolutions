import { motion } from "framer-motion";
import { Building2, Sparkles } from "lucide-react";
import heroImage from "../../_assets/hero-wellness.jpg";

const stats = [
    { number: "500+", label: "Hospitals Trust Us" },
    { number: "2M+", label: "Patients Managed" },
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "50%", label: "Time Saved" },
];

const TitleSlide = () => {
    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroImage})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-slide-dark/80 via-slide-dark/70 to-slide-dark/95" />
            </div>

            {/* Decorative Elements */}
            <motion.div
                className="absolute top-20 left-20 w-32 h-32 rounded-full bg-primary/20 blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
                className="absolute bottom-40 right-32 w-48 h-48 rounded-full bg-accent/20 blur-3xl"
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 5, repeat: Infinity }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex items-center gap-3 mb-8"
                >
                    <div className="p-3 rounded-2xl bg-gradient-primary glow-primary">
                        <Building2 className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <span className="font-heading text-2xl font-semibold text-primary-foreground">
                        Hospital Management System
                    </span>
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground max-w-5xl leading-tight"
                >
                    Transform Your
                    <span className="block text-gradient-light">Healthcare Operations</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mt-8 text-xl md:text-2xl text-primary-foreground/80 max-w-2xl font-body"
                >
                    Complete hospital management platform for appointments, patients,
                    inventory, billing & more
                </motion.p>

                {/* Stats Row */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8 + index * 0.1 }}
                            className="text-center"
                        >
                            <div className="font-heading text-3xl md:text-4xl font-bold text-primary">
                                {stat.number}
                            </div>
                            <div className="text-primary-foreground/70 text-sm mt-1">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    className="mt-10 flex items-center gap-2 glass-dark px-6 py-3 rounded-full"
                >
                    <Sparkles className="w-5 h-5 text-accent" />
                    <span className="text-primary-foreground/90 font-medium">
                        Enterprise Healthcare Solution
                    </span>
                </motion.div>

                {/* Scroll hint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-16 flex flex-col items-center gap-2"
                >
                    <span className="text-sm text-primary-foreground/50">Swipe or use arrows</span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex justify-center pt-2"
                    >
                        <div className="w-1.5 h-3 rounded-full bg-primary-foreground/50" />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default TitleSlide;
