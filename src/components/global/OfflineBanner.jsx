'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            toast.success("Internet connection restored. Workspace synchronized!");
        };

        const handleOffline = () => {
            setIsOffline(true);
            toast.error("You are currently offline. Changes will sync once reconnected.");
        };

        // Initial check
        if (typeof window !== 'undefined' && !navigator.onLine) {
            setIsOffline(true);
        }

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {isOffline && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-rose-600 text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-between shadow-md z-50 sticky top-0"
                >
                    <div className="flex items-center gap-2">
                        <WifiOff className="w-3.5 h-3.5 animate-pulse" />
                        <span>You are working in Offline Mode. Live sync is paused.</span>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer"
                    >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Retry Connection</span>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
