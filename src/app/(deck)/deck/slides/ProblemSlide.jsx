import { motion } from "framer-motion";
import { AlertTriangle, Clock, DollarSign, FileWarning, Users, Workflow } from "lucide-react";

const ProblemSlide = () => {
  const problems = [
    {
      icon: <FileWarning className="w-8 h-8" />,
      title: "Paper-Based Records",
      description: "Manual record-keeping leads to errors and inefficiency",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Long Wait Times",
      description: "Poor scheduling causes patient frustration and bottlenecks",
    },
    {
      icon: <Workflow className="w-8 h-8" />,
      title: "Fragmented Systems",
      description: "Disconnected departments create communication gaps",
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Revenue Leakage",
      description: "Billing errors and missed charges impact bottom line",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Staff Burnout",
      description: "Administrative overload takes time from patient care",
    },
    {
      icon: <AlertTriangle className="w-8 h-8" />,
      title: "Compliance Risks",
      description: "Regulatory requirements are hard to track manually",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <span className="inline-block px-4 py-2 bg-destructive/20 text-destructive rounded-full text-sm font-medium mb-4">
          The Challenge
        </span>
        <h2 className="text-3xl md:text-5xl font-bold font-display">
          Healthcare Management is <span className="text-gradient-secondary">Broken</span>
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Hospitals face critical challenges that impact patient care and operational efficiency
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl w-full">
        {problems.map((problem, index) => (
          <motion.div
            key={problem.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            className="glass-effect rounded-xl p-6 border-destructive/20 hover:border-destructive/40 transition-colors"
          >
            <div className="text-destructive mb-4">{problem.icon}</div>
            <h3 className="font-bold text-lg text-foreground mb-2">{problem.title}</h3>
            <p className="text-sm text-muted-foreground">{problem.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProblemSlide;
