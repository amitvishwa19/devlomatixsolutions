import { motion } from "framer-motion";
import { Sparkles, Star } from "lucide-react";
import Tagline from "./Tagline";

const testimonials = [
  {
    quote: "AcsTechHub transformed our entire business operations. Their automation solutions saved us 40+ hours weekly and the custom software they built is flawless.",
    author: "Rajesh Kumar",
    role: "COO, TechFlow Industries",
    rating: 5,
  },
  {
    quote: "Working with AcsTechHub was a game-changer. They delivered our MVP in record time and helped us secure our Series A funding with a polished product.",
    author: "Meera Nair",
    role: "Founder, DataPulse",
    rating: 5,
  },
  {
    quote: "The team's technical expertise is unmatched. They took our complex requirements and delivered an elegant solution that exceeded all expectations.",
    author: "Suresh Venkatesh",
    role: "CTO, HealthBridge",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Tagline text="Testimonials" icon={<Sparkles className="w-4 h-4 text-primary" />} />


          <h2 className="text-primary text-4xl md:text-5xl font-bold mt-4 mb-6">
            What Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Clients Say</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Don't just take our word for it. Here's what industry leaders say about working with us.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-8 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/50 transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground/90 leading-relaxed mb-6 italic">
                "{testimonial.quote}"
              </p>
              <div>
                <div className="font-display font-semibold text-foreground">
                  {testimonial.author}
                </div>
                <div className="text-sm text-muted-foreground">
                  {testimonial.role}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
