import { Heart, Brain, Bone, Baby, Eye, Stethoscope, Syringe, Activity } from "lucide-react";

const departments = [
    { icon: Heart, name: "Cardiology", description: "Heart and cardiovascular care" },
    { icon: Brain, name: "Neurology", description: "Brain and nervous system" },
    { icon: Bone, name: "Orthopedics", description: "Bone and joint specialists" },
    { icon: Baby, name: "Pediatrics", description: "Child healthcare experts" },
    { icon: Eye, name: "Ophthalmology", description: "Eye care and surgery" },
    { icon: Stethoscope, name: "General Medicine", description: "Primary healthcare" },
    { icon: Syringe, name: "Oncology", description: "Cancer treatment center" },
    { icon: Activity, name: "Emergency", description: "24/7 emergency services" },
];

const DepartmentsSection = () => {
    return (
        <section className="py-20 bg-card/30">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="inline-block text-primary font-semibold text-sm tracking-wider uppercase mb-4">
                        Our Specialties
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        World-Class Medical Departments
                    </h2>
                    <p className="text-muted-foreground">
                        Our multispeciality hospital houses 30+ departments staffed with
                        expert physicians and state-of-the-art equipment.
                    </p>
                </div>

                {/* Departments Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {departments.map((dept, index) => (
                        <div
                            key={dept.name}
                            className="group bg-card rounded-xl p-6 border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300 cursor-pointer animate-fade-in-up"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                                <dept.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-1">{dept.name}</h3>
                            <p className="text-sm text-muted-foreground">{dept.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default DepartmentsSection;
