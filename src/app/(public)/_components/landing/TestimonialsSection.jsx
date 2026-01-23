import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Dr. Priya Sharma",
    role: "Medical Director",
    hospital: "Apollo Hospitals, Delhi",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    content: "This HMS has transformed our hospital operations. We've reduced patient wait times by 60% and improved our billing accuracy significantly.",
    rating: 5
  },
  {
    name: "Rajesh Menon",
    role: "Hospital Administrator",
    hospital: "Fortis Healthcare, Mumbai",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
    content: "The inventory management and pharmacy modules have saved us lakhs in operational costs. Highly recommend for any healthcare facility.",
    rating: 5
  },
  {
    name: "Dr. Anjali Reddy",
    role: "Chief Medical Officer",
    hospital: "KIMS Hospital, Hyderabad",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop&crop=face",
    content: "Seamless integration with our existing systems and excellent support team. The analytics dashboard gives us real-time insights into patient care.",
    rating: 5
  },
  {
    name: "Vikram Singh",
    role: "IT Head",
    hospital: "Max Super Speciality, Gurugram",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    content: "Implementation was smooth and the training provided was comprehensive. Our staff adapted quickly to the new system.",
    rating: 5
  },
  {
    name: "Dr. Meera Patel",
    role: "Department Head",
    hospital: "Narayana Health, Bangalore",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
    content: "The patient record management is exceptional. We can access complete medical histories instantly, improving our diagnosis efficiency.",
    rating: 5
  },
  {
    name: "Suresh Kumar",
    role: "Operations Manager",
    hospital: "Manipal Hospital, Chennai",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    content: "Best investment we made for our hospital. The ROI was visible within the first quarter of implementation.",
    rating: 5
  }
];

const TestimonialsSection = () => {
  return (
    <section className="section-padding bg-secondary/30">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="module-badge mb-4">Testimonials</span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6">
            Trusted by Leading{" "}
            <span className="hero-gradient-text">Healthcare Institutions</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            See what healthcare professionals across India say about our Hospital Management System.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 hover:shadow-lg transition-shadow relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <p className="text-xs text-primary">{testimonial.hospital}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
