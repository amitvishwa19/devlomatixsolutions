import React from 'react'
import { motion } from 'framer-motion';
import { moduleTypes } from '../lib/templates';
import ModuleCard from '../components/ModuleCard';




export default function Dashboard() {
    return (
        <div className="">


            <main className="">
                {/* Hero Section */}




                {/* Module Types */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >


                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {moduleTypes.map((module, index) => (
                            <motion.div
                                key={module.type}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 + index * 0.1 }}
                            >
                                <ModuleCard
                                    icon={module.icon}
                                    label={module.label}
                                    description={module.description}
                                    color={module.color}
                                    onClick={() => handleModuleClick(module.type)}
                                />
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            </main>
        </div>
    )
}
