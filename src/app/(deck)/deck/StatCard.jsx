import { motion } from "framer-motion";

const StatCard = ({ value, label, icon, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="glass-effect rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300"
    >
      {icon && (
        <div className="mb-3 flex justify-center text-primary">
          {icon}
        </div>
      )}
      <div className="text-3xl md:text-4xl font-bold text-gradient-primary mb-2">
        {value}
      </div>
      <div className="text-sm text-muted-foreground">
        {label}
      </div>
    </motion.div>
  );
};

export default StatCard;
