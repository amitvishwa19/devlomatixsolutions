import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ModuleCard from '../components/ModuleCard';
import Header from '../components/Header';
import { moduleTypes } from '../lib/templates';

const Index = () => {
  const navigate = useNavigate();

  const handleModuleClick = (type) => {
    navigate(`/templates?type=${type}`);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container py-12">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Personal Dev Tool
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
          >
            <span className="gradient-text">Code Modules</span>
            <br />
            <span className="text-foreground">In Seconds</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Generate React components, hooks, utilities, and API code using
            templates or AI. Copy, download, and ship faster.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="gradient-primary text-primary-foreground gap-2 h-12 px-6 text-base font-medium shadow-lg hover:shadow-xl transition-shadow"
              onClick={() => navigate('/templates')}
            >
              Browse Templates
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 h-12 px-6 text-base font-medium"
              onClick={() => navigate('/ai-generate')}
            >
              <Sparkles className="w-4 h-4" />
              Try AI Generate
            </Button>
          </motion.div>
        </motion.section>

        {/* Features */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          {[
            { icon: Zap, title: 'Instant Generation', description: 'Templates generate code in milliseconds' },
            { icon: Sparkles, title: 'AI-Powered', description: 'Describe what you need in plain English' },
            { icon: Clock, title: 'Save Time', description: 'Skip the boilerplate, focus on logic' },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="p-6 rounded-2xl bg-card border border-border"
            >
              <div className="p-3 w-fit rounded-xl bg-primary/10 text-primary mb-4">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* Module Types */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3">What do you want to create?</h2>
            <p className="text-muted-foreground">Choose a module type to get started</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {moduleTypes.map((module, index) => (
              <motion.div
                key={module.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <ModuleCard
                  icon={module.icon}
                  label={module.label}
                  description={module.description}
                  color={module.color}
                  onClick={() => handleModuleClick(module.type)}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default Index;
