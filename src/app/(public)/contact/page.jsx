'use client'
import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const contactInfo = [
    {
        icon: Phone,
        title: 'Phone',
        details: ['+1 (555) 123-4567', '+1 (555) 987-6543'],
        description: 'Mon-Fri from 8am to 6pm',
        color: 'from-emerald-500 to-teal-500',
    },
    {
        icon: Mail,
        title: 'Email',
        details: ['info@medicare.com', 'appointments@medicare.com'],
        description: 'We reply within 24 hours',
        color: 'from-blue-500 to-cyan-500',
    },
    {
        icon: MapPin,
        title: 'Location',
        details: ['123 Healthcare Blvd', 'Medical City, MC 12345'],
        description: 'Visit us anytime',
        color: 'from-purple-500 to-indigo-500',
    },
    {
        icon: Clock,
        title: 'Working Hours',
        details: ['Mon - Fri: 8:00 AM - 8:00 PM', 'Sat - Sun: 9:00 AM - 5:00 PM'],
        description: 'Emergency: 24/7',
        color: 'from-orange-500 to-amber-500',
    },
];

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.message) {
            toast({
                title: "Please fill required fields",
                description: "Name, email, and message are required.",
                variant: "destructive",
            });
            return;
        }

        toast({
            title: "Message Sent!",
            description: "Thank you for reaching out. We'll get back to you shortly.",
        });

        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    };

    return (
        <div className="min-h-screen overflow-hidden  w-full">
            {/* Hero Section */}
            <section className="relative py-24 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 gradient-mesh" />
                <div className="blob blob-1" />
                <div className="blob blob-2" />

                <div className="container relative mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center animate-fade-in">
                        <div className="inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-medium mb-8">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Contact Us
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-8">
                            We're Here to{' '}
                            <span className="  ">Help You</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Have questions or need assistance? Reach out to us and our dedicated team will be happy to help.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="relative py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {contactInfo.map((info, index) => (
                            <Card
                                key={info.title}
                                className="group card-hover border-border/50 bg-card/50 glass animate-slide-up overflow-hidden"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <CardContent className="p-6">
                                    <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${info.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                        <info.icon className="h-7 w-7 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground mb-3">{info.title}</h3>
                                    {info.details.map((detail, i) => (
                                        <p key={i} className="text-foreground text-sm">{detail}</p>
                                    ))}
                                    <p className="text-muted-foreground text-xs mt-3 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        {info.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form & Map */}
            <section className="relative py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Form */}
                        <div className="animate-slide-up">
                            <div className="mb-10">
                                <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium mb-6">
                                    <MessageSquare className="h-4 w-4 text-primary" />
                                    Send a Message
                                </div>
                                <h2 className="text-4xl font-bold text-foreground mb-4">
                                    Get in <span className="  ">Touch</span>
                                </h2>
                                <p className="text-lg text-muted-foreground">
                                    Fill out the form below and we'll respond as soon as possible.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-foreground font-medium">Full Name *</Label>
                                        <Input
                                            id="name"
                                            placeholder="John Doe"
                                            className="h-12 bg-card/50 glass border-border/50 focus:border-primary/50 focus:ring-primary/20"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-foreground font-medium">Email Address *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="john@example.com"
                                            className="h-12 bg-card/50 glass border-border/50 focus:border-primary/50 focus:ring-primary/20"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-foreground font-medium">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="+1 (555) 000-0000"
                                            className="h-12 bg-card/50 glass border-border/50 focus:border-primary/50 focus:ring-primary/20"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subject" className="text-foreground font-medium">Subject</Label>
                                        <Input
                                            id="subject"
                                            placeholder="How can we help?"
                                            className="h-12 bg-card/50 glass border-border/50 focus:border-primary/50 focus:ring-primary/20"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message" className="text-foreground font-medium">Message *</Label>
                                    <Textarea
                                        id="message"
                                        placeholder="Tell us more about your inquiry..."
                                        className="min-h-[160px] bg-card/50 glass border-border/50 focus:border-primary/50 focus:ring-primary/20 resize-none"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full sm:w-auto group gradient-primary text-primary-foreground border-0 shadow-glow hover:shadow-[0_0_80px_hsl(262_83%_58%/0.4)] transition-all duration-500 px-8"
                                >
                                    Send Message
                                    <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </form>
                        </div>

                        {/* Map */}
                        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <div className="relative h-full min-h-[500px] rounded-[2rem] overflow-hidden shadow-float">
                                <div className="absolute -inset-2 gradient-primary opacity-10 blur-2xl" />
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9663095343008!2d-74.00425882426698!3d40.74076684379132!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259bf5c1654f3%3A0xc80f9cfce5383d5d!2sGoogle!5e0!3m2!1sen!2sus!4v1639653674764!5m2!1sen!2sus"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, minHeight: '100%' }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="MediCare Location"
                                    className="rounded-[2rem]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="relative py-24 lg:py-32">
                <div className="absolute inset-0 gradient-mesh opacity-50" />
                <div className="blob blob-3" />

                <div className="container relative mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium mb-6">
                            <Sparkles className="h-4 w-4 text-primary" />
                            FAQ
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                            Frequently Asked{' '}
                            <span className="  ">Questions</span>
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Find quick answers to common questions about our services.
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {[
                            { q: 'How do I schedule an appointment?', a: 'You can book an appointment online through our website, call our reception, or visit us in person.' },
                            { q: 'What insurance plans do you accept?', a: 'We accept most major insurance plans. Please contact us to verify your specific coverage.' },
                            { q: 'Do you offer emergency services?', a: 'Yes, our emergency department is open 24/7 for urgent medical needs.' },
                            { q: 'Can I request a specific doctor?', a: 'Absolutely! When booking your appointment, you can request your preferred physician.' },
                        ].map((faq, index) => (
                            <Card
                                key={index}
                                className="group card-hover border-border/50 bg-card/50 glass animate-slide-up overflow-hidden"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                                            <span className="text-primary-foreground font-bold text-sm">{index + 1}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-foreground mb-2">{faq.q}</h3>
                                            <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
