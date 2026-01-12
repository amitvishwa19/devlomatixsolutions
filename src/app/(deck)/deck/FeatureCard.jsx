import { motion } from "framer-motion";

const FeatureCard = ({ icon, title, description, delay = 0, gradient = "primary" }) => {
  const gradientClasses = {
    primary: "bg-gradient-primary",
    secondary: "bg-gradient-secondary",
    accent: "from-accent to-healthcare-blue bg-gradient-to-br",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="glass-effect rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 group"
    >
      <div className={`w-14 h-14 ${gradientClasses[gradient]} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <div className="text-primary-foreground">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;
