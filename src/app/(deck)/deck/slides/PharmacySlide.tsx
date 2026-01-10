import { motion } from "framer-motion";
import { 
  Pill, 
  Package, 
  AlertTriangle, 
  BarChart3,
  ShoppingCart,
  QrCode
} from "lucide-react";

const PharmacySlide = () => {
  const features = [
    {
      icon: <Package className="w-10 h-10" />,
      title: "Inventory Control",
      description: "Track stock levels, expiry dates, and reorder points automatically",
      highlight: "Auto Reorder"
    },
    {
      icon: <Pill className="w-10 h-10" />,
      title: "Dispensing",
      description: "Prescription validation with drug interaction alerts",
      highlight: "Safety Checks"
    },
    {
      icon: <ShoppingCart className="w-10 h-10" />,
      title: "Purchase Orders",
      description: "Vendor management and automated purchase workflows",
      highlight: "Multi-vendor"
    },
    {
      icon: <QrCode className="w-10 h-10" />,
      title: "Barcode System",
      description: "Scan-based dispensing and inventory tracking",
      highlight: "Error-free"
    },
  ];

  const stats = [
    { value: "10K+", label: "Drug Database" },
    { value: "Real-time", label: "Stock Updates" },
    { value: "90 Days", label: "Expiry Alerts" },
    { value: "GST", label: "Compliant Billing" },
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
          Pharmacy Module
        </span>
        <h2 className="text-3xl md:text-5xl font-bold font-display">
          Smart <span className="text-gradient-primary">Pharmacy Management</span>
        </h2>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full mb-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            className="glass-effect rounded-xl p-5 flex gap-4 hover:scale-[1.02] transition-transform"
          >
            <div className="text-primary flex-shrink-0">{feature.icon}</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  {feature.highlight}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="glass-effect rounded-2xl p-6 max-w-4xl w-full"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 + index * 0.1 }}
            >
              <span className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</span>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="mt-6 flex items-center gap-2 text-amber-400"
      >
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm">Drug interaction & allergy alerts included</span>
      </motion.div>
    </div>
  );
};

export default PharmacySlide;
