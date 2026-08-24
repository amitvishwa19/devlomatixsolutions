import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
export default function Tagline({ text = 'Test Tex', icon }) {
    return (
        <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 dark:bg-secondary/50 border border-primary/20 dark:border-border/60 mb-8 shadow-xs backdrop-blur-xs"
        >
            {icon}
            <span className="text-sm font-semibold text-primary">{text}</span>
        </div>
    )
}
