import { Target, Eye, Award, Users, Heart, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const team = [
    {
        name: 'Dr. Sarah Mitchell',
        role: 'Chief Medical Officer',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=300&auto=format&fit=crop',
    },
    {
        name: 'Dr. James Rodriguez',
        role: 'Head of Cardiology',
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=300&auto=format&fit=crop',
    },
    {
        name: 'Dr. Emily Chen',
        role: 'Pediatrics Director',
        image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=300&auto=format&fit=crop',
    },
    {
        name: 'Dr. Michael Okonkwo',
        role: 'Neurology Specialist',
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300&auto=format&fit=crop',
    },
];

const values = [
    { icon: Heart, title: 'Compassion', description: 'We treat every patient with empathy and understanding', color: 'from-pink-500 to-rose-500' },
    { icon: Award, title: 'Excellence', description: 'We strive for the highest standards in healthcare', color: 'from-purple-500 to-indigo-500' },
    { icon: Users, title: 'Collaboration', description: 'We work together to achieve the best outcomes', color: 'from-cyan-500 to-blue-500' },
    { icon: CheckCircle, title: 'Integrity', description: 'We maintain honesty and transparency in all we do', color: 'from-emerald-500 to-teal-500' },
];

const About = () => {


    return (
        <div className="min-h-screen overflow-hidden">


            {/* Hero Section */}
            <section className="relative py-24 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 gradient-mesh" />
                <div className="blob blob-1" />
                <div className="blob blob-2" />

                <div className=" relative mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center animate-fade-in">
                        <div className="inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-medium mb-8">
                            <Sparkles className="h-4 w-4 text-primary" />
                            About MediCare
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-8">
                            Committed to Your{' '}
                            <span className="text-sky-500">Health & Wellness</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            For over 25 years, MediCare has been at the forefront of medical excellence,
                            providing comprehensive healthcare services with a patient-first approach.
                        </p>
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="relative py-24 lg:py-32">
                <div className="  mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="relative animate-slide-up">
                            <div className="absolute -inset-4 rounded-[2rem] gradient-primary opacity-10 blur-3xl" />
                            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-float">
                                <img
                                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop"
                                    alt="MediCare Hospital"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-8 -right-8 glass rounded-2xl p-6 shadow-float animate-float">
                                <p className="stat-number text-5xl">25+</p>
                                <p className="text-muted-foreground font-medium">Years of Excellence</p>
                            </div>
                        </div>

                        <div className="space-y-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium">
                                <Heart className="h-4 w-4 text-primary" />
                                Our Story
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                                Building a Legacy of{' '}
                                <span className="text-sky-500">Healing</span>
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Founded in 1999, MediCare began with a simple vision: to make quality healthcare
                                accessible to everyone. What started as a small clinic has grown into a
                                state-of-the-art medical facility serving thousands of patients annually.
                            </p>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Today, we continue to uphold the same values that guided our founders—compassion,
                                excellence, and innovation. Our team of dedicated healthcare professionals works
                                tirelessly to ensure every patient receives the personalized care they deserve.
                            </p>

                            <div className="grid sm:grid-cols-2 gap-6 pt-4">
                                <div className="p-5 rounded-2xl glass hover:shadow-card transition-all">
                                    <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                                        <Target className="h-6 w-6 text-primary-foreground" />
                                    </div>
                                    <h3 className="font-bold text-foreground mb-2">Our Mission</h3>
                                    <p className="text-sm text-muted-foreground">To provide exceptional healthcare with compassion</p>
                                </div>
                                <div className="p-5 rounded-2xl glass hover:shadow-card transition-all">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4">
                                        <Eye className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="font-bold text-foreground mb-2">Our Vision</h3>
                                    <p className="text-sm text-muted-foreground">To be the most trusted healthcare provider</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="relative py-24 lg:py-32">
                <div className="absolute inset-0 gradient-mesh opacity-50" />
                <div className="blob blob-3" />

                <div className="  relative mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium mb-6">
                            <Award className="h-4 w-4 text-primary" />
                            Our Core Values
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                            What Drives Us{' '}
                            <span className="text-sky-500">Every Day</span>
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Our values shape everything we do, from patient care to community engagement.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, index) => (
                            <Card
                                key={value.title}
                                className="group card-hover text-center border bg-card  animate-slide-up overflow-hidden hover:border-primary/30 transition-colors animate-fade-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <CardContent className="p-8">
                                    <div className={`h-18 w-18 rounded-2xl bg-gradient-to-br ${value.color} mx-auto flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 h-16 w-16`}>
                                        <value.icon className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="relative py-24 lg:py-32">
                <div className="  mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium mb-6">
                            <Users className="h-4 w-4 text-primary" />
                            Our Team
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                            Meet Our{' '}
                            <span className="text-sky-500">Expert Doctors</span>
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Our dedicated team of specialists brings decades of combined experience in patient care.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {team.map((member, index) => (
                            <div
                                key={member.name}
                                className="group text-center animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="relative mb-6">
                                    <div className="absolute -inset-2 rounded-[1.5rem] gradient-primary opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
                                    <div className="relative overflow-hidden rounded-2xl aspect-square shadow-card">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0">
                                            <p className="text-white text-sm">View Profile →</p>
                                        </div>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-1">{member.name}</h3>
                                <p className="text-primary text-sm font-medium">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Accreditations */}
            <section className="relative py-20">
                <div className="section-divider absolute top-0" />
                <div className="section-divider absolute bottom-0" />

                <div className="  mx-auto px-4">
                    <div className="text-center">
                        <p className="text-muted-foreground mb-10 text-lg">Accredited & Certified By</p>
                        <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
                            {['JCI Accredited', 'ISO 9001:2015', 'NABH Certified', 'NABL Accredited'].map((cert, index) => (
                                <div
                                    key={cert}
                                    className="flex items-center gap-3 px-6 py-3 rounded-full glass animate-fade-in"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <Award className="h-5 w-5 text-primary" />
                                    <span className="font-semibold text-foreground">{cert}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
