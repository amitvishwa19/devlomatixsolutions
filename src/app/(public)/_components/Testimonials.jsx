import { motion } from "framer-motion";
import { Sparkles, Star } from "lucide-react";
import Tagline from "./Tagline";

const testimonials = [
  {
    quote: "Devlomatix Solutions transformed our entire business operations. Their automation solutions saved us 40+ hours weekly and the custom software they built is flawless.",
    author: "Rajesh Kumar",
    role: "COO, TechFlow Industries",
    avatar: "from-blue-500 to-indigo-600",
    initials: "RK",
    topBar: "from-sky-500 via-blue-500 to-indigo-500",
    rating: 5,
  },
  {
    quote: "Working with Devlomatix Solutions was a game-changer. They delivered our MVP in record time and helped us secure our Series A funding with a polished product.",
    author: "Meera Nair",
    role: "Founder, DataPulse",
    avatar: "from-violet-500 to-fuchsia-600",
    initials: "MN",
    topBar: "from-purple-500 via-fuchsia-500 to-pink-500",
    rating: 5,
  },
  {
    quote: "The team's technical expertise is unmatched. They took our complex requirements and delivered an elegant solution that exceeded all expectations.",
    author: "Suresh Venkatesh",
    role: "CTO, HealthBridge",
    avatar: "from-emerald-500 to-teal-600",
    initials: "SV",
    topBar: "from-emerald-500 via-teal-500 to-cyan-500",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-background to-cyan-500/5 dark:from-transparent pointer-events-none" />
      <div className="absolute inset-0 grid-pattern opacity-25 pointer-events-none" />

      {/* Decorative orbs */}
      <div className="absolute top-1/2 left-1/4 w-[450px] h-[450px] orb-secondary rounded-full blur-[100px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] orb-rose rounded-full blur-[90px] opacity-40 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/25 shadow-xs mb-4">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400">
              Client Testimonials
            </span>
          </div>

          <h2 className="font-display text-4xl md:text-5xl font-extrabold mt-2 mb-6 text-foreground">
            What Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-500">Clients Say</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed font-normal">
            Don't just take our word for it. Here's how we've helped founders and enterprises scale their technology.
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
              whileHover={{ y: -6 }}
              className="glass-card p-8 rounded-2xl relative overflow-hidden hover:shadow-xl hover:border-primary/50 transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Top gradient accent */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${testimonial.topBar} absolute top-0 left-0 opacity-80 group-hover:opacity-100 transition-opacity`} />

              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-2xl text-primary/30 font-serif">❝</span>
                </div>
                <p className="text-foreground/90 leading-relaxed mb-6 italic text-sm md:text-base font-normal">
                  "{testimonial.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-border/60 flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.avatar} flex items-center justify-center text-white font-bold text-xs shadow-md`}>
                  {testimonial.initials}
                </div>
                <div>
                  <div className="font-display font-bold text-foreground text-sm">
                    {testimonial.author}
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground">
                    {testimonial.role}
                  </div>
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
