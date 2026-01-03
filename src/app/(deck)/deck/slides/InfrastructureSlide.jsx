import { motion } from "framer-motion";
import { 
  Bed, 
  Building2, 
  Package, 
  BarChart3,
  AlertTriangle,
  RefreshCw,
  ClipboardCheck,
  Warehouse
} from "lucide-react";

const roomBedFeatures = [
  { icon: Bed, title: "Bed Status", description: "Real-time availability" },
  { icon: Building2, title: "Ward Management", description: "Organize by department" },
  { icon: RefreshCw, title: "Quick Transfer", description: "Easy bed transfers" },
  { icon: ClipboardCheck, title: "Housekeeping", description: "Cleaning status tracking" }
];

const inventoryFeatures = [
  { icon: Package, title: "Stock Tracking", description: "Real-time inventory levels" },
  { icon: AlertTriangle, title: "Low Stock Alerts", description: "Automatic reorder alerts" },
  { icon: Warehouse, title: "Multi-Location", description: "Department-wise inventory" },
  { icon: BarChart3, title: "Usage Analytics", description: "Consumption patterns" }
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

const InfrastructureSlide = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8 md:p-16">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      <div className="absolute top-20 left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />

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
            Infrastructure
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-10"
        >
          Room, Bed & Inventory
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Room & Bed Management */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                <Bed className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-xl text-foreground">Room & Bed Management</h3>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 gap-4"
            >
              {roomBedFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="p-4 bg-background/50 rounded-xl hover:bg-background/80 transition-colors"
                >
                  <feature.icon className="w-6 h-6 text-primary mb-2" />
                  <h4 className="font-medium text-foreground text-sm">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Mini Bed Map Preview */}
            <div className="mt-4 grid grid-cols-6 gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.03 }}
                  className={`h-8 rounded ${
                    [0, 3, 5, 8, 11].includes(i) 
                      ? 'bg-emerald-500/30 border border-emerald-500/50' 
                      : [1, 7].includes(i)
                      ? 'bg-red-500/30 border border-red-500/50'
                      : 'bg-muted/50 border border-border/50'
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500"></span> Available</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500"></span> Occupied</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-muted"></span> Reserved</span>
            </div>
          </motion.div>

          {/* Inventory Management */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-xl text-foreground">Inventory Management</h3>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 gap-4"
            >
              {inventoryFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="p-4 bg-background/50 rounded-xl hover:bg-background/80 transition-colors"
                >
                  <feature.icon className="w-6 h-6 text-primary mb-2" />
                  <h4 className="font-medium text-foreground text-sm">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Stock Level Bars */}
            <div className="mt-4 space-y-2">
              {[
                { name: "Syringes", level: 75, color: "bg-emerald-500" },
                { name: "Gloves", level: 25, color: "bg-red-500" },
                { name: "Masks", level: 60, color: "bg-amber-500" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "100%" }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-xs text-muted-foreground w-16">{item.name}</span>
                  <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.level}%` }}
                      transition={{ delay: 0.7 + i * 0.1, duration: 0.5 }}
                      className={`h-full ${item.color} rounded-full`}
                    />
                  </div>
                  <span className="text-xs text-foreground w-10">{item.level}%</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default InfrastructureSlide;
