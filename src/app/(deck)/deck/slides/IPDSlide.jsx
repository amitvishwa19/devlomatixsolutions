import { motion } from "framer-motion";
import { 
  BedDouble, 
  HeartPulse, 
  Pill, 
  ClipboardList,
  Bell,
  UserCog
} from "lucide-react";

const IPDSlide = () => {
  const features = [
    {
      icon: <BedDouble className="w-8 h-8" />,
      title: "Bed Management",
      description: "Real-time bed availability, transfers, and room allocation with visual floor maps",
      stats: "100+ Beds Tracked"
    },
    {
      icon: <HeartPulse className="w-8 h-8" />,
      title: "Vital Monitoring",
      description: "Continuous patient monitoring with automated alerts for critical values",
      stats: "24/7 Monitoring"
    },
    {
      icon: <Pill className="w-8 h-8" />,
      title: "Medication Rounds",
      description: "Scheduled medication administration with barcode verification",
      stats: "Zero Errors"
    },
    {
      icon: <ClipboardList className="w-8 h-8" />,
      title: "Treatment Plans",
      description: "Digital care plans with progress tracking and clinical protocols",
      stats: "Customizable"
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: "Nurse Station",
      description: "Centralized dashboard for nursing staff with task management",
      stats: "Multi-ward View"
    },
    {
      icon: <UserCog className="w-8 h-8" />,
      title: "Discharge Planning",
      description: "Streamlined discharge process with summary and follow-up scheduling",
      stats: "Same-day Process"
    },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <span className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium mb-4">
          Inpatient Department
        </span>
        <h2 className="text-3xl md:text-5xl font-bold font-display">
          Complete <span className="text-gradient-primary">IPD Management</span>
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          End-to-end inpatient care from admission to discharge
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl w-full">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
            className="glass-effect rounded-xl p-5 hover:scale-[1.02] transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-primary group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                {feature.stats}
              </span>
            </div>
            <h3 className="font-semibold text-foreground text-lg mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default IPDSlide;
