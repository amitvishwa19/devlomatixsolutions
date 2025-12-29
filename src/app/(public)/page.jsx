'use client'
import React from 'react'

import { ArrowRight, Shield, Clock, Users, Award, Heart, Stethoscope, Brain, Bone, Baby, Siren, Sparkles, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppointmentDialog from './_components/AppointmentDialog';
import Link from 'next/link';


const services = [
    { icon: Siren, title: 'Emergency Care', description: '24/7 emergency services with rapid response teams', color: 'from-red-500 to-orange-500' },
    { icon: Heart, title: 'Cardiology', description: 'Advanced heart care with latest technology', color: 'from-pink-500 to-rose-500' },
    { icon: Brain, title: 'Neurology', description: 'Expert neurological diagnosis and treatment', color: 'from-purple-500 to-indigo-500' },
    { icon: Bone, title: 'Orthopedics', description: 'Comprehensive bone and joint care', color: 'from-amber-500 to-yellow-500' },
    { icon: Baby, title: 'Pediatrics', description: 'Specialized care for children of all ages', color: 'from-cyan-500 to-teal-500' },
    { icon: Stethoscope, title: 'General Medicine', description: 'Primary healthcare for everyday needs', color: 'from-emerald-500 to-green-500' },
];

const stats = [
    { number: '50+', label: 'Expert Doctors', suffix: '' },
    { number: '10K', label: 'Happy Patients', suffix: '+' },
    { number: '25', label: 'Years Experience', suffix: '+' },
    { number: '15', label: 'Departments', suffix: '+' },
];

const features = [
    { icon: Shield, title: 'Trusted Care', description: 'Board-certified physicians committed to your wellbeing' },
    { icon: Clock, title: 'Always Available', description: '24/7 emergency services and support' },
    { icon: Users, title: 'Expert Team', description: 'Skilled specialists across all medical fields' },
    { icon: Award, title: 'Quality Assured', description: 'Accredited by leading healthcare organizations' },
];


export default function HomePage() {
    return (
        <div className="min-h-screen overflow-hidden">

            <section className="relative min-h-screen flex items-center py-20 lg:py-0">
                {/* Background Effects */}
                <div className="absolute inset-0 gradient-mesh" />
                <div className="blob blob-1" />
                <div className="blob blob-2" />

                {/* Floating geometric shapes */}
                <div className="absolute top-1/4 right-10 w-20 h-20 border border-primary/20 rounded-2xl rotate-12 animate-float" style={{ animationDelay: '0s' }} />
                <div className="absolute bottom-1/4 left-10 w-16 h-16 border border-primary/20 rounded-full animate-float" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/3 left-1/4 w-12 h-12 bg-primary/10 rounded-xl rotate-45 animate-float" style={{ animationDelay: '4s' }} />

                <div className=" relative mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <div className="space-y-8">
                            <div
                                className="inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-medium animate-fade-in"
                            >
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                                </span>
                                <span className="text-foreground">Caring for Your Health</span>
                                <Sparkles className="h-4 w-4 text-primary" />
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] animate-fade-in" style={{ animationDelay: '0.1s' }}>
                                Your Health Is Our{' '}
                                <span className="text-sky-500">Top Priority</span>
                            </h1>

                            <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
                                Experience world-class healthcare with compassionate doctors, cutting-edge technology, and personalized treatment plans designed for your unique needs.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                                <AppointmentDialog>
                                    <Button size="lg" className="group gradient-primary text-primary-foreground border-0 shadow-glow hover:shadow-[0_0_80px_hsl(262_83%_58%/0.4)] transition-all duration-500 text-base px-8">
                                        Book Appointment
                                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </AppointmentDialog>
                                <Button variant="outline" size="lg" asChild className="group glass border-border/50 hover:border-primary/50 text-base px-8">
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
                                            <svg key={i} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                            </svg>
                                        ))}
                                        <span className="text-sm text-muted-foreground ml-1">4.9/5</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
                            {/* Main image container */}
                            <div className="relative">
                                {/* Decorative ring */}
                                <div className="absolute -inset-4 rounded-[2.5rem] border-2 border-dashed border-primary/20 animate-rotate" style={{ animationDuration: '30s' }} />

                                {/* Glow effect */}
                                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-accent/20 blur-3xl" />

                                <div className="relative aspect-[4/5] max-w-md mx-auto rounded-[2rem] overflow-hidden shadow-float">
                                    <img
                                        src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=2091&auto=format&fit=crop"
                                        alt="Professional healthcare"
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Overlay gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                                </div>

                                {/* Floating cards */}
                                <div className="absolute -bottom-6 -left-6 lg:-left-12 glass rounded-2xl p-5 shadow-float animate-float" style={{ animationDelay: '0s' }}>
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-xl gradient-primary flex items-center justify-center">
                                            <Heart className="h-7 w-7 text-primary-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-foreground">10K+</p>
                                            <p className="text-sm text-muted-foreground">Happy Patients</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute -top-4 -right-4 lg:-right-8 glass rounded-2xl p-4 shadow-float animate-float" style={{ animationDelay: '2s' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                            <Shield className="h-5 w-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">Verified</p>
                                            <p className="text-xs text-muted-foreground">Certified Doctors</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-card/50" />
                <div className="section-divider absolute top-0" />
                <div className="section-divider absolute bottom-0" />

                <div className="container relative mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div
                                key={stat.label}
                                className="text-center animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <p className="stat-number text-5xl md:text-6xl lg:text-7xl">
                                    {stat.number}<span className="text-3xl md:text-4xl">{stat.suffix}</span>
                                </p>
                                <p className="mt-3 text-muted-foreground font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="relative py-24 lg:py-32">
                <div className="blob blob-3" />

                <div className="container relative mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium mb-6">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Our Services
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                            Comprehensive Healthcare{' '}
                            <span className="text-sky-500">Solutions</span>
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            We offer a wide range of medical services to meet all your healthcare needs under one roof.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service, index) => (
                            <Card
                                key={service.title}
                                className="group card-hover border-border/50 bg-card/50 glass animate-slide-up overflow-hidden"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <CardContent className="p-8">
                                    <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        <service.icon className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-3">{service.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                                    <div className="mt-6 flex items-center text-primary font-medium text-sm group-hover:gap-3 transition-all">
                                        Learn more
                                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative py-24 lg:py-32">
                <div className="absolute inset-0 gradient-mesh opacity-50" />

                <div className="container relative mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-10">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium mb-6">
                                    <Award className="h-4 w-4 text-primary" />
                                    Why Choose Us
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                                    Excellence in Every{' '}
                                    <span className="text-sky-500">Aspect of Care</span>
                                </h2>
                                <p className="text-lg text-muted-foreground">
                                    We combine expertise, compassion, and innovation to deliver healthcare that exceeds expectations.
                                </p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                {features.map((feature, index) => (
                                    <div
                                        key={feature.title}
                                        className="group p-6 rounded-2xl glass hover:shadow-card transition-all duration-300 animate-slide-up"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="h-14 w-14 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <feature.icon className="h-7 w-7 text-primary-foreground" />
                                        </div>
                                        <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative animate-fade-in">
                            <div className="absolute -inset-4 rounded-[2rem] gradient-primary opacity-10 blur-3xl" />
                            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-float">
                                <img
                                    src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop"
                                    alt="Medical team"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Floating accent */}
                            <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-2xl gradient-primary opacity-80 blur-2xl" />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-24 lg:py-32">
                <div className="container mx-auto px-4">
                    <div className="relative rounded-[2.5rem] overflow-hidden">
                        {/* Background with mesh gradient */}
                        <div className="absolute inset-0 gradient-primary" />
                        <div className="absolute inset-0 opacity-30">
                            <div className="absolute top-0 left-0 w-96 h-96 bg-white/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                        </div>

                        {/* Pattern overlay */}
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />

                        <div className="relative px-8 py-16 md:p-20 lg:p-24 text-center">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 max-w-2xl mx-auto">
                                Ready to Take the First Step?
                            </h2>
                            <p className="text-white/90 text-lg md:text-xl mb-10 max-w-xl mx-auto">
                                Schedule your appointment today and experience healthcare that puts you first.
                            </p>
                            <AppointmentDialog>
                                <Button
                                    size="lg"
                                    className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 text-base px-10"
                                >
                                    Book Your Appointment
                                    <ArrowRight className="h-5 w-5 ml-2" />
                                </Button>
                            </AppointmentDialog>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    )
}
