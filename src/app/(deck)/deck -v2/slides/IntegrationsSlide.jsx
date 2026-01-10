import { motion } from "framer-motion";
import { 
  Watch, 
  Smartphone, 
  Heart, 
  Activity, 
  Cloud, 
  Zap,
  ArrowRight
} from "lucide-react";

const integrations = [
  {
    icon: Watch,
    name: "Apple Watch",
    description: "Sync health metrics, workouts, and sleep data",
    color: "from-gray-600 to-gray-800",
  },
  {
    icon: Activity,
    name: "Fitbit",
    description: "Import steps, heart rate, and activity data",
    color: "from-teal-500 to-cyan-600",
  },
  {
    icon: Heart,
    name: "Garmin",
    description: "Advanced fitness and wellness tracking",
    color: "from-blue-500 to-blue-700",
  },
  {
    icon: Smartphone,
    name: "Google Fit",
    description: "Android health data synchronization",
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: Cloud,
    name: "Health Apps",
    description: "Connect to 100+ health applications",
    color: "from-purple-500 to-violet-600",
  },
  {
    icon: Zap,
    name: "Smart Devices",
    description: "Blood pressure, glucose monitors & more",
    color: "from-orange-500 to-red-500",
  },
];

const IntegrationsSlide = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 gradient-mesh" />
      
      {/* Animated Glows */}
      <motion.div
        className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/12 blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] rounded-full bg-accent/10 blur-3xl"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 7, repeat: Infinity }}
      />
      
      {/* Subtle Lines */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(45deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 rounded-full glass text-primary text-sm font-medium mb-4">
            Seamless Connectivity
          </span>
          <h2 className="font-heading text-4xl md:text-6xl font-bold text-foreground mb-4">
            Connect Your
            <span className="text-gradient block">Favorite Devices</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sync data from wearables, smart devices, and health apps for a complete wellness picture
          </p>
        </motion.div>

        {/* Integrations Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl w-full"
        >
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative glass rounded-2xl p-5 cursor-pointer overflow-hidden"
            >
              {/* Hover gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${integration.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center mb-3`}>
                  <integration.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
                  {integration.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {integration.description}
                </p>
                <motion.div 
                  className="mt-3 flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Connect <ArrowRight className="w-4 h-4" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-10 text-center"
        >
          <p className="text-muted-foreground text-sm">
            And many more integrations coming soon...
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default IntegrationsSlide;
