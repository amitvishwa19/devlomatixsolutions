import { motion } from "framer-motion";
import { 
  Users, 
  Shield, 
  Key, 
  Settings,
  UserCog,
  Eye,
  Lock,
  CheckCircle
} from "lucide-react";

const roles = [
  {
    name: "Super Admin",
    color: "from-red-500 to-rose-500",
    permissions: "Full system access",
    icon: Shield
  },
  {
    name: "Admin",
    color: "from-violet-500 to-purple-500",
    permissions: "User & settings management",
    icon: UserCog
  },
  {
    name: "Doctor",
    color: "from-blue-500 to-cyan-500",
    permissions: "Patient records, prescriptions",
    icon: Users
  },
  {
    name: "Nurse",
    color: "from-emerald-500 to-green-500",
    permissions: "Vitals, medication, care",
    icon: Users
  },
  {
    name: "Receptionist",
    color: "from-orange-500 to-amber-500",
    permissions: "Appointments, billing",
    icon: Users
  },
  {
    name: "Lab Tech",
    color: "from-teal-500 to-cyan-500",
    permissions: "Lab orders, results",
    icon: Users
  }
];

const features = [
  { icon: Key, title: "Granular Permissions", description: "Module-level access control" },
  { icon: Eye, title: "Audit Logging", description: "Track all user actions" },
  { icon: Lock, title: "Data Security", description: "Role-based data visibility" },
  { icon: Settings, title: "Custom Roles", description: "Create specialized roles" }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

const RoleManagementSlide = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8 md:p-16">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl" />

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
            Access Control
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-10"
        >
          User Role Management
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Roles Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 gap-3"
          >
            {roles.map((role, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:border-primary/50 transition-all"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center mb-3`}>
                  <role.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{role.name}</h3>
                <p className="text-xs text-muted-foreground">{role.permissions}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Features & Permission Matrix */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-card/30 rounded-lg"
                >
                  <feature.icon className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-foreground">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Sample Permission Matrix */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl p-5"
            >
              <h3 className="font-semibold text-foreground mb-4">Permission Matrix</h3>
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-5 gap-2 text-muted-foreground font-medium pb-2 border-b border-border/50">
                  <span>Module</span>
                  <span className="text-center">View</span>
                  <span className="text-center">Create</span>
                  <span className="text-center">Edit</span>
                  <span className="text-center">Delete</span>
                </div>
                {["Patients", "Appointments", "Billing"].map((module, i) => (
                  <div key={i} className="grid grid-cols-5 gap-2 items-center py-1">
                    <span className="text-foreground">{module}</span>
                    {[true, true, i < 2, i === 0].map((allowed, j) => (
                      <div key={j} className="flex justify-center">
                        <div className={`w-4 h-4 rounded ${allowed ? 'bg-emerald-500/20' : 'bg-muted/50'} flex items-center justify-center`}>
                          {allowed && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RoleManagementSlide;
