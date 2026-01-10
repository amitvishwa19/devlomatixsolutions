import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  Bell, 
  Users,
  CheckCircle,
  Search,
  Repeat,
  Smartphone
} from "lucide-react";

const appointmentFeatures = [
  {
    icon: Calendar,
    title: "Visual Calendar",
    description: "Day, week, and month views with drag-and-drop",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Clock,
    title: "Time Slot Management",
    description: "Configurable slots per doctor and department",
    color: "from-emerald-500 to-green-500"
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "SMS, Email, and WhatsApp notifications",
    color: "from-violet-500 to-purple-500"
  },
  {
    icon: Users,
    title: "Queue Management",
    description: "Real-time waiting list and token system",
    color: "from-orange-500 to-amber-500"
  },
  {
    icon: Repeat,
    title: "Recurring Appointments",
    description: "Schedule follow-ups automatically",
    color: "from-pink-500 to-rose-500"
  },
  {
    icon: Smartphone,
    title: "Online Booking",
    description: "Patient self-booking portal",
    color: "from-teal-500 to-cyan-500"
  }
];

const calendarDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const appointments = [
  { day: 0, time: "09:00", patient: "John D.", type: "Checkup" },
  { day: 1, time: "10:30", patient: "Sarah M.", type: "Follow-up" },
  { day: 2, time: "14:00", patient: "Mike R.", type: "Surgery" },
  { day: 3, time: "11:00", patient: "Lisa K.", type: "Consult" },
  { day: 4, time: "15:30", patient: "Tom B.", type: "Lab Review" }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const AppointmentCalendarSlide = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8 md:p-16">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      <div className="absolute top-20 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />

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
            Scheduling
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-10"
        >
          Appointment & Calendar
        </motion.h2>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Features */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {appointmentFeatures.map((feature, index) => (
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

          {/* Mini Calendar Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="md:col-span-2 bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl p-5"
          >
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              This Week
            </h3>
            
            {/* Days Header */}
            <div className="grid grid-cols-6 gap-2 mb-3">
              {calendarDays.map((day, i) => (
                <div key={i} className="text-center text-xs text-muted-foreground font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Appointments */}
            <div className="space-y-2">
              {appointments.map((apt, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="flex items-center gap-3 p-2 bg-primary/10 rounded-lg text-xs"
                >
                  <span className="text-primary font-medium w-12">{apt.time}</span>
                  <span className="text-foreground flex-1">{apt.patient}</span>
                  <span className="text-muted-foreground">{apt.type}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalendarSlide;
