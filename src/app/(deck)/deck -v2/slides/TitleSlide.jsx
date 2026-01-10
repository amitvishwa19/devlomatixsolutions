import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import heroImage from "../../deck/assets/hero-ai-healthcare.jpg";
import logo from "../../deck/assets/logo.png";
import Image from "next/image";

const stats = [
    { number: "500+", label: "Healthcare Partners" },
    { number: "2M+", label: "Users Served" },
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "50%", label: "Health Goals Achieved" },
];

const TitleSlide = () => {
    return (
        <div className="relative w-full h-screen overflow-hidden ">

            <div className="absolute inset-0 gradient-mesh" />


            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroImage.src})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background/95" />
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
                    className="mb-8"
                >
                    <img src={logo.src} alt="HealthyFine" className="h-16 md:h-20" />
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold max-w-5xl leading-tight"
                >
                    <span className="">Transform Your</span>
                    <span className="block ">Healthcare Operations</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mt-8  text-muted-foreground max-w-2xl font-body"
                >
                    Personalized health tracking, AI-powered insights, and seamless integrations
                    for a healthier, happier you
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
                            <div className="text-muted-foreground text-sm mt-1">
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
                    className="mt-10 flex items-center gap-2 glass px-6 py-3 rounded-full"
                >
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="text-foreground font-medium">
                        Your Complete Wellness Companion
                    </span>
                </motion.div>

                {/* Scroll hint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-16 flex flex-col items-center gap-2"
                >
                    <span className="text-sm text-muted-foreground">Swipe or use arrows</span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-6 h-10 rounded-full border-2 border-border flex justify-center pt-2"
                    >
                        <div className="w-1.5 h-3 rounded-full bg-muted-foreground" />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default TitleSlide;
