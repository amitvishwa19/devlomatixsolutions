import { motion } from "framer-motion";
import { 
  Users, 
  CalendarCheck, 
  FileText, 
  Pill, 
  FlaskConical, 
  BedDouble,
  CreditCard,
  BarChart3,
  Package,
  MessageSquare,
  FolderKanban,
  Shield
} from "lucide-react";

const ModulesSlide = () => {
  const modules = [
    { icon: <Users className="w-5 h-5" />, name: "Patient Registry", color: "text-blue-400" },
    { icon: <CalendarCheck className="w-5 h-5" />, name: "Appointments", color: "text-green-400" },
    { icon: <FileText className="w-5 h-5" />, name: "EMR/EHR", color: "text-purple-400" },
    { icon: <Pill className="w-5 h-5" />, name: "Pharmacy", color: "text-pink-400" },
    { icon: <FlaskConical className="w-5 h-5" />, name: "Laboratory", color: "text-cyan-400" },
    { icon: <BedDouble className="w-5 h-5" />, name: "IPD Management", color: "text-orange-400" },
    { icon: <CreditCard className="w-5 h-5" />, name: "Billing & Finance", color: "text-emerald-400" },
    { icon: <BarChart3 className="w-5 h-5" />, name: "Analytics", color: "text-yellow-400" },
    { icon: <Package className="w-5 h-5" />, name: "Inventory", color: "text-red-400" },
    { icon: <MessageSquare className="w-5 h-5" />, name: "Communication", color: "text-indigo-400" },
    { icon: <FolderKanban className="w-5 h-5" />, name: "Workflow", color: "text-teal-400" },
    { icon: <Shield className="w-5 h-5" />, name: "Access Control", color: "text-amber-400" },
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
          Complete Suite
        </span>
        <h2 className="text-3xl md:text-5xl font-bold font-display">
          12+ Integrated <span className="text-gradient-primary">Modules</span>
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Every department connected, every workflow optimized
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative max-w-4xl w-full"
      >
        {/* Central Hub */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center z-10 border border-primary/30">
          <div className="text-center">
            <span className="text-2xl md:text-3xl font-bold text-primary">HMS</span>
            <p className="text-xs text-muted-foreground">Central Hub</p>
          </div>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {modules.map((module, index) => (
            <motion.div
              key={module.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
              className={`glass-effect rounded-xl p-3 md:p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform cursor-pointer ${
                index === 4 || index === 5 || index === 6 || index === 7 ? "md:col-span-1" : ""
              }`}
              style={{ visibility: index >= 4 && index <= 7 ? "hidden" : "visible" }}
            >
              <div className={`${module.color}`}>{module.icon}</div>
              <span className="text-xs md:text-sm text-foreground text-center font-medium">{module.name}</span>
            </motion.div>
          ))}
        </div>

        {/* Visible modules repositioned */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 mt-3 md:mt-4">
          {modules.slice(4, 8).map((module, index) => (
            <motion.div
              key={module.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 + index * 0.05 }}
              className="glass-effect rounded-xl p-3 md:p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
            >
              <div className={`${module.color}`}>{module.icon}</div>
              <span className="text-xs md:text-sm text-foreground text-center font-medium">{module.name}</span>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 mt-3 md:mt-4">
          {modules.slice(8, 12).map((module, index) => (
            <motion.div
              key={module.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.8 + index * 0.05 }}
              className="glass-effect rounded-xl p-3 md:p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
            >
              <div className={`${module.color}`}>{module.icon}</div>
              <span className="text-xs md:text-sm text-foreground text-center font-medium">{module.name}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ModulesSlide;
