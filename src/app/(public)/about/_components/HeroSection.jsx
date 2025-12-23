import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";
import heroImage from "@/assets/images/public/hero-medical-team.jpg";
import Image from "next/image";
import gridImage from '@/assets/images/hero/grid.png'
import autherimg from '@/assets/images/author-img.png'


const HeroSection = () => {
    return (
        <section className="relative min-h-screen pt-20 overflow-hidden bg-[#0D1827]">


            <div className='absolute bottom-0 top-[78px] left-0 right-20  w-full' style={{ backgroundImage: `url(${gridImage.src}) `, opacity: 0.1 }} />

            {/* Decorative Elements */}
            <div className="absolute top-40 right-10 lg:right-20 w-48 h-48 lg:w-72 lg:h-72 accent-ring animate-float opacity-60" />
            <div className="absolute bottom-20 left-10 w-20 h-20 rounded-full bg-primary/20 animate-pulse-slow" />


            <div className=" mx-auto px-4 lg:px-8 py-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">


                    <div className="relative z-10 animate-fade-in-up">
                        <span className="inline-block font-semibold text-sm tracking-wider uppercase mb-4 text-[#0395FF]">
                            About Healthyfine Hospital
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold  mb-6 leading-tight ">
                            <span className="text-white">Delivering Quality{" "}</span>
                            <span className="text-[#0395FF]">Healthcare</span>
                            <span className="text-white">for Generations</span>
                        </h1>
                        <p className="text-lg text-white/60 mb-8 leading-relaxed max-w-xl">
                            With over 25 years of excellence, we are committed to providing
                            compassionate, patient-centered care with cutting-edge medical
                            technology and a team of world-class specialists.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <Button variant="ghost" size="lg" className="bg-[#0395FF] text-white">
                                Book Appointment
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="lg" className="border-2 border-[#0395FF] text-white">
                                <Phone className="w-5 h-5" />
                                Call Us Now
                            </Button>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap gap-8">
                            <div className="text-center">
                                <span className="block text-3xl font-bold text-primary">25+</span>
                                <span className="text-sm text-muted-foreground">Years Experience</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-3xl font-bold text-primary">150+</span>
                                <span className="text-sm text-muted-foreground">Expert Doctors</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-3xl font-bold text-primary">50k+</span>
                                <span className="text-sm text-muted-foreground">Happy Patients</span>
                            </div>
                        </div>
                    </div>

                    {/* Hero Image */}
                    <div className="relative animate-slide-in-right hidden lg:block">
                        <div className="relative rounded-2xl overflow-hidden shadow-card">
                            <Image
                                src={heroImage}
                                alt="Our medical team of expert doctors and healthcare professionals"
                                className="w-full h-auto object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                        </div>

                        {/* Floating Card */}
                        <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-card border border-border animate-fade-in" style={{ animationDelay: "0.5s" }}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Phone className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground block">Call Us Anytime</span>
                                    <span className="text-lg font-bold text-foreground">+91 9712340450</span>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div>



        </section>
    );
};

export default HeroSection;
