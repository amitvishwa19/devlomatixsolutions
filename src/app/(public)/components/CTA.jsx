import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";
import ContactDialog from "./ContactDialog";
import ProjectInquiryDialog from "./ProjectInquiryDialog";

import techPattern from "@/app/(public)/assets/tech-pattern.jpg";

const CTA = () => {
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isProjectInquiryOpen, setIsProjectInquiryOpen] = useState(false);

    return (
        <>
            <section id="contact" className="py-32 relative overflow-hidden">
                {/* Rich gradient background for light theme */}
                <div className="absolute inset-0 bg-gradient-to-b from-[hsl(260,45%,97%)] via-[hsl(230,40%,96%)] to-[hsl(192,50%,96%)] dark:from-background dark:via-background dark:to-background" />

                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                    <img
                        src={techPattern}
                        alt=""
                        className="w-full h-full object-cover opacity-10 dark:opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background/80 dark:from-background dark:via-background/90 dark:to-background" />
                </div>

                {/* Colorful orbs */}
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] orb-primary rounded-full blur-[100px] opacity-60" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] orb-secondary rounded-full blur-[120px] opacity-50" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] orb-tertiary rounded-full blur-[150px] opacity-40" />

                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <motion.span
                            className="text-primary text-sm font-medium tracking-wider inline-block"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            viewport={{ once: true }}
                        >
                            Ready to Start?
                        </motion.span>
                        <motion.h2
                            className="font-display text-4xl md:text-6xl font-bold mt-4 mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            Let's Build Something{" "}
                            <motion.span
                                className="gradient-text inline-block"
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
                            className="text-muted-foreground text-xl max-w-2xl mx-auto mb-10"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            viewport={{ once: true }}
                        >
                            Whether you need a complete digital transformation or a focused solution,
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
                                    className="relative overflow-hidden group"
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
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    variant="heroOutline"
                                    size="xl"
                                    onClick={() => setIsContactOpen(true)}
                                    className="group"
                                >
                                    <Mail className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                    Contact Us
                                </Button>
                            </motion.div>
                        </motion.div>

                        {/* Trust Badges */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            viewport={{ once: true }}
                            className="mt-16 pt-16 border-t border-border/50"
                        >
                            <p className="text-sm text-muted-foreground mb-6">Trusted by innovative companies worldwide</p>
                            <div className="flex flex-wrap items-center justify-center gap-8">
                                {["TechCorp", "InnovateCo", "FutureStack", "DataFlow", "CloudSync"].map((company, index) => (
                                    <motion.span
                                        key={index}
                                        className="font-display text-lg font-semibold text-muted-foreground/50 hover:text-primary transition-colors duration-300 cursor-pointer"
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                                        viewport={{ once: true }}
                                        whileHover={{ scale: 1.1, y: -2 }}
                                    >
                                        {company}
                                    </motion.span>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Animated rings */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute rounded-full border border-primary/10"
                                style={{
                                    width: 300 + i * 150,
                                    height: 300 + i * 150,
                                }}
                                animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.1, 0.2, 0.1],
                                    rotate: [0, 180],
                                }}
                                transition={{
                                    duration: 10 + i * 5,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Dialogs */}
            <ContactDialog isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
            <ProjectInquiryDialog isOpen={isProjectInquiryOpen} onClose={() => setIsProjectInquiryOpen(false)} />
        </>
    );
};

export default CTA;
