'use client'
import React from 'react'
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactFormModal from '../_components/ContactFormModal';


const pricingPlans = [
    {
        name: "Starter",
        description: "Perfect for small clinics and nursing homes",
        price: "₹9,999",
        period: "/month",
        features: [
            "OPD Management",
            "Patient Registration",
            "Basic Billing",
            "Appointment Scheduling",
            "Up to 5 Users",
            "Email Support",
            "Basic Reports",
            "Data Backup (Weekly)"
        ],
        cta: "Get Started",
        popular: false
    },
    {
        name: "Professional",
        description: "Ideal for growing hospitals and multi-specialty clinics",
        price: "₹24,999",
        period: "/month",
        features: [
            "Everything in Starter",
            "IPD Management",
            "Pathology Module (500+ Reports)",
            "Radiology Module (500+ Templates)",
            "Pharmacy Management",
            "TPA & Company Tie-ups",
            "Up to 20 Users",
            "Priority Support",
            "Daily Auto Cloud Backup",
            "Advanced Reports & Analytics"
        ],
        cta: "Get Started",
        popular: true
    },
    {
        name: "Enterprise",
        description: "For large hospitals and healthcare networks",
        price: "Custom",
        period: "",
        features: [
            "Everything in Professional",
            "Unlimited Users",
            "Custom Integrations",
            "Dedicated Account Manager",
            "24/7 Phone Support",
            "On-premise Deployment Option",
            "Training & Onboarding",
            "Custom Report Builder",
            "API Access",
            "SLA Guarantee"
        ],
        cta: "Contact Sales",
        popular: false
    }
];

const addOns = [
    { name: "Mobile Application", price: "₹4,999/month", description: "iOS & Android app for doctors" },
    { name: "SMS/Email Marketing", price: "₹2,999/month", description: "Bulk SMS and email campaigns" },
    { name: "Additional Users Pack", price: "₹999/user/month", description: "Add more users to your plan" },
    { name: "Advanced Analytics", price: "₹3,999/month", description: "Executive dashboards and insights" },
];


export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background w-full">

            <main className="pt-16 md:pt-20">
                {/* Hero Section */}
                <section className="py-20 md:py-28 bg-gradient-to-b from-primary/5 to-background">
                    <div className="container mx-auto px-4 md:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center max-w-4xl mx-auto"
                        >
                            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                                Simple & Transparent Pricing
                            </span>
                            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                                Choose the Right Plan for{" "}
                                <span className="text-primary">Your Hospital</span>
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                                Flexible pricing plans designed for healthcare facilities of all sizes.
                                Start small and scale as you grow.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Pricing Cards */}
                <section className="py-16 md:py-24">
                    <div className="container mx-auto px-4 md:px-8">
                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {pricingPlans.map((plan, index) => (
                                <motion.div
                                    key={plan.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className={`relative rounded-3xl p-8 ${plan.popular
                                        ? 'bg-primary/5 border-2 border-primary shadow-xl'
                                        : 'bg-card border border-border'
                                        }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                            <span className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-full">
                                                Most Popular
                                            </span>
                                        </div>
                                    )}

                                    <div className="text-center mb-8">
                                        <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                                            {plan.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-6">
                                            {plan.description}
                                        </p>
                                        <div className="flex items-baseline justify-center">
                                            <span className="text-4xl md:text-5xl font-bold text-foreground">
                                                {plan.price}
                                            </span>
                                            <span className="text-muted-foreground ml-2">
                                                {plan.period}
                                            </span>
                                        </div>
                                    </div>

                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-muted-foreground">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <ContactFormModal title={plan.cta}>
                                        <Button
                                            className={`w-full py-6 rounded-xl ${plan.popular
                                                ? 'hero-gradient text-primary-foreground shadow-glow'
                                                : ''
                                                }`}
                                            variant={plan.popular ? "default" : "outline"}
                                        >
                                            {plan.cta}
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </ContactFormModal>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Add-ons Section */}
                <section className="py-16 md:py-24 bg-secondary/30">
                    <div className="container mx-auto px-4 md:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                                Add-on Modules
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Enhance your HMS with additional features and modules
                            </p>
                        </motion.div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                            {addOns.map((addon, index) => (
                                <motion.div
                                    key={addon.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="p-6 bg-card border border-border rounded-2xl hover:border-primary/50 transition-colors"
                                >
                                    <h3 className="font-semibold text-foreground mb-2">{addon.name}</h3>
                                    <p className="text-primary font-bold mb-2">{addon.price}</p>
                                    <p className="text-sm text-muted-foreground">{addon.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-16 md:py-24">
                    <div className="container mx-auto px-4 md:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                                Frequently Asked Questions
                            </h2>
                        </motion.div>

                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {[
                                { q: "Can I upgrade my plan later?", a: "Yes, you can upgrade your plan at any time. Your data will be preserved and you'll only pay the difference." },
                                { q: "Is there a free trial?", a: "Yes, we offer a 14-day free trial on all plans. No credit card required to start." },
                                { q: "What payment methods do you accept?", a: "We accept all major credit/debit cards, UPI, net banking, and bank transfers for enterprise plans." },
                                { q: "Do you offer training?", a: "Yes, all plans include basic training. Enterprise plans include comprehensive on-site training." },
                                { q: "Is my data secure?", a: "Absolutely. We use enterprise-grade encryption and comply with healthcare data protection standards." },
                                { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription anytime. We offer a 30-day money-back guarantee." },
                            ].map((faq, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className="p-6 bg-card border border-border rounded-2xl"
                                >
                                    <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 md:py-28 bg-gradient-to-br from-primary/10 via-background to-accent/10">
                    <div className="container mx-auto px-4 md:px-8 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                                Not Sure Which Plan to Choose?
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                                Talk to our team and we'll help you find the perfect plan for your hospital.
                            </p>
                            <ContactFormModal title="Schedule a Demo">
                                <Button
                                    size="lg"
                                    className="hero-gradient text-primary-foreground px-8 py-6 text-lg rounded-xl shadow-glow hover:shadow-xl transition-all"
                                >
                                    Schedule a Free Demo
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </ContactFormModal>
                        </motion.div>
                    </div>
                </section>
            </main>

        </div>
    )
}
