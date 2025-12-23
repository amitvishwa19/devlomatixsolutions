import { Target, Eye, Heart, Shield } from "lucide-react";

const cards = [
    {
        icon: Target,
        title: "Our Mission",
        description:
            "To provide accessible, high-quality healthcare services that enhance the well-being of our community through innovation, compassion, and excellence in patient care.",
        gradient: "from-primary/20 to-primary/5",
    },
    {
        icon: Eye,
        title: "Our Vision",
        description:
            "To be the most trusted healthcare destination, recognized for our commitment to healing, innovation, and creating a healthier future for all.",
        gradient: "from-accent/20 to-accent/5",
    },
    {
        icon: Heart,
        title: "Our Values",
        description:
            "Compassion, integrity, respect, and excellence guide every interaction. We believe in treating each patient with dignity and personalized attention.",
        gradient: "from-primary/20 to-primary/5",
    },
    {
        icon: Shield,
        title: "Our Promise",
        description:
            "We promise to deliver transparent, ethical, and patient-focused care, ensuring your health and safety remain our top priority at all times.",
        gradient: "from-accent/20 to-accent/5",
    },
];

const MissionVision = () => {
    return (
        <section className="py-20 bg-card/50">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="inline-block text-primary font-semibold text-sm tracking-wider uppercase mb-4">
                        Who We Are
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Building a Healthier Tomorrow
                    </h2>
                    <p className="text-muted-foreground">
                        Our foundation is built on the pillars of compassionate care,
                        medical excellence, and unwavering commitment to our patients.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                    {cards.map((card, index) => (
                        <div
                            key={card.title}
                            className="group relative bg-card rounded-2xl p-8 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow animate-fade-in-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div
                                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                            />
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <card.icon className="w-7 h-7 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-4">
                                    {card.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {card.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default MissionVision;
