import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const TestimonialsSlide = () => {
  const testimonials = [
    { quote: "MediCare HMS transformed our 500-bed hospital. Wait times dropped by 45% and our staff finally has time to focus on patients.", author: "Dr. Sarah Chen", role: "Chief Medical Officer", hospital: "Metro General Hospital", rating: 5 },
    { quote: "The AI-powered diagnostics have been a game changer. We've seen a 30% improvement in early detection rates.", author: "Dr. James Wilson", role: "Head of Radiology", hospital: "University Medical Center", rating: 5 },
    { quote: "Implementation was smooth and the ROI was visible within 6 months. Best decision we made for our healthcare network.", author: "Maria Rodriguez", role: "Hospital Administrator", hospital: "Community Health System", rating: 5 },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
        <span className="inline-block px-4 py-2 bg-secondary/20 text-secondary rounded-full text-sm font-medium mb-4">Trusted by Healthcare Leaders</span>
        <h2 className="text-3xl md:text-5xl font-bold font-display">What Our <span className="text-gradient-secondary">Partners</span> Say</h2>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {testimonials.map((testimonial, index) => (
          <motion.div key={testimonial.author} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }} className="glass-effect rounded-2xl p-6 flex flex-col">
            <Quote className="w-8 h-8 text-primary/50 mb-4" />
            <p className="text-foreground leading-relaxed mb-6 flex-grow">"{testimonial.quote}"</p>
            <div className="flex gap-1 mb-4">{[...Array(testimonial.rating)].map((_, i) => (<Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />))}</div>
            <div className="border-t border-border pt-4"><p className="font-semibold text-foreground">{testimonial.author}</p><p className="text-sm text-muted-foreground">{testimonial.role}</p><p className="text-xs text-primary">{testimonial.hospital}</p></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsSlide;
