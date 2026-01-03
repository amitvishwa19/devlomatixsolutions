import { motion } from "framer-motion";
import { 
  FileText, 
  FolderOpen, 
  Shield, 
  Search,
  Eye,
  Lock,
  Upload,
  Download
} from "lucide-react";

const documentFeatures = [
  {
    icon: FolderOpen,
    title: "Centralized Storage",
    description: "All hospital and patient documents in one secure location",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description: "Documents visible only to authorized personnel",
    color: "from-emerald-500 to-green-500"
  },
  {
    icon: Search,
    title: "Smart Search",
    description: "Find any document instantly with advanced filters",
    color: "from-violet-500 to-purple-500"
  },
  {
    icon: Eye,
    title: "Audit Trail",
    description: "Track who viewed or modified documents",
    color: "from-orange-500 to-amber-500"
  }
];

const documentTypes = [
  { name: "Patient Records", icon: FileText, access: "Clinical Staff" },
  { name: "Lab Reports", icon: FileText, access: "Doctors, Lab" },
  { name: "Discharge Summaries", icon: FileText, access: "All Staff" },
  { name: "Consent Forms", icon: Lock, access: "Admin, Doctors" },
  { name: "Insurance Documents", icon: FileText, access: "Billing, Admin" },
  { name: "Hospital Policies", icon: FileText, access: "All Staff" }
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

const DocumentSlide = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8 md:p-16">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      <div className="absolute top-20 right-20 w-80 h-80 bg-primary/15 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-accent/15 rounded-full blur-3xl" />

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
            Document Management
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4"
        >
          Secure Document Hub
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-muted-foreground text-lg md:text-xl max-w-3xl mb-10"
        >
          Manage all hospital and patient documents with role-based access control
        </motion.p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Features */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-4"
          >
            {documentFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.03 }}
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5 hover:border-primary/50 transition-all"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Document Types */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl p-6"
          >
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              Document Categories
            </h3>
            <div className="space-y-3">
              {documentTypes.map((doc, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-background/50 rounded-lg hover:bg-background/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <doc.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{doc.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                    {doc.access}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSlide;
