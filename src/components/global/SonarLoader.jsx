'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Cpu } from 'lucide-react';

const SonarLoader = ({ text = "Switching account...", show = true }) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/60 backdrop-blur-md transition-all duration-500"
                >
                    <div className="relative flex flex-col items-center justify-center">
                        {/* Sonar Rings */}
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute rounded-full border border-primary/30 bg-primary/5"
                                initial={{ width: 40, height: 40, opacity: 0.8, scale: 0.5 }}
                                animate={{
                                    width: 320,
                                    height: 320,
                                    opacity: 0,
                                    scale: 1.5,
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    delay: i * 1,
                                    ease: "easeOut",
                                }}
                            />
                        ))}

                        {/* Central Hub */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                                repeat: Infinity,
                                repeatType: "reverse",
                                duration: 1.5
                            }}
                            className="relative z-10 p-6 rounded-3xl bg-primary shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)] border border-primary/20"
                        >
                            <div className="text-primary-foreground">
                                <MessageSquare size={32} className="fill-current" />
                            </div>
                        </motion.div>

                        {/* Text Label */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-12 flex flex-col items-center gap-2"
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-2">System Processing</span>
                            <h3 className="text-xl font-black tracking-tighter text-foreground text-center">
                                {text.split('').map((char, index) => (
                                    <motion.span
                                        key={index}
                                        initial={{ opacity: 0.2 }}
                                        animate={{ opacity: 1 }}
                                        transition={{
                                            duration: 0.8,
                                            repeat: Infinity,
                                            repeatType: "reverse",
                                            delay: index * 0.05
                                        }}
                                    >
                                        {char}
                                    </motion.span>
                                ))}
                            </h3>
                        </motion.div>
                    </div>
                    
                    {/* Status Badge */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed bottom-12 px-5 py-2 rounded-full border border-border/40 bg-background/40 backdrop-blur-sm flex items-center gap-3 shadow-sm"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-bold tracking-widest uppercase opacity-70">Securing Session Tokens</span>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SonarLoader;
