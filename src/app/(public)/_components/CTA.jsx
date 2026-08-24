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
                {/* Rich multi-color ambient mesh background */}
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/8 via-indigo-500/6 to-rose-500/8 dark:from-background dark:via-background dark:to-background pointer-events-none" />

                {/* Background Image with Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                    <img
                        src={techPattern.src || techPattern}
                        alt=""
                        className="w-full h-full object-cover opacity-10 dark:opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background dark:from-background dark:via-background/90 dark:to-background" />
                </div>

                {/* Multi-Color Ambient Orbs */}
                <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] orb-primary rounded-full blur-[110px] opacity-70 pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] orb-secondary rounded-full blur-[120px] opacity-60 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] orb-rose rounded-full blur-[140px] opacity-40 pointer-events-none" />

                {/* Animated Multi-color concentric rings */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 overflow-hidden">
                    <motion.div
                        className="absolute rounded-full border border-sky-500/20 dark:border-sky-500/30"
                        style={{ width: 360, height: 360 }}
                        animate={{ scale: [1, 1.06, 1], rotate: [0, 360], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                        className="absolute rounded-full border-2 border-dashed border-purple-500/25 dark:border-purple-500/35"
                        style={{ width: 540, height: 540 }}
                        animate={{ scale: [1, 1.08, 1], rotate: [360, 0], opacity: [0.25, 0.55, 0.25] }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                        className="absolute rounded-full border border-rose-500/20 dark:border-rose-500/30"
                        style={{ width: 720, height: 720 }}
                        animate={{ scale: [1, 1.05, 1], rotate: [0, 360], opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-rose-500/10 border border-purple-500/25 shadow-xs mb-4">
                            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-rose-600 dark:from-blue-400 dark:to-rose-400">
                                Ready to Scale Your Business?
                            </span>
                        </div>

                        <motion.h2
                            className="text-foreground text-4xl md:text-6xl font-extrabold mt-2 mb-6 tracking-tight leading-[1.12]"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            Let's Build Something{" "}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 via-purple-600 to-rose-500">
                                Extraordinary
                            </span>
                        </motion.h2>
                        <motion.p
                            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            viewport={{ once: true }}
                        >
                            Whether you need a complete enterprise digital transformation or a high-velocity custom application,
                            our senior engineering squad is ready to bring your vision to life.
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.4 }}
                            viewport={{ once: true }}
                        >
                            <Button
                                variant="hero"
                                size="xl"
                                onClick={() => setIsProjectInquiryOpen(true)}
                                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border-0"
                            >
                                Start Your Project
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                                variant="heroOutline"
                                size="xl"
                                onClick={() => setIsContactOpen(true)}
                                className="hover:border-purple-500/50 hover:bg-purple-500/5"
                            >
                                <Mail className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                                Start a Conversation
                            </Button>
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
