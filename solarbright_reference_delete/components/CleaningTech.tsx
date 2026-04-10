import { motion } from "framer-motion";
import { Droplets, Wind, Bot, Zap, Timer, ShieldCheck } from "lucide-react";

const NanoCoatingIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-28" fill="none">
    {/* Solar panel */}
    <rect x="30" y="50" width="140" height="50" rx="4" className="fill-primary/10 stroke-primary/30" strokeWidth="1.5" />
    <line x1="70" y1="50" x2="70" y2="100" className="stroke-primary/20" strokeWidth="1" />
    <line x1="110" y1="50" x2="110" y2="100" className="stroke-primary/20" strokeWidth="1" />
    <line x1="30" y1="75" x2="170" y2="75" className="stroke-primary/20" strokeWidth="1" />
    {/* Water droplets bouncing off */}
    <motion.circle cx="60" cy="38" r="4" className="fill-primary/60" animate={{ y: [0, -8, 0], opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
    <motion.circle cx="100" cy="35" r="3" className="fill-primary/50" animate={{ y: [0, -10, 0], opacity: [1, 0.4, 1] }} transition={{ duration: 2.3, repeat: Infinity, delay: 0.3 }} />
    <motion.circle cx="140" cy="40" r="3.5" className="fill-primary/55" animate={{ y: [0, -7, 0], opacity: [1, 0.5, 1] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.6 }} />
    {/* Shield glow */}
    <motion.path d="M90 15 L100 8 L110 15 L110 30 Q100 38 90 30 Z" className="fill-primary/10 stroke-primary/40" strokeWidth="1" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }} />
  </svg>
);

const RoboticIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-28" fill="none">
    {/* Panel surface */}
    <rect x="10" y="70" width="180" height="35" rx="3" className="fill-primary/8 stroke-primary/20" strokeWidth="1.5" />
    <line x1="55" y1="70" x2="55" y2="105" className="stroke-primary/15" strokeWidth="1" />
    <line x1="100" y1="70" x2="100" y2="105" className="stroke-primary/15" strokeWidth="1" />
    <line x1="145" y1="70" x2="145" y2="105" className="stroke-primary/15" strokeWidth="1" />
    {/* Robot body moving across */}
    <motion.g animate={{ x: [0, 80, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
      <rect x="30" y="48" width="40" height="22" rx="6" className="fill-primary/20 stroke-primary/50" strokeWidth="1.5" />
      <circle cx="38" cy="70" r="5" className="fill-primary/30 stroke-primary/50" strokeWidth="1" />
      <circle cx="62" cy="70" r="5" className="fill-primary/30 stroke-primary/50" strokeWidth="1" />
      {/* Antenna */}
      <line x1="50" y1="48" x2="50" y2="38" className="stroke-primary/50" strokeWidth="1.5" />
      <motion.circle cx="50" cy="36" r="3" className="fill-primary/60" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} />
      {/* Brush rollers */}
      <motion.line x1="32" y1="70" x2="68" y2="70" className="stroke-primary/40" strokeWidth="2" strokeDasharray="3 2" animate={{ strokeDashoffset: [0, 10] }} transition={{ duration: 0.5, repeat: Infinity }} />
    </motion.g>
  </svg>
);

const AirJetIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-28" fill="none">
    {/* Panel */}
    <rect x="30" y="65" width="140" height="40" rx="3" className="fill-primary/8 stroke-primary/20" strokeWidth="1.5" />
    {/* Nozzle */}
    <rect x="15" y="25" width="20" height="35" rx="4" className="fill-primary/20 stroke-primary/40" strokeWidth="1.5" />
    {/* Air streams */}
    {[0, 1, 2, 3, 4].map((i) => (
      <motion.line
        key={i}
        x1="35"
        y1={30 + i * 7}
        x2="170"
        y2={55 + i * 5}
        className="stroke-primary/25"
        strokeWidth="1.5"
        strokeDasharray="8 6"
        animate={{ strokeDashoffset: [0, -28], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
    {/* Dust particles being blown away */}
    {[0, 1, 2].map((i) => (
      <motion.circle
        key={`dust-${i}`}
        cx={120 + i * 20}
        cy={60 + i * 5}
        r={2}
        className="fill-muted-foreground/30"
        animate={{ x: [0, 40], y: [0, -15], opacity: [0.6, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
      />
    ))}
  </svg>
);

const DIWaterIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-28" fill="none">
    {/* Panel */}
    <rect x="20" y="60" width="160" height="45" rx="3" className="fill-primary/8 stroke-primary/20" strokeWidth="1.5" />
    <line x1="60" y1="60" x2="60" y2="105" className="stroke-primary/15" strokeWidth="1" />
    <line x1="100" y1="60" x2="100" y2="105" className="stroke-primary/15" strokeWidth="1" />
    <line x1="140" y1="60" x2="140" y2="105" className="stroke-primary/15" strokeWidth="1" />
    {/* Brush */}
    <motion.g animate={{ x: [0, 60, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
      <rect x="40" y="45" width="50" height="12" rx="6" className="fill-primary/25 stroke-primary/40" strokeWidth="1" />
      {/* Water drops */}
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M${50 + i * 15} 57 Q${53 + i * 15} 63 ${50 + i * 15} 68`}
          className="stroke-primary/40 fill-none"
          strokeWidth="1.5"
          animate={{ opacity: [0, 1, 0], y: [0, 5, 10] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
    </motion.g>
    {/* Sparkle for spot-free */}
    <motion.path d="M155 40 L158 35 L161 40 L158 45 Z" className="fill-primary/50" animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
  </svg>
);

const ScheduleIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-28" fill="none">
    {/* Clock face */}
    <circle cx="100" cy="60" r="40" className="fill-primary/5 stroke-primary/30" strokeWidth="1.5" />
    <circle cx="100" cy="60" r="3" className="fill-primary/60" />
    {/* Hour marks */}
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
      <line
        key={deg}
        x1={100 + 32 * Math.cos((deg * Math.PI) / 180)}
        y1={60 + 32 * Math.sin((deg * Math.PI) / 180)}
        x2={100 + 36 * Math.cos((deg * Math.PI) / 180)}
        y2={60 + 36 * Math.sin((deg * Math.PI) / 180)}
        className="stroke-primary/40"
        strokeWidth="2"
      />
    ))}
    {/* Hour hand */}
    <motion.line x1="100" y1="60" x2="100" y2="35" className="stroke-primary/60" strokeWidth="2.5" strokeLinecap="round" animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "100px 60px" }} />
    {/* Minute hand */}
    <motion.line x1="100" y1="60" x2="100" y2="28" className="stroke-primary/40" strokeWidth="1.5" strokeLinecap="round" animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "100px 60px" }} />
    {/* IoT signal arcs */}
    {[0, 1, 2].map((i) => (
      <motion.path
        key={i}
        d={`M${155 + i * 8} 45 Q${162 + i * 8} 60 ${155 + i * 8} 75`}
        className="stroke-primary/30 fill-none"
        strokeWidth="1.5"
        animate={{ opacity: [0, 0.8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
      />
    ))}
  </svg>
);

const AntiStaticIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-28" fill="none">
    {/* Panel */}
    <rect x="30" y="55" width="140" height="45" rx="3" className="fill-primary/8 stroke-primary/20" strokeWidth="1.5" />
    {/* Electric shield dome */}
    <motion.path d="M30 55 Q100 5 170 55" className="stroke-primary/30 fill-primary/3" strokeWidth="1.5" strokeDasharray="6 4" animate={{ strokeDashoffset: [0, -20] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
    {/* Static discharge sparks */}
    {[
      { x: 55, y: 35 },
      { x: 100, y: 20 },
      { x: 145, y: 35 },
    ].map((pos, i) => (
      <motion.g key={i} animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}>
        <line x1={pos.x - 4} y1={pos.y} x2={pos.x + 4} y2={pos.y} className="stroke-primary/50" strokeWidth="1.5" />
        <line x1={pos.x} y1={pos.y - 4} x2={pos.x} y2={pos.y + 4} className="stroke-primary/50" strokeWidth="1.5" />
      </motion.g>
    ))}
    {/* Dust particles being repelled */}
    {[0, 1, 2].map((i) => (
      <motion.circle key={`d-${i}`} cx={60 + i * 40} cy={30} r={2.5} className="fill-muted-foreground/30" animate={{ y: [0, -20], opacity: [0.6, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }} />
    ))}
  </svg>
);

const methods = [
  {
    icon: Droplets,
    title: "Waterless Nano-Coating",
    description: "Hydrophobic nano-coating repels dust and grime, reducing cleaning frequency by up to 40%. Eco-friendly with zero water waste.",
    tag: "Eco-Friendly",
    Illustration: NanoCoatingIllustration,
  },
  {
    icon: Bot,
    title: "Robotic Dry Cleaning",
    description: "AI-powered cleaning robots traverse panels autonomously using soft microfiber rollers. No water, no scratches, no manual labor.",
    tag: "Fully Automated",
    Illustration: RoboticIllustration,
  },
  {
    icon: Wind,
    title: "High-Pressure Air Jet",
    description: "Precision air-jet nozzles blast away loose dust and debris without touching panel surfaces. Ideal for desert and arid regions.",
    tag: "Non-Contact",
    Illustration: AirJetIllustration,
  },
  {
    icon: Droplets,
    title: "Deionized Water Wash",
    description: "Purified DI water leaves zero mineral deposits or streaks. Combined with soft-brush agitation for stubborn soiling.",
    tag: "Spot-Free",
    Illustration: DIWaterIllustration,
  },
  {
    icon: Timer,
    title: "Scheduled Auto-Clean Cycles",
    description: "IoT-enabled timers trigger cleaning at optimal intervals based on weather, dust levels, and panel output data.",
    tag: "Smart Schedule",
    Illustration: ScheduleIllustration,
  },
  {
    icon: ShieldCheck,
    title: "Anti-Static Dust Shield",
    description: "Electrostatic charge neutralization prevents dust re-adhesion post-cleaning, keeping panels cleaner for longer periods.",
    tag: "Long-Lasting",
    Illustration: AntiStaticIllustration,
  },
];

const CleaningTech = () => {
  return (
    <section id="cleaning-tech" className="py-20 md:py-28 bg-muted/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-primary/5 blur-[100px]" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            <Zap className="w-3.5 h-3.5" />
            Advanced Technology
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Auto Cleaning Tech & Methods
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We combine cutting-edge robotics, smart sensors, and eco-friendly solutions to keep your solar panels performing at peak efficiency — with minimal human intervention.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {methods.map((method, i) => (
            <motion.div
              key={method.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300"
            >
              {/* Animated Illustration */}
              <div className="bg-muted/30 border-b border-border/50 px-4 pt-4 pb-2 group-hover:bg-primary/5 transition-colors duration-300">
                <method.Illustration />
              </div>

              <div className="p-6 pt-4">
                {/* Tag */}
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded-full mb-3">
                  {method.tag}
                </span>

                <h3 className="font-heading font-bold text-foreground text-lg mb-2 flex items-center gap-2">
                  <method.icon className="w-5 h-5 text-primary shrink-0" />
                  {method.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{method.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 bg-card border border-border rounded-full px-6 py-3">
            <Bot className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              Our robotic fleet has cleaned over <span className="font-bold text-foreground">2,00,000+</span> panels across India
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CleaningTech;
