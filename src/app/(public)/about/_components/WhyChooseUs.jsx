import { Check, Star } from "lucide-react";
import hospitalImage from "@/assets/images/public/hospital-building.jpg";

const features = [
    "State-of-the-art medical equipment and facilities",
    "Board-certified specialists in every department",
    "Patient-centered care with personalized treatment plans",
    "24/7 emergency and critical care services",
    "Affordable healthcare with transparent pricing",
    "Advanced diagnostic and imaging center",
];

const WhyChooseUs = () => {
    return (
        <section className="py-20 bg-card/50">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Image */}
                    <div className="relative animate-slide-in-left">
                        <div className="relative rounded-2xl overflow-hidden shadow-card">
                            <img
                                src={hospitalImage}
                                alt="Our modern hospital facility"
                                className="w-full h-auto object-cover"
                            />
                        </div>

                        {/* Experience Badge */}
                        <div className="absolute -bottom-6 -right-6 bg-primary rounded-2xl p-6 shadow-glow animate-fade-in" style={{ animationDelay: "0.3s" }}>
                            <div className="text-center text-primary-foreground">
                                <span className="block text-4xl font-bold">25+</span>
                                <span className="text-sm">Years of<br />Experience</span>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="animate-slide-in-right">
                        <span className="inline-block text-primary font-semibold text-sm tracking-wider uppercase mb-4">
                            Why Choose Us
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                            Advanced Treatments with Compassionate Care
                        </h2>
                        <p className="text-muted-foreground mb-8 leading-relaxed">
                            At HealthCare Hospital, we combine cutting-edge medical technology
                            with a human touch. Our commitment to excellence has made us the
                            preferred healthcare destination for thousands of families.
                        </p>

                        {/* Features List */}
                        <div className="space-y-4 mb-8">
                            {features.map((feature, index) => (
                                <div
                                    key={feature}
                                    className="flex items-start gap-3 animate-fade-in"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Check className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="text-foreground">{feature}</span>
                                </div>
                            ))}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className="w-5 h-5 text-accent fill-accent"
                                    />
                                ))}
                            </div>
                            <div>
                                <span className="font-semibold text-foreground">4.9/5</span>
                                <span className="text-muted-foreground text-sm ml-2">
                                    Based on 2,000+ patient reviews
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
