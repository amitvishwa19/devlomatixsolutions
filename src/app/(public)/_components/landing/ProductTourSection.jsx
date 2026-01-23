import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    FileText,
    Pill,
    TestTube,
    CreditCard,
    BarChart3,
    ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactFormModal from "../ContactFormModal";


const tourSteps = [
    {
        id: "patients",
        title: "Patient Management",
        icon: Users,
        description: "Complete patient lifecycle from registration to discharge with detailed medical history tracking.",
        features: ["Quick Registration", "Medical History", "Appointment Scheduling", "Patient Portal"],
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format",
        color: "from-blue-500 to-cyan-500",
    },
    {
        id: "opd",
        title: "OPD & IPD",
        icon: FileText,
        description: "Streamlined outpatient and inpatient workflows with real-time bed management.",
        features: ["Token System", "Queue Management", "Bed Allocation", "Discharge Summary"],
        image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format",
        color: "from-emerald-500 to-teal-500",
    },
    {
        id: "pharmacy",
        title: "Pharmacy",
        icon: Pill,
        description: "GST-compliant inventory management with auto-reorder and expiry tracking.",
        features: ["Stock Management", "GST Billing", "Expiry Alerts", "Supplier Management"],
        image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format",
        color: "from-purple-500 to-pink-500",
    },
    {
        id: "pathology",
        title: "Pathology",
        icon: TestTube,
        description: "500+ pre-built report templates with machine integration and auto-analysis.",
        features: ["500+ Templates", "Machine Integration", "Auto Analysis", "Digital Reports"],
        image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format",
        color: "from-amber-500 to-orange-500",
    },
    {
        id: "billing",
        title: "Billing & Accounts",
        icon: CreditCard,
        description: "Comprehensive billing with TPA integration, payment gateway, and financial reports.",
        features: ["TPA Claims", "Payment Gateway", "GST Reports", "Revenue Analytics"],
        image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format",
        color: "from-red-500 to-rose-500",
    },
    {
        id: "analytics",
        title: "Analytics Dashboard",
        icon: BarChart3,
        description: "Real-time insights with customizable dashboards and automated reports.",
        features: ["Real-time Data", "Custom Reports", "Performance KPIs", "Trend Analysis"],
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format",
        color: "from-indigo-500 to-violet-500",
    },
];

const ProductTourSection = () => {
    const [activeStep, setActiveStep] = useState(tourSteps[0]);

    return (
        <section className="py-20 lg:py-28 bg-background overflow-hidden">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        Product Tour
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Explore Key Features
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Take an interactive tour of CareWell HMS and discover how each module works
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* Navigation */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-4 space-y-2"
                    >
                        {tourSteps.map((step, index) => (
                            <motion.button
                                key={step.id}
                                onClick={() => setActiveStep(step)}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300 ${activeStep.id === step.id
                                    ? "bg-primary text-primary-foreground shadow-lg"
                                    : "bg-secondary/50 hover:bg-secondary text-foreground"
                                    }`}
                                whileHover={{ x: activeStep.id === step.id ? 0 : 5 }}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activeStep.id === step.id ? "bg-primary-foreground/20" : "bg-primary/10"
                                    }`}>
                                    <step.icon className={`h-5 w-5 ${activeStep.id === step.id ? "text-primary-foreground" : "text-primary"
                                        }`} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{step.title}</p>
                                </div>
                                <ChevronRight className={`h-5 w-5 transition-transform ${activeStep.id === step.id ? "rotate-90" : ""
                                    }`} />
                            </motion.button>
                        ))}
                    </motion.div>

                    {/* Content */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStep.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="bg-secondary/30 rounded-2xl overflow-hidden border border-border/50"
                            >
                                {/* Image */}
                                <div className="relative aspect-video overflow-hidden">
                                    <img
                                        src={activeStep.image}
                                        alt={activeStep.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className={`absolute inset-0 bg-gradient-to-t ${activeStep.color} opacity-20`} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                                </div>

                                {/* Details */}
                                <div className="p-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activeStep.color} flex items-center justify-center`}>
                                            <activeStep.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-foreground">{activeStep.title}</h3>
                                    </div>

                                    <p className="text-muted-foreground mb-6">{activeStep.description}</p>

                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        {activeStep.features.map((feature) => (
                                            <div key={feature} className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                <span className="text-sm text-foreground">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <ContactFormModal>
                                        <Button className="group">
                                            Get Full Demo
                                            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </ContactFormModal>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductTourSection;
