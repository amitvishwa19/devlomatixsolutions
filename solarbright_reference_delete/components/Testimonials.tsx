import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Homeowner, Jaipur",
    text: "After SolarShine cleaned our 5kW rooftop system, our generation jumped from 18 to 24 units/day. Our bijli bill dropped by ₹2,000/month!",
    stars: 5,
    initials: "RK",
  },
  {
    name: "Priya Sharma",
    role: "Factory Owner, Ahmedabad",
    text: "We have 200+ panels on our factory rooftop. SolarShine's AMC plan keeps them clean after every monsoon and dust storm. Professional and affordable.",
    stars: 5,
    initials: "PS",
  },
  {
    name: "Suresh Reddy",
    role: "Solar Farm Manager, Anantapur",
    text: "Managing a 5MW solar farm in Andhra Pradesh. SolarShine's team cleans efficiently with robotic equipment. Generation improved by 28% after the first clean.",
    stars: 5,
    initials: "SR",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-28 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-[0.2em] mb-4">
            <span className="w-8 h-px bg-primary" />
            Testimonials
            <span className="w-8 h-px bg-primary" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            Trusted by 10,000+ Customers
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Real reviews from real customers across India.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative rounded-2xl border border-border bg-card p-8 hover:border-primary/20 hover:shadow-glow transition-all duration-500"
            >
              <Quote className="h-8 w-8 text-primary/10 absolute top-6 right-6" />

              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>

              <p className="text-muted-foreground leading-relaxed mb-8 text-sm">
                "{t.text}"
              </p>

              <div className="flex items-center gap-3 pt-5 border-t border-border">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-heading font-bold text-sm">
                    {t.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-heading font-bold text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
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
