import { Award, Users, Building2, Clock } from "lucide-react";

const stats = [
    {
        icon: Award,
        value: "25+",
        label: "Years of Excellence",
        description: "Trusted healthcare since 1999",
    },
    {
        icon: Users,
        value: "150+",
        label: "Expert Doctors",
        description: "Specialists across all departments",
    },
    {
        icon: Building2,
        value: "30+",
        label: "Departments",
        description: "Comprehensive medical services",
    },
    {
        icon: Clock,
        value: "24/7",
        label: "Emergency Care",
        description: "Round-the-clock availability",
    },
];

const StatsSection = () => {
    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />

            <div className="container mx-auto px-4 lg:px-8 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div
                            key={stat.label}
                            className="text-center group animate-scale-in"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="w-16 h-16 rounded-2xl bg-card border border-border mx-auto mb-6 flex items-center justify-center group-hover:border-primary group-hover:shadow-glow transition-all duration-300">
                                <stat.icon className="w-8 h-8 text-primary" />
                            </div>
                            <span className="block text-4xl md:text-5xl font-bold text-foreground mb-2">
                                {stat.value}
                            </span>
                            <span className="block text-lg font-semibold text-foreground mb-1">
                                {stat.label}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                {stat.description}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
