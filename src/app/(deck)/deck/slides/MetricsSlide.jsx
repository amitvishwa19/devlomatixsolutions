import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "This software transformed how we manage our 200-bed hospital. The real-time dashboards give us complete visibility.",
    author: "Dr. Rajesh Kumar",
    role: "Medical Director",
    hospital: "City General Hospital",
  },
  {
    quote: "The inventory management alone saved us 30% on procurement costs. Emergency stock-outs are a thing of the past.",
    author: "Sarah Johnson",
    role: "Operations Manager",
    hospital: "Sunrise Medical Center",
  },
  {
    quote: "Patient satisfaction scores improved by 40% after we implemented this system. Appointment scheduling is now seamless.",
    author: "Dr. Priya Sharma",
    role: "Chief Administrator",
    hospital: "Metro Healthcare",
  },
];

const MetricsSlide = () => {
  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 gradient-mesh" />
      
      {/* Decorative Glows */}
      <div className="absolute top-[-5%] right-[15%] w-[450px] h-[450px] rounded-full bg-primary/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-[5%] left-[-5%] w-[400px] h-[400px] rounded-full bg-accent/8 blur-3xl" />
      
      {/* Quote-like Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '36px 36px'
        }} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <span className="text-primary font-heading font-semibold text-sm tracking-widest uppercase flex items-center gap-2">
            <Star className="w-4 h-4" />
            Testimonials
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-center mb-16"
        >
          Trusted by
          <span className="block text-gradient">Healthcare Leaders</span>
        </motion.h2>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.15, duration: 0.5 }}
              className="glass rounded-2xl p-8 flex flex-col"
            >
              <Quote className="h-10 w-10 text-primary/30 mb-4" />
              <p className="text-foreground/90 mb-6 italic flex-1">
                "{testimonial.quote}"
              </p>
              <div>
                <p className="font-semibold text-foreground">
                  {testimonial.author}
                </p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role}
                </p>
                <p className="text-sm text-primary">
                  {testimonial.hospital}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MetricsSlide;
