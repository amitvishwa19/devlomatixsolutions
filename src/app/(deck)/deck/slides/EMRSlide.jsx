import { motion } from "framer-motion";
import { 
  FileText, 
  History, 
  Lock, 
  Share2,
  Search,
  Layers
} from "lucide-react";

const EMRSlide = () => {
  const features = [
    { icon: <FileText className="w-6 h-6" />, title: "Digital Records", desc: "Complete patient history in one place" },
    { icon: <History className="w-6 h-6" />, title: "Visit History", desc: "Track all past consultations and treatments" },
    { icon: <Lock className="w-6 h-6" />, title: "Data Security", desc: "Encrypted storage with access controls" },
    { icon: <Share2 className="w-6 h-6" />, title: "Interoperability", desc: "Share records across departments" },
    { icon: <Search className="w-6 h-6" />, title: "Quick Search", desc: "Find any record in seconds" },
    { icon: <Layers className="w-6 h-6" />, title: "Templates", desc: "Customizable clinical templates" },
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
          Electronic Medical Records
        </span>
        <h2 className="text-3xl md:text-5xl font-bold font-display">
          Paperless <span className="text-gradient-primary">Patient Records</span>
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Secure, accessible, and comprehensive digital health records
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8 max-w-5xl w-full items-center">
        {/* EMR Preview Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-effect rounded-2xl p-6 flex-1 max-w-md"
        >
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              RS
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Rahul Sharma</h4>
              <p className="text-xs text-muted-foreground">Patient ID: HMS-2024-0012</p>
            </div>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Age / Gender</span>
              <span className="text-foreground">45 / Male</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Blood Group</span>
              <span className="text-foreground">B+</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Allergies</span>
              <span className="text-red-400">Penicillin</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Visit</span>
              <span className="text-foreground">10 Jan 2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Visits</span>
              <span className="text-primary font-semibold">12</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Recent Diagnoses</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Hypertension</span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Type 2 Diabetes</span>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-3 flex-1">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.08 }}
              className="glass-effect rounded-xl p-4 hover:scale-105 transition-transform"
            >
              <div className="text-primary mb-2">{feature.icon}</div>
              <h4 className="font-semibold text-foreground text-sm">{feature.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EMRSlide;
