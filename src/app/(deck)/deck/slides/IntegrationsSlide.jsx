import { motion } from "framer-motion";
import { Building, Heart, Hospital, Stethoscope, TestTube, Ambulance } from "lucide-react";

const IntegrationsSlide = () => {
  const integrations = [
    { icon: <TestTube className="w-8 h-8" />, name: "Laboratory Systems", description: "LIS/LIMS integration" },
    { icon: <Heart className="w-8 h-8" />, name: "Medical Devices", description: "IoT device connectivity" },
    { icon: <Building className="w-8 h-8" />, name: "Insurance Portals", description: "Automated claims" },
    { icon: <Ambulance className="w-8 h-8" />, name: "Emergency Services", description: "Real-time coordination" },
    { icon: <Stethoscope className="w-8 h-8" />, name: "Telemedicine", description: "Video consultations" },
    { icon: <Hospital className="w-8 h-8" />, name: "Other Hospitals", description: "HIE connectivity" },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
        <span className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium mb-4">Seamless Connectivity</span>
        <h2 className="text-3xl md:text-5xl font-bold font-display"><span className="text-gradient-primary">Integrate</span> With Everything</h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Connect to existing systems and expand capabilities with our open API</p>
      </motion.div>
      <div className="relative max-w-3xl w-full">
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center glow-primary z-10">
          <span className="text-2xl font-bold text-primary-foreground">HMS</span>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-16">
          {integrations.map((integration, index) => (
            <motion.div key={integration.name} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }} className="glass-effect rounded-xl p-5 text-center hover:border-primary/50 transition-all hover:scale-105">
              <div className="text-primary mb-3 flex justify-center">{integration.icon}</div>
              <h3 className="font-semibold text-foreground text-sm mb-1">{integration.name}</h3>
              <p className="text-xs text-muted-foreground">{integration.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntegrationsSlide;
