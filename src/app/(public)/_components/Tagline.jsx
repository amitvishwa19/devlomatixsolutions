import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
export default function Tagline({ text = 'Test Tex', icon }) {
    return (
        <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/60 mb-8"
        >
            {icon}
            <span className="text-sm text-primary">{text}</span>
        </div>
    )
}
