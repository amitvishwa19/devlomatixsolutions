"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEcomm } from '../_contexts/EcommProvider';

const AppLoader = () => {
    const { loading } = useEcomm();

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ 
                        opacity: 0,
                        transition: { duration: 0.8, ease: "easeInOut" }
                    }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
                >
                    {/* Iridescent Background Overlay */}
                    <div className="absolute inset-0 crystal-mesh opacity-40 blur-3xl" />

                    <div className="relative flex flex-col items-center">
                        {/* Geometric Animation */}
                        <div className="relative w-32 h-32 mb-8">
                            {/* Outer Glow */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.6, 0.3],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="absolute inset-0 rounded-full vibrant-gradient blur-2xl"
                            />

                            {/* Rotating Crystal Rings */}
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    style={{
                                        border: '2px solid transparent',
                                        borderTopColor: 'hsl(var(--primary))',
                                        borderRightColor: 'hsl(var(--accent))',
                                    }}
                                    animate={{
                                        rotate: i % 2 === 0 ? 360 : -360,
                                        scale: [1, 1.05, 1],
                                    }}
                                    transition={{
                                        rotate: {
                                            duration: 3 + i,
                                            repeat: Infinity,
                                            ease: "linear",
                                        },
                                        scale: {
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }
                                    }}
                                    className={`absolute inset-${i * 4} rounded-full border-2 opacity-60 shadow-[0_0_15px_rgba(var(--primary),0.3)]`}
                                />
                            ))}

                            {/* Central Diamond/Crystal Icon */}
                            <motion.div
                                animate={{
                                    rotateY: [0, 180, 360],
                                    filter: ["drop-shadow(0 0 10px rgba(255,215,0,0.5))", "drop-shadow(0 0 20px rgba(138,43,226,0.5))", "drop-shadow(0 0 10px rgba(255,215,0,0.5))"],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="absolute inset-0 flex items-center justify-center"
                            >
                                <svg 
                                    viewBox="0 0 24 24" 
                                    className="w-12 h-12 text-primary"
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="1" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                >
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                            </motion.div>
                        </div>

                        {/* Text Content */}
                        <div className="overflow-hidden">
                            <motion.h1
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                                className="font-serif text-3xl tracking-widest uppercase mb-2"
                            >
                                Crystal <span className="text-gold italic">Aura</span>
                            </motion.h1>
                        </div>
                        
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100px" }}
                            transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
                            className="h-[1px] bg-gold opacity-50 mb-4"
                        />

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.4, 0.7, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground"
                        >
                            Loading the Sacred Experience
                        </motion.p>
                    </div>

                    {/* Progress indicator at bottom */}
                    <motion.div 
                        className="absolute bottom-12 left-0 h-[2px] bg-gold z-10"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, ease: "easeInOut" }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AppLoader;
