import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Sparkles } from "lucide-react";
import ContactDialog from "./ContactDialog";
import ProjectInquiryDialog from "./ProjectInquiryDialog";

import techPattern from "@/app/(public)/assets/tech-pattern.jpg";
import Tagline from "./Tagline";

const CTA = () => {
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isProjectInquiryOpen, setIsProjectInquiryOpen] = useState(false);

    return (
        <>
            <section id="contact" className="py-32 relative overflow-hidden">
                {/* Rich gradient background for light theme */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-primary/10 dark:from-background dark:via-background dark:to-background pointer-events-none" />

                {/* Background Image with Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                    <img
                        src={techPattern.src || techPattern}
                        alt=""
                        className="w-full h-full object-cover opacity-10 dark:opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background dark:from-background dark:via-background/90 dark:to-background" />
                </div>

                {/* Colorful orbs */}
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] orb-primary rounded-full blur-[100px] opacity-60 pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] orb-secondary rounded-full blur-[120px] opacity-50 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] orb-tertiary rounded-full blur-[150px] opacity-40 pointer-events-none" />

                {/* Animated rings */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 overflow-hidden">
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className={`absolute rounded-full border-2 ${i === 1 ? "border-dashed border-primary/30 dark:border-primary/50" : "border-primary/20 dark:border-primary/40"
                                }`}
                            style={{
                                width: 350 + i * 180,
                                height: 350 + i * 180,
                            }}
                            animate={{
                                scale: [1, 1.08, 1],
                                opacity: [0.35, 0.65, 0.35],
                                rotate: i % 2 === 0 ? [0, 360] : [360, 0],
                            }}
                            transition={{
                                duration: 15 + i * 8,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        />
                    ))}
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <Tagline text="Ready to Start?" icon={<Sparkles className="w-4 h-4 text-primary" />} />

                        <motion.h2
                            className="text-foreground text-4xl md:text-6xl font-extrabold mt-4 mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            Let's Build Something{" "}
                            <motion.span
                                className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600 to-indigo-600 inline-block"
                                animate={{
                                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                                }}
                                transition={{ duration: 5, repeat: Infinity }}
                                style={{ backgroundSize: "200% 200%" }}
                            >
                                Extraordinary
                            </motion.span>
                        </motion.h2>
                        <motion.p
                            className="text-muted-foreground text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            viewport={{ once: true }}
                        >
                            Whether you need a complete digital transformation or a focused custom application,
                            our team is ready to bring your vision to life.
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.4 }}
                            viewport={{ once: true }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    variant="hero"
                                    size="xl"
                                    onClick={() => setIsProjectInquiryOpen(true)}
                                    className="relative overflow-hidden group  cursor-pointer"
                                >
                                    <motion.span
                                        className="absolute inset-0 bg-white/20"
                                        initial={{ x: "-100%", opacity: 0 }}
                                        whileHover={{ x: "100%", opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                    />
                                    Start Your Project
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </motion.div>

                        </motion.div>


                    </motion.div>
                </div>
            </section>

            {/* Dialogs */}
            <ContactDialog isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
            <ProjectInquiryDialog isOpen={isProjectInquiryOpen} onClose={() => setIsProjectInquiryOpen(false)} />
        </>
    );
};

export default CTA;
