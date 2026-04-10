import { motion } from "framer-motion";
import { Lightbulb, Droplets, Calendar, ThermometerSun, Wrench, Leaf } from "lucide-react";

const tips = [
  {
    icon: Calendar,
    title: "Clean Every 3-4 Months",
    description: "Regular cleaning prevents buildup and maintains consistent energy output throughout the year.",
  },
  {
    icon: Droplets,
    title: "Avoid Hard Water",
    description: "Hard water leaves mineral deposits on panels. Use soft water or chemical solutions for best results.",
  },
  {
    icon: ThermometerSun,
    title: "Clean in Early Morning",
    description: "Panels are cooler in the morning, reducing thermal shock risk and making cleaning more effective.",
  },
  {
    icon: Wrench,
    title: "Inspect Wiring Regularly",
    description: "Check for loose connections, frayed wires, or corrosion during each cleaning to prevent costly repairs.",
  },
  {
    icon: Leaf,
    title: "Trim Nearby Trees",
    description: "Overhanging branches cause shade and drop leaves/bird droppings. Keep surroundings clear for max sunlight.",
  },
  {
    icon: Lightbulb,
    title: "Monitor Output Weekly",
    description: "Track your energy generation to spot drops early. A sudden dip usually means it's time for a cleaning.",
  },
];

const Tips = () => {
  return (
    <section id="tips" className="py-28 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute -bottom-40 left-0 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[200px]" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-[0.2em] mb-4">
            <span className="w-8 h-px bg-primary" />
            Solar Tips
            <span className="w-8 h-px bg-primary" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Solar Maintenance Tips
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Expert advice to keep your solar panels running at peak performance.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tips.map((tip, i) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <tip.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-2">{tip.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{tip.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Tips;
