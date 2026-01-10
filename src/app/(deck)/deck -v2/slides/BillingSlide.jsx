import { motion } from "framer-motion";
import { 
  Receipt, 
  CreditCard, 
  FileText, 
  TrendingUp,
  Building,
  Percent,
  Clock,
  CheckCircle
} from "lucide-react";

const billingFeatures = [
  {
    icon: Receipt,
    title: "Auto-Generated Invoices",
    description: "Automatic billing from services rendered",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: CreditCard,
    title: "Multiple Payment Modes",
    description: "Cash, card, UPI, insurance, credit",
    color: "from-emerald-500 to-green-500"
  },
  {
    icon: Building,
    title: "Insurance Integration",
    description: "Direct claim submission and tracking",
    color: "from-violet-500 to-purple-500"
  },
  {
    icon: Percent,
    title: "Discounts & Packages",
    description: "Flexible pricing and package deals",
    color: "from-orange-500 to-amber-500"
  },
  {
    icon: Clock,
    title: "Credit Management",
    description: "Track dues and payment schedules",
    color: "from-pink-500 to-rose-500"
  },
  {
    icon: TrendingUp,
    title: "Revenue Analytics",
    description: "Detailed financial reports",
    color: "from-teal-500 to-cyan-500"
  }
];

const recentInvoices = [
  { id: "INV-001", patient: "John Doe", amount: "$1,250", status: "Paid" },
  { id: "INV-002", patient: "Sarah Smith", amount: "$890", status: "Pending" },
  { id: "INV-003", patient: "Mike Johnson", amount: "$2,100", status: "Insurance" }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const BillingSlide = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8 md:p-16">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
          <span className="text-primary font-medium tracking-wider uppercase text-sm">
            Financial Management
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-10"
        >
          Billing & Invoicing
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {billingFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.03 }}
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:border-primary/50 transition-all"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Recent Invoices */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl p-5"
          >
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Recent Invoices
            </h3>
            <div className="space-y-3">
              {recentInvoices.map((invoice, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="p-3 bg-background/50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{invoice.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      invoice.status === 'Paid' 
                        ? 'bg-emerald-500/20 text-emerald-500' 
                        : invoice.status === 'Pending'
                        ? 'bg-amber-500/20 text-amber-500'
                        : 'bg-blue-500/20 text-blue-500'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{invoice.patient}</span>
                    <span className="text-sm font-semibold text-foreground">{invoice.amount}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-500">$45K</div>
                <div className="text-xs text-muted-foreground">This Month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">156</div>
                <div className="text-xs text-muted-foreground">Invoices</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BillingSlide;
