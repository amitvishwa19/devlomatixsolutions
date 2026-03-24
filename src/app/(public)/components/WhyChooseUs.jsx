import { motion } from "framer-motion";
import { CheckCircle, Clock, HeadphonesIcon, TrendingUp, Shield, Cpu } from "lucide-react";

const features = [
  {
    icon: CheckCircle,
    title: "Proven Track Record",
    description: "150+ successful projects delivered across diverse industries with a 98% client satisfaction rate.",
  },
  {
    icon: Clock,
    title: "On-Time Delivery",
    description: "We respect deadlines. Our agile methodology ensures your project launches when promised.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description: "Round-the-clock technical support and maintenance to keep your systems running smoothly.",
  },
  {
    icon: TrendingUp,
    title: "Scalable Solutions",
    description: "Future-proof architecture that grows with your business without costly rewrites.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade security protocols and compliance with industry standards like GDPR, HIPAA, and SOC 2.",
  },
  {
    icon: Cpu,
    title: "Cutting-Edge Tech",
    description: "We leverage the latest technologies including AI/ML, blockchain, and cloud-native solutions.",
  },
];

const WhyChooseUs = () => {
  return (
    <section id="why-choose-us" className="py-32 relative overflow-hidden">
      {/* Rich gradient background for light theme */}
      <div className="absolute inset-0 bg-gradient-to-tl from-[hsl(260,50%,97%)] via-[hsl(220,35%,96%)] to-[hsl(192,45%,96%)] dark:from-card/30 dark:via-card/30 dark:to-card/30" />
      
      {/* Decorative orbs */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] orb-tertiary rounded-full blur-[100px] opacity-70" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] orb-primary rounded-full blur-[90px] opacity-50" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content with Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="text-primary text-sm font-medium tracking-wider">Why Choose Us</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6">
              Your Success Is <span className="gradient-text">Our Priority</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              We're not just developers – we're your strategic technology partners. 
              Our commitment to excellence sets us apart in delivering solutions that 
              drive real business outcomes.
            </p>
            
            
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="font-display text-3xl font-bold gradient-text">98%</div>
                <div className="text-sm text-muted-foreground">Client Retention</div>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl font-bold gradient-text">4.9</div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl font-bold gradient-text">2x</div>
                <div className="text-sm text-muted-foreground">Faster Delivery</div>
              </div>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, rotate: -2 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1, type: "spring" }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -5, 
                  scale: 1.02,
                  transition: { duration: 0.2 } 
                }}
                className="glass-card p-5 hover:border-primary/50 transition-all duration-300 group"
              >
                <motion.div 
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-[hsl(260,100%,65%,0.2)] flex items-center justify-center mb-3"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="w-5 h-5 text-primary" />
                </motion.div>
                <h3 className="font-display font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
