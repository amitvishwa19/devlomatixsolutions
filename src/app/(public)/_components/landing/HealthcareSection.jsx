import React from 'react';
import { ArrowRight, Play, Sparkles, Heart, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ContactFormModal from '../ContactFormModal';
import Link from 'next/link';



const HealthcareSection = () => {
    return (
        <section className="relative flex items-center py-20 lg:py-28 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />

            {/* Blob effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

            {/* Floating geometric shapes */}
            <div className="absolute top-1/4 right-10 w-20 h-20 border border-primary/20 rounded-2xl rotate-12 animate-float" style={{ animationDelay: '0s' }} />
            <div className="absolute bottom-1/4 left-10 w-16 h-16 border border-primary/20 rounded-full animate-float" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/3 left-1/4 w-12 h-12 bg-primary/10 rounded-xl rotate-45 animate-float" style={{ animationDelay: '4s' }} />

            <div className="container relative mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left Content */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-white/95 shadow-md px-5 py-2.5 text-sm font-medium animate-fade-in">
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                            <span className="text-primary font-medium">Trusted by 500+ Healthcare Facilities</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            Your Health Is Our{' '}
                            <span className="text-primary">Top Priority</span>
                        </h2>

                        <p className="text-lg text-muted-foreground max-w-lg leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            Experience world-class healthcare with compassionate doctors, cutting-edge technology, and personalized treatment plans designed for your unique needs.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                            <ContactFormModal>
                                <Button
                                    variant="default"
                                    size="lg"
                                    className="hero-gradient shadow-lg hover:shadow-xl transition-all duration-300 text-base px-10"
                                >
                                    Let's get started
                                    <ArrowRight className="h-5 w-5 ml-2" />
                                </Button>
                            </ContactFormModal>
                            <Button variant="outline" size="lg" asChild className="group glass-card border-border/50 hover:border-primary/50 text-base px-8">
                                <Link href="/about">
                                    <Play className="h-5 w-5 mr-2 text-primary" />
                                    Watch Video
                                </Link>
                            </Button>
                        </div>

                        {/* Trust badges */}
                        <div className="flex items-center gap-6 pt-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-gradient-to-br from-primary/20 to-accent overflow-hidden">
                                        <img
                                            src={`https://i.pravatar.cc/100?img=${i + 10}`}
                                            alt="Patient"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">10,000+ Happy Patients</p>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <svg key={i} className="w-4 h-4 text-amber-500 fill-current" viewBox="0 0 20 20">
                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                        </svg>
                                    ))}
                                    <span className="text-sm text-muted-foreground ml-1">4.9/5</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Doctor Image */}
                    <div className="relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <div className="relative">
                            {/* Decorative rotating ring */}
                            <div className="absolute -inset-4 rounded-[2.5rem] border-2 border-dashed border-primary/20 animate-[spin_30s_linear_infinite]" />

                            {/* Glow effect */}
                            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-accent/20 blur-3xl" />

                            <div className="relative aspect-[4/5] max-w-md mx-auto rounded-[2rem] overflow-hidden shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1637059824899-a441006a6875?q=80&w=752&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Professional healthcare"
                                    className="w-full h-full object-cover"
                                />
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                            </div>

                            {/* Floating cards */}
                            <div className="absolute -bottom-6 -left-6 lg:-left-12 glass-card rounded-2xl p-5 shadow-xl animate-float" style={{ animationDelay: '0s' }}>
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-xl hero-gradient flex items-center justify-center">
                                        <Heart className="h-7 w-7 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-primary">10K+</p>
                                        <p className="text-sm text-primary">Happy Patients</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -top-4 -right-4 lg:-right-8 glass-card rounded-2xl p-4 shadow-xl animate-float" style={{ animationDelay: '2s' }}>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                        <Shield className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-primary">Verified</p>
                                        <p className="text-xs text-primary">Certified Doctors</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HealthcareSection;