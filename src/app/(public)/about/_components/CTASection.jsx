import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Phone } from "lucide-react";

const CTASection = () => {
    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
            <div className="absolute inset-0 grid-pattern opacity-30" />

            {/* Decorative Elements */}
            <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-accent/10 blur-3xl" />

            <div className="container mx-auto px-4 lg:px-8 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="inline-block text-primary font-semibold text-sm tracking-wider uppercase mb-4">
                        Get Started Today
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                        Begin Your Journey to Better Health
                    </h2>
                    <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                        Schedule a consultation with our specialists and experience
                        world-class healthcare tailored to your needs.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <Button variant="hero" size="lg">
                            <Calendar className="w-5 h-5" />
                            Book Appointment
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                        <Button variant="glass" size="lg">
                            <Phone className="w-5 h-5" />
                            Emergency: +91 9712340450
                        </Button>
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex flex-wrap justify-center gap-8 text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="text-sm">NABH Accredited</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="text-sm">ISO 9001:2015 Certified</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="text-sm">JCI International Standards</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
