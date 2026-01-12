import { motion } from "framer-motion";
import { 
  Receipt, 
  CreditCard, 
  FileCheck, 
  IndianRupee,
  PieChart,
  Wallet
} from "lucide-react";

const BillingSlide = () => {
  const features = [
    {
      icon: <Receipt className="w-8 h-8" />,
      title: "Auto Billing",
      description: "Charges captured automatically from all departments"
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Multiple Payments",
      description: "Cash, Card, UPI, Net Banking, and Insurance"
    },
    {
      icon: <FileCheck className="w-8 h-8" />,
      title: "GST Compliant",
      description: "Auto-generated GST invoices and reports"
    },
    {
      icon: <Wallet className="w-8 h-8" />,
      title: "Insurance Claims",
      description: "TPA integration with claim tracking"
    },
    {
      icon: <PieChart className="w-8 h-8" />,
      title: "Revenue Analytics",
      description: "Department-wise revenue tracking"
    },
    {
      icon: <IndianRupee className="w-8 h-8" />,
      title: "Advance & Deposits",
      description: "Manage patient deposits and refunds"
    },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <span className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium mb-4">
          Billing & Finance
        </span>
        <h2 className="text-3xl md:text-5xl font-bold font-display">
          Simplified <span className="text-gradient-primary">Hospital Billing</span>
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Transparent billing with complete financial management
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl w-full">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 + index * 0.08 }}
            className="glass-effect rounded-xl p-5 hover:scale-[1.02] transition-all group text-center"
          >
            <div className="text-primary mb-4 flex justify-center group-hover:scale-110 transition-transform">
              {feature.icon}
            </div>
            <h3 className="font-semibold text-foreground text-lg mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-10 glass-effect rounded-xl p-4 flex flex-wrap justify-center gap-6"
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <span className="text-sm text-muted-foreground">OPD Billing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-400"></div>
          <span className="text-sm text-muted-foreground">IPD Billing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-400"></div>
          <span className="text-sm text-muted-foreground">Pharmacy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-400"></div>
          <span className="text-sm text-muted-foreground">Laboratory</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-pink-400"></div>
          <span className="text-sm text-muted-foreground">Radiology</span>
        </div>
      </motion.div>
    </div>
  );
};

export default BillingSlide;
