import { motion } from "framer-motion";
import { 
  MessageSquare, 
  Video, 
  Mail, 
  Users,
  Phone,
  Bell,
  Send,
  Paperclip
} from "lucide-react";

const communicationModules = [
  {
    title: "Internal Chat",
    icon: MessageSquare,
    color: "from-blue-500 to-cyan-500",
    features: [
      "Real-time messaging",
      "Department channels",
      "File sharing",
      "Message history",
      "Read receipts"
    ]
  },
  {
    title: "Video Consultation",
    icon: Video,
    color: "from-violet-500 to-purple-500",
    features: [
      "HD video calls",
      "Screen sharing",
      "Virtual waiting room",
      "Recording option",
      "Mobile support"
    ]
  },
  {
    title: "Mailing System",
    icon: Mail,
    color: "from-emerald-500 to-green-500",
    features: [
      "Automated emails",
      "Template library",
      "Bulk notifications",
      "Delivery tracking",
      "Custom branding"
    ]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const CommunicationSlide = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8 md:p-16">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />

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
            Communication Hub
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4"
        >
          Stay Connected
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-muted-foreground text-lg md:text-xl max-w-3xl mb-10"
        >
          Seamless communication between staff, departments, and patients
        </motion.p>

        {/* Modules Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-6"
        >
          {communicationModules.map((module, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-primary/50 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-5`}>
                <module.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-xl text-foreground mb-4">{module.title}</h3>
              <ul className="space-y-2">
                {module.features.map((feature, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {feature}
                  </motion.li>
                ))}
              </ul>

              {/* Mini Preview */}
              {index === 0 && (
                <div className="mt-4 p-3 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20" />
                    <span className="text-xs text-foreground">Dr. Smith</span>
                    <span className="text-xs text-muted-foreground">2m ago</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Patient in Room 302 needs...</p>
                </div>
              )}
              {index === 1 && (
                <div className="mt-4 p-3 bg-background/50 rounded-lg flex items-center justify-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Video className="w-4 h-4 text-red-500" />
                  </div>
                </div>
              )}
              {index === 2 && (
                <div className="mt-4 p-3 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-2 text-xs">
                    <Bell className="w-3 h-3 text-primary" />
                    <span className="text-muted-foreground">Appointment reminder sent</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default CommunicationSlide;
