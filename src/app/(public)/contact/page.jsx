'use client'
import React, { useState } from 'react'
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import PageTransition from '../_components/PageTransition';


import { sendContactEmail } from './_actions/send-contact-email';


const contactSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    company: z.string().optional(),
    mobile: z.string().min(10, "Please enter a valid mobile number"),
    message: z.string().min(10, "Message must be at least 20 characters"),
});

const contactInfo = [
    {
        icon: Mail,
        title: "Email Us",
        details: "hello@devlomatixsolutions.com",
        description: "We'll respond within 24 hours",
    },
    {
        icon: Phone,
        title: "Call Us",
        details: "+91 97123 40450",
        description: "Mon-Fri from 9am to 6pm IST",
    },
    {
        icon: MapPin,
        title: "Visit Us",
        details: "Cyber Hub, DLF Phase 2",
        description: "Gurugram, Haryana 122002",
    },
    {
        icon: Clock,
        title: "Business Hours",
        details: "Monday - Friday",
        description: "9:00 AM - 6:00 PM PST",
    },
];


export default function ContactPage() {

    const [isSubmitted, setIsSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        resolver: zodResolver(contactSchema),
    });

    const onSubmit = async (data) => {
        try {
            const result = await sendContactEmail(data);

            if (result.success) {
                setIsSubmitted(true);
                toast.success("Message sent successfully!");
                reset();
                setTimeout(() => setIsSubmitted(false), 5000);
            } else {
                toast.error(result.error || "Failed to send message. Please try again.");
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("An unexpected error occurred. Please try again.");
        }
    };


    return (
        <PageTransition>
            <div className="min-h-screen bg-background">


                {/* Hero Section */}
                <section className="pt-32 pb-20 relative">
                    <div className="absolute inset-0 grid-pattern opacity-20" />
                    <div className="container mx-auto px-6 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center max-w-3xl mx-auto"
                        >
                            <span className="text-primary text-sm font-medium tracking-wider uppercase">
                                Contact Us
                            </span>
                            <h1 className="font-display text-4xl md:text-6xl font-bold mt-4 mb-6">
                                Let's Start a <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Conversation</span>
                            </h1>
                            <p className="text-muted-foreground text-lg md:text-xl">
                                Have a project in mind? We'd love to hear from you. Send us a message
                                and we'll respond as soon as possible.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Contact Info Cards */}
                <section className="py-12">
                    <div className="container mx-auto px-6">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {contactInfo.map((info, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="glass-card p-6 text-center"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-[hsl(260,100%,65%,0.2)] flex items-center justify-center mx-auto mb-4">
                                        <info.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="font-display font-semibold text-foreground mb-1">
                                        {info.title}
                                    </h3>
                                    <p className="text-foreground font-medium">{info.details}</p>
                                    <p className="text-sm text-muted-foreground">{info.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact Form Section */}
                <section className="py-20">
                    <div className="container mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-16 items-start">
                            {/* Left Column - Info */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                                    Ready to Transform Your{" "}
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Business</span>?
                                </h2>
                                <p className="text-muted-foreground text-lg mb-8">
                                    Whether you're looking to build a new product, automate processes,
                                    or modernize your existing systems, we're here to help you succeed.
                                </p>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground mb-1">
                                                Free Consultation
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                Get a free 30-minute consultation to discuss your project
                                                requirements.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground mb-1">
                                                Custom Solutions
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                Every project is unique. We create tailored solutions for
                                                your specific needs.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground mb-1">
                                                Dedicated Support
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                Our team provides ongoing support throughout and after your
                                                project.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Right Column - Form */}
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                                className="glass-card p-8"
                            >
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                placeholder="Rahul Sharma"
                                                {...register("name")}
                                                className={errors.name ? "border-destructive" : ""}
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-destructive">{errors.name.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="rahul@company.in"
                                                {...register("email")}
                                                className={errors.email ? "border-destructive" : ""}
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-destructive">{errors.email.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="company">Company</Label>
                                            <Input
                                                id="company"
                                                placeholder="Your Company"
                                                {...register("company")}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="mobile">Mobile Number *</Label>
                                            <Input
                                                id="mobile"
                                                type="tel"
                                                placeholder="+91 98765 43210"
                                                {...register("mobile")}
                                                className={errors.mobile ? "border-destructive" : ""}
                                            />
                                            {errors.mobile && (
                                                <p className="text-sm text-destructive">
                                                    {errors.mobile.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message *</Label>
                                        <Textarea
                                            id="message"
                                            placeholder="Tell us about your project..."
                                            rows={6}
                                            {...register("message")}
                                            className={errors.message ? "border-destructive" : ""}
                                        />
                                        {errors.message && (
                                            <p className="text-sm text-destructive">{errors.message.message}</p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        className="w-full"
                                        disabled={isSubmitting || isSubmitted}
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                                                />

                                                Sending...
                                            </span>
                                        ) : isSubmitted ? (
                                            <span className="flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5" />
                                                Message Sent!
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Send className="w-5 h-5" />
                                                Send Message
                                            </span>
                                        )}
                                    </Button>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                </section>


            </div>
        </PageTransition>
    )
}
