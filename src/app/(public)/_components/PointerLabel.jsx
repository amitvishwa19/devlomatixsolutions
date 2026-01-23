import React from 'react'
import { motion } from "framer-motion";

export default function PointerLabel({ children }) {
    return (
        <div>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="module-badge"
            >
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                {children}
            </motion.div>
        </div>
    )
}
