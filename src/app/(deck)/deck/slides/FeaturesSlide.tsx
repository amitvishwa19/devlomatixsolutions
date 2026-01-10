import { motion } from "framer-motion";
import FeatureCard from "../FeatureCard";
import { 
  UserCircle, 
  Calendar, 
  Stethoscope, 
  Pill, 
  ClipboardList, 
  Bed,
  Receipt,
  FileText
} from "lucide-react";

const FeaturesSlide = () => {
  const features = [
    {
      icon: <UserCircle className="w-7 h-7" />,
      title: "Patient Management",
      description: "Complete patient lifecycle from registration to discharge with digital records",
      gradient: "primary" as const,
    },
    {
      icon: <Calendar className="w-7 h-7" />,
      title: "Smart Scheduling",
      description: "AI-optimized appointment booking with automated reminders and queue management",
      gradient: "secondary" as const,
    },
    {
      icon: <Stethoscope className="w-7 h-7" />,
      title: "Clinical Workflows",
      description: "Streamlined clinical processes with decision support and care protocols",
      gradient: "accent" as const,
    },
    {
      icon: <Pill className="w-7 h-7" />,
      title: "Pharmacy Integration",
      description: "Automated medication ordering, inventory management, and dispensing",
      gradient: "primary" as const,
    },
    {
      icon: <ClipboardList className="w-7 h-7" />,
      title: "Lab & Diagnostics",
      description: "Integrated lab orders, results tracking, and diagnostic imaging",
      gradient: "secondary" as const,
    },
    {
      icon: <Bed className="w-7 h-7" />,
      title: "Bed Management",
      description: "Real-time bed availability, transfers, and housekeeping coordination",
      gradient: "accent" as const,
    },
    {
      icon: <Receipt className="w-7 h-7" />,
      title: "Billing & Claims",
      description: "Automated charge capture, insurance verification, and claims processing",
      gradient: "primary" as const,
    },
    {
      icon: <FileText className="w-7 h-7" />,
      title: "Reports & Analytics",
      description: "Real-time dashboards, operational metrics, and regulatory reporting",
      gradient: "secondary" as const,
    },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <span className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium mb-4">
          Core Features
        </span>
        <h2 className="text-3xl md:text-5xl font-bold font-display">
          Everything You Need, <span className="text-gradient-primary">All-in-One</span>
        </h2>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl w-full">
        {features.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            delay={0.2 + index * 0.08}
            gradient={feature.gradient}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturesSlide;
