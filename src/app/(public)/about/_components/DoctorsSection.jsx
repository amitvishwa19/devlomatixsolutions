import doctor1 from "@/assets/images/public/doctor-1.jpg";
import doctor2 from "@/assets/images/public/doctor-2.jpg";
import doctor3 from "@/assets/images/public/doctor-3.jpg";
import doctor4 from "@/assets/images/public/doctor-4.jpg";
import { Linkedin, Twitter } from "lucide-react";

const doctors = [
    {
        name: "Dr. Rajesh Kumar",
        specialty: "Chief Cardiologist",
        experience: "20+ years",
        image: doctor1,
    },
    {
        name: "Dr. Priya Sharma",
        specialty: "Senior Neurologist",
        experience: "15+ years",
        image: doctor2,
    },
    {
        name: "Dr. Amit Patel",
        specialty: "Orthopedic Surgeon",
        experience: "12+ years",
        image: doctor3,
    },
    {
        name: "Dr. Sneha Reddy",
        specialty: "General Surgeon",
        experience: "10+ years",
        image: doctor4,
    },
];

const DoctorsSection = () => {
    return (
        <section className="py-20">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="inline-block text-primary font-semibold text-sm tracking-wider uppercase mb-4">
                        Our Expert Team
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Meet Our Specialists
                    </h2>
                    <p className="text-muted-foreground">
                        Our team of highly qualified doctors brings decades of combined
                        experience and a passion for healing.
                    </p>
                </div>

                {/* Doctors Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {doctors.map((doctor, index) => (
                        <div
                            key={doctor.name}
                            className="group relative animate-fade-in-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="relative overflow-hidden rounded-2xl bg-card border border-border group-hover:border-primary/50 transition-all duration-300">
                                {/* Image */}
                                <div className="relative aspect-[4/5] overflow-hidden">
                                    <img
                                        src={doctor.image}
                                        alt={`${doctor.name} - ${doctor.specialty}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />

                                    {/* Social Links */}
                                    <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <a
                                            href="#"
                                            className="w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <Linkedin className="w-4 h-4" />
                                        </a>
                                        <a
                                            href="#"
                                            className="w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <Twitter className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-6">
                                    <h3 className="font-semibold text-lg text-foreground mb-1">
                                        {doctor.name}
                                    </h3>
                                    <p className="text-primary text-sm mb-2">{doctor.specialty}</p>
                                    <p className="text-muted-foreground text-sm">
                                        {doctor.experience} experience
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default DoctorsSection;
