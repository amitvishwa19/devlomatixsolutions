'use client'
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    Hospital,
    Users,
    Activity,
    Shield,
    Clock,
    Zap,
    CheckCircle2,
    ArrowRight,
    Stethoscope,
    Calendar,
    FileText,
    CreditCard,
    BarChart3,
    Layers,
    MessageSquare,
    Play,
    TrendingUp,
    Star,
    ArrowDown,
    LayoutDashboard,
    Wallet,
    Presentation,
    MonitorSmartphone,
    Share2,
    Handshake,
    AlertCircle,
    ShoppingBag,
    HeartPulse,
    GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import curexaLogo from "@/assets/images/logo/curexa_logo.png";
import ContactFormModal from "@/app/(public)/_components/ContactFormModal";

const slides = [
    {
        id: 1,
        type: "cover",
        title: "Curexa",
        subtitle: "Where Care Meets Intelligence",
        tagline: "Smart Hospital Management Made Simple",
    },
    {
        id: 2,
        type: "challenges",
        title: "Daily Challenges in Hospitals",
        subtitle: "The hidden obstacles slowing down your care delivery",
        points: [
            { icon: Users, text: "Long patient queues & waiting room chaos" },
            { icon: FileText, text: "Manual paperwork & missing patient files" },
            { icon: CreditCard, text: "Slow billing & payment reconciliation" },
            { icon: AlertCircle, text: "Staff confusion & fragmented records" },
            { icon: MessageSquare, text: "Poor patient communication & follow-ups" }
        ]
    },
    {
        id: 3,
        type: "impact",
        title: "What This Causes",
        subtitle: "The ripple effect of inefficiencies",
        impacts: [
            { label: "Time Loss", desc: "Hours wasted on administrative data entry", severity: "high" },
            { label: "Staff Inefficiency", desc: "Burnout from manual tracking tasks", severity: "high" },
            { label: "Patient Dissatisfaction", desc: "Frustration from long wait times", severity: "medium" },
            { label: "Revenue Leakage", desc: "Unbilled services & poor collection", severity: "urgent" }
        ]
    },
    {
        id: 4,
        type: "intro",
        headline: "A smarter way to manage your hospital",
        title: "Introducing Curexa",
        points: [
            { icon: Zap, text: "Fast: Lightning-quick patient onboarding" },
            { icon: CheckCircle2, text: "Simple: Zero learning curve for staff" },
            { icon: Activity, text: "Intelligent: Data-driven insights automagically" },
            { icon: Hospital, text: "Built for real hospital workflows" }
        ]
    },
    {
        id: 5,
        type: "benefits",
        title: "What Curexa Does",
        subtitle: "Streamlining operations from front-office to discharge",
        benefits: [
            { icon: Activity, title: "Patient Journey", desc: "Manages complete journey across all touchpoints" },
            { icon: Zap, title: "Task Automation", desc: "Automates repetitive daily paperwork & tracking" },
            { icon: FileText, title: "Reduced Manual Work", desc: "90% reduction in manual data entry errors" },
            { icon: HeartPulse, title: "Patient Experience", desc: "Smoother visits and better care outcomes" }
        ]
    },
    {
        id: 6,
        type: "flow",
        title: "Complete Patient Flow",
        subtitle: "All in one integrated system",
        steps: [
            { id: 1, label: "Patient Arrives" },
            { id: 2, label: "Register" },
            { id: 3, label: "Assign Doctor" },
            { id: 4, label: "Consultation" },
            { id: 5, label: "Prescription" },
            { id: 6, label: "Billing" },
            { id: 7, label: "Discharge" }
        ]
    },
    {
        id: 7,
        type: "frontdesk",
        title: "Front Desk Made Simple",
        message: "No more paperwork or confusion",
        mockup: {
            title: "Patient Quick Register",
            fields: ["Name: Rajesh Kumar", "Age: 45", "Visit: Regular Checkup"],
            action: "Assign to Dr. Sharma"
        }
    },
    {
        id: 8,
        type: "doctor",
        title: "Doctor Experience",
        message: "Doctors focus on patients, not software",
        features: [
            { icon: MonitorSmartphone, text: "Quick consultation screen" },
            { icon: FileText, text: "Easy prescription generation" },
            { icon: Clock, text: "Full patient history access" }
        ]
    },
    {
        id: 9,
        type: "billing",
        title: "Billing & Payments",
        message: "Faster billing = more revenue",
        features: [
            { icon: Wallet, text: "Automatic invoice generation" },
            { icon: Zap, text: "Fast billing process" },
            { icon: BarChart3, text: "Real-time payment tracking" }
        ]
    },
    {
        id: 10,
        type: "whatsapp",
        title: "WhatsApp Automation",
        subtitle: "Patients receive everything instantly",
        automations: [
            { type: "Prescription", desc: "Sent on WhatsApp immediately after consultation" },
            { type: "Reminders", desc: "Automated appointment reminders" },
            { type: "Alerts", desc: "Billing & payment receipt alerts" }
        ]
    },
    {
        id: 11,
        type: "dashboard",
        title: "Real-Time Dashboard",
        message: "Complete control at a glance",
        stats: [
            { label: "Today's Revenue", value: "₹45,200", icon: TrendingUp },
            { label: "Patient Count", value: "128", icon: Users },
            { label: "Pending Payments", value: "₹12,400", icon: AlertCircle }
        ]
    },
    {
        id: 12,
        type: "love",
        title: "Why Hospitals Love Curexa",
        reasons: [
            { icon: Clock, text: "Saves hours every single day" },
            { icon: CheckCircle2, text: "Unbelievably easy to use" },
            { icon: Users, text: "Drastically reduces staff workload" },
            { icon: HeartPulse, text: "Improves patient satisfaction & retention" }
        ]
    },
    {
        id: 13,
        type: "pricing",
        title: "Simple & Affordable Pricing",
        plans: [
            { name: "Starter", target: "Clinics", price: "₹2,999/mo", features: ["OPD Management", "Waitlist Handling", "Digital RX"] },
            { name: "Growth", target: "Most Popular", price: "₹7,499/mo", features: ["Everything in Starter", "Billing & Inventory", "WhatsApp Sync"], popular: true },
            { name: "Pro", target: "Hospitals", price: "₹14,999/mo", features: ["Everything in Growth", "IPD & Pharmacy", "Multi-doctor support"] }
        ]
    },
    {
        id: 14,
        type: "riskfree",
        title: "No-Risk Start",
        subtitle: "We help you go live smoothly",
        points: [
            { icon: Play, text: "7-day free trial" },
            { icon: Zap, text: "Quick & easy setup" },
            { icon: GraduationCap, text: "Staff training included" }
        ]
    },
    {
        id: 15,
        type: "closing",
        title: "Transform your hospital operations today",
        subtext: "Save time. Increase revenue. Improve care.",
        cta: "Book a Demo / Start Free Trial"
    }
];

const Layout = ({ children, currentSlide, totalSlides, onNext, onPrev, onSelect }) => (
    <div className="h-screen w-screen bg-background overflow-hidden relative font-sans text-foreground">
        {/* Soft Background Mesh - Matches Public Hero */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[100px]" />
            <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[100px]" />
            <div className="absolute inset-0 opacity-[0.03] grid-pattern" />
        </div>

        <div className="absolute top-6 left-8 flex items-center gap-2 z-20">
            <div className="p-1 px-3 bg-white shadow-sm border border-border rounded-xl flex items-center gap-2">
                <img src={curexaLogo.src} alt="Curexa" className="h-6 md:h-8" />
                <span className="text-xl font-bold hero-gradient-text">Curexa</span>
            </div>
        </div>

        <AnimatePresence mode="wait">
            <motion.div
                key={currentSlide}
                className="absolute inset-0 flex items-center justify-center p-6 md:p-12 lg:p-20 overflow-hidden"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
            >
                <div className="w-full h-full max-w-7xl flex items-center justify-center overflow-y-auto custom-scrollbar pr-2 pt-20 pb-20 md:pt-0 md:pb-0">
                    {children}
                </div>
            </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
            <Button
                variant="outline"
                size="icon"
                onClick={onPrev}
                disabled={currentSlide === 0}
                className="rounded-full bg-background border-border text-foreground hover:bg-accent disabled:opacity-20 transition-all shadow-sm"
            >
                <ChevronLeft className="h-6 w-6" />
            </Button>

            <div className="flex gap-2">
                {Array.from({ length: totalSlides }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => onSelect(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? "w-8 bg-primary shadow-glow" : "w-1.5 bg-muted hover:bg-muted-foreground/30"}`}
                    />
                ))}
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={onNext}
                disabled={currentSlide === totalSlides - 1}
                className="rounded-full bg-background border-border text-foreground hover:bg-accent disabled:opacity-20 transition-all shadow-sm"
            >
                <ChevronRight className="h-6 w-6" />
            </Button>
        </div>

        <div className="absolute bottom-8 right-8 text-sm text-muted-foreground font-medium bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full border border-border/50">
            {currentSlide + 1} / {totalSlides}
        </div>
    </div>
);

const SectionTitle = ({ title, subtitle, centered = true }) => (
    <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
        <h2 className="text-4xl md:text-6xl font-black text-foreground mb-4 tracking-tighter leading-tight">{title}</h2>
        {subtitle && <p className="text-lg md:text-2xl text-muted-foreground font-medium">{subtitle}</p>}
    </div>
);

export default function Page() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
    const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

    useEffect(() => {
        const handleKeys = (e) => {
            if (e.key === "ArrowRight" || e.key === " ") nextSlide();
            if (e.key === "ArrowLeft") prevSlide();
        };
        window.addEventListener("keydown", handleKeys);
        return () => window.removeEventListener("keydown", handleKeys);
    }, []);

    const slide = slides[currentSlide];

    return (
        <Layout
            currentSlide={currentSlide}
            totalSlides={slides.length}
            onNext={nextSlide}
            onPrev={prevSlide}
            onSelect={setCurrentSlide}
        >
            {slide.type === "cover" && (
                <div className="flex flex-col items-center text-center py-8">
                    <motion.div
                        className="bg-primary/5 p-8 rounded-[2.5rem] mb-8 border border-primary/10 shadow-sm"
                        initial={{ scale: 0.8, rotate: -5 }}
                        animate={{ scale: 1, rotate: 0 }}
                    >
                        <Hospital className="h-20 w-20 text-primary" />
                    </motion.div>
                    <h1 className="text-6xl sm:text-8xl md:text-[8rem] font-black tracking-tighter text-foreground mb-4 leading-none">
                        <span className="bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">{slide.title}</span>
                    </h1>
                    <p className="text-xl sm:text-3xl md:text-4xl font-semibold text-muted-foreground mb-6">{slide.subtitle}</p>
                    <div className="module-badge">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        {slide.tagline}
                    </div>
                </div>
            )}

            {slide.type === "challenges" && (
                <div className="max-w-4xl w-full">
                    <SectionTitle title={slide.title} subtitle={slide.subtitle} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {slide.points.map((p, i) => (
                            <motion.div
                                key={i}
                                className="flex items-center gap-4 bg-card p-6 rounded-2xl border border-border hover:border-primary/50 hover:shadow-lg transition-all"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="p-3 bg-destructive/10 rounded-xl text-destructive border border-destructive/20">
                                    <p.icon className="h-6 w-6" />
                                </div>
                                <p className="text-xl font-semibold text-foreground">{p.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {slide.type === "impact" && (
                <div className="max-w-5xl w-full">
                    <SectionTitle title={slide.title} subtitle={slide.subtitle} />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {slide.impacts.map((imp, i) => (
                            <motion.div
                                key={i}
                                className="bg-card p-8 rounded-2xl border border-border border-t-4 border-t-destructive text-center hover:shadow-xl transition-all"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className={`mb-4 mx-auto w-fit px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest ${imp.severity === 'urgent' ? 'bg-destructive text-destructive-foreground' : 'bg-destructive/10 text-destructive'}`}>
                                    {imp.severity}
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-foreground">{imp.label}</h3>
                                <p className="text-muted-foreground font-medium">{imp.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {slide.type === "intro" && (
                <div className="max-w-4xl w-full">
                    <div className="mb-12">
                        <span className="text-primary font-bold uppercase tracking-wider mb-2 block">{slide.headline}</span>
                        <h2 className="text-5xl md:text-7xl font-bold text-foreground tracking-tighter">{slide.title}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {slide.points.map((p, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20">
                                    <p.icon className="h-7 w-7" />
                                </div>
                                <p className="text-2xl text-foreground font-semibold italic">{p.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {slide.type === "benefits" && (
                <div className="max-w-5xl w-full">
                    <SectionTitle title={slide.title} subtitle={slide.subtitle} />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {slide.benefits.map((b, i) => (
                            <div key={i} className="bg-card p-8 rounded-2xl border border-border hover:border-primary/50 transition-all hover:-translate-y-2 shadow-sm hover:shadow-md">
                                <div className="p-4 bg-primary/10 rounded-xl text-primary w-fit mb-6 border border-primary/20">
                                    <b.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-foreground">{b.title}</h3>
                                <p className="text-muted-foreground font-medium text-sm leading-relaxed">{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {slide.type === "flow" && (
                <div className="max-w-6xl w-full">
                    <SectionTitle title={slide.title} subtitle={slide.subtitle} />
                    <div className="flex flex-wrap justify-center items-center gap-4">
                        {slide.steps.map((s, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="bg-card px-8 py-5 rounded-xl border border-border flex items-center gap-4 shadow-sm">
                                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-black shadow-glow">{s.id}</div>
                                    <span className="font-bold text-foreground text-lg">{s.label}</span>
                                </div>
                                {i < slide.steps.length - 1 && <ArrowRight className="text-muted-foreground h-6 w-6" />}
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 text-center">
                        <span className="module-badge italic">“All in one system”</span>
                    </div>
                </div>
            )}

            {slide.type === "frontdesk" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl w-full">
                    <div>
                        <SectionTitle title={slide.title} subtitle={slide.message} centered={false} />
                        <ul className="space-y-6">
                            <li className="flex items-center gap-4 text-2xl text-foreground font-medium">
                                <CheckCircle2 className="text-primary h-8 w-8" /> Fast Registration
                            </li>
                            <li className="flex items-center gap-4 text-2xl text-foreground font-medium">
                                <CheckCircle2 className="text-primary h-8 w-8" /> Appointment Calendar
                            </li>
                            <li className="flex items-center gap-4 text-2xl text-foreground font-medium">
                                <CheckCircle2 className="text-primary h-8 w-8" /> Live Queue Status
                            </li>
                        </ul>
                    </div>
                    <div className="bg-card p-10 rounded-3xl border border-border shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16" />
                        <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
                            <h4 className="font-black text-muted-foreground uppercase text-xs tracking-widest">{slide.mockup.title}</h4>
                            <div className="flex gap-2">
                                <div className="h-2 w-2 rounded-full bg-destructive/50" />
                                <div className="h-2 w-2 rounded-full bg-amber-400/50" />
                                <div className="h-2 w-2 rounded-full bg-primary/50" />
                            </div>
                        </div>
                        <div className="space-y-4 mb-8">
                            {slide.mockup.fields.map((f, idx) => (
                                <div key={idx} className="bg-muted/50 p-5 rounded-xl font-bold text-foreground border border-border/50">{f}</div>
                            ))}
                        </div>
                        <Button className="w-full hero-gradient text-primary-foreground h-14 rounded-xl text-xl font-black shadow-glow">{slide.mockup.action}</Button>
                    </div>
                </div>
            )}

            {slide.type === "doctor" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl w-full">
                    <div className="bg-slate-900 shadow-2xl aspect-video relative overflow-hidden rounded-3xl border border-border group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-4 left-4 flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-destructive/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-primary/50" />
                        </div>
                        <div className="h-full flex flex-col justify-center px-10">
                            <div className="bg-white/5 w-full h-8 rounded-lg mb-4 border border-white/5" />
                            <div className="bg-white/5 w-3/4 h-8 rounded-lg mb-4 border border-white/5" />
                            <div className="bg-white/5 w-1/2 h-8 rounded-lg border border-white/5" />
                        </div>
                        <div className="absolute bottom-8 right-8">
                            <div className="bg-primary px-6 py-2 rounded-lg shadow-glow text-xs font-black text-primary-foreground uppercase tracking-widest italic">Digital Prescription</div>
                        </div>
                    </div>
                    <div>
                        <SectionTitle title={slide.title} subtitle={slide.message} centered={false} />
                        <div className="space-y-8">
                            {slide.features.map((f, i) => (
                                <div key={i} className="flex items-center gap-6 group">
                                    <div className="p-4 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all border border-primary/20 group-hover:scale-110">
                                        <f.icon className="h-7 w-7" />
                                    </div>
                                    <span className="text-2xl font-bold text-foreground">{f.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {slide.type === "billing" && (
                <div className="max-w-4xl w-full">
                    <SectionTitle title={slide.title} subtitle={slide.message} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {slide.features.map((f, i) => (
                            <div key={i} className="group flex flex-col items-center">
                                <div className="w-24 h-24 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform shadow-sm">
                                    <f.icon className="h-10 w-10" />
                                </div>
                                <h3 className="text-xl font-black text-foreground text-center tracking-tight">{f.text}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {slide.type === "whatsapp" && (
                <div className="max-w-5xl w-full flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1">
                        <SectionTitle title={slide.title} subtitle={slide.subtitle} centered={false} />
                        <div className="space-y-6">
                            {slide.automations.map((a, i) => (
                                <div key={i} className="bg-card p-6 rounded-2xl border-l-4 border-l-primary border border-border shadow-sm">
                                    <h4 className="font-black text-primary mb-2 uppercase tracking-widest text-xs">{a.type}</h4>
                                    <p className="text-xl font-semibold text-foreground">{a.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-full md:w-80 bg-slate-900 rounded-[3rem] p-5 shadow-2xl border-[10px] border-slate-800 relative ring-1 ring-white/10">
                        <div className="bg-slate-800 w-32 h-6 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-2xl z-20" />
                        <div className="bg-[#075e54] -mx-5 -mt-5 h-20 flex items-center px-8 gap-4 mb-6 rounded-t-[2.3rem]">
                            <div className="h-10 w-10 rounded-full bg-slate-200/20 backdrop-blur-md border border-white/10" />
                            <div className="text-white">
                                <p className="text-xs font-black tracking-tight">Curexa Health</p>
                                <p className="text-[10px] opacity-70">Online</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none shadow-sm text-sm mr-8 text-slate-300">
                                Hello Priya, your prescription for today's visit is ready!
                            </div>
                            <div className="bg-emerald-500/20 border border-emerald-500/30 p-4 rounded-2xl rounded-tl-none shadow-sm text-sm mr-4 font-black text-emerald-400 underline decoration-emerald-400 cursor-pointer">
                                Download_RX.pdf
                            </div>
                            <div className="bg-white/10 border border-white/10 p-4 rounded-2xl rounded-tr-none shadow-sm text-sm ml-12 text-right text-slate-100 italic">
                                Thank you! That was fast and easy. 🚀
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {slide.type === "dashboard" && (
                <div className="max-w-5xl w-full">
                    <SectionTitle title={slide.title} subtitle={slide.message} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        {slide.stats.map((s, i) => (
                            <div key={i} className="bg-card p-10 rounded-3xl border border-border flex flex-col items-center hover:shadow-xl transition-all">
                                <div className="p-5 bg-primary/10 rounded-2xl text-primary mb-6 border border-primary/20">
                                    <s.icon className="h-10 w-10" />
                                </div>
                                <span className="text-muted-foreground text-xs mb-2 uppercase font-black tracking-[0.2em]">{s.label}</span>
                                <span className="text-5xl font-black text-foreground tracking-tighter">{s.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {slide.type === "love" && (
                <div className="max-w-4xl w-full">
                    <SectionTitle title={slide.title} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {slide.reasons.map((r, i) => (
                            <div key={i} className="flex items-center gap-8 bg-primary/5 p-8 rounded-3xl border border-primary/10 hover:bg-primary/10 transition-all group">
                                <div className="p-5 bg-primary rounded-2xl text-primary-foreground shadow-glow group-hover:scale-110 transition-transform">
                                    <r.icon className="h-9 w-9" />
                                </div>
                                <span className="text-2xl font-black text-foreground leading-tight italic tracking-tight">{r.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {slide.type === "pricing" && (
                <div className="max-w-6xl w-full">
                    <SectionTitle title={slide.title} subtitle="Affordable monthly plans" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                        {slide.plans.map((p, i) => (
                            <div key={i} className={`bg-card p-10 rounded-3xl border-t-[12px] flex flex-col h-full shadow-sm ring-1 ring-border ${p.popular ? 'border-primary scale-105 shadow-xl relative z-10' : 'border-muted'}`}>
                                <h3 className="text-3xl font-black mb-2 text-foreground italic">{p.name}</h3>
                                <p className="text-muted-foreground font-black text-xs uppercase tracking-[0.3em] mb-8">{p.target}</p>
                                <div className="text-5xl font-black text-foreground mb-8 tracking-tighter">
                                    {p.price}
                                </div>
                                <ul className="space-y-4 mb-10 flex-1">
                                    {p.features.map((f, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-foreground font-semibold italic text-sm">
                                            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <Button className={`w-full h-14 rounded-xl text-lg font-black transition-all hover:scale-105 active:scale-95 ${p.popular ? 'hero-gradient text-primary-foreground shadow-glow' : 'bg-muted hover:bg-muted/80 text-foreground'}`}>Get Started</Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {slide.type === "riskfree" && (
                <div className="max-w-4xl w-full">
                    <SectionTitle title={slide.title} subtitle={slide.subtitle} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        {slide.points.map((p, i) => (
                            <div key={i} className="group">
                                <div className="mx-auto w-24 h-24 bg-primary/10 rounded-3xl border border-primary/20 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm">
                                    <p.icon className="h-10 w-10" />
                                </div>
                                <h3 className="text-2xl font-black text-foreground italic tracking-tight">{p.text}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {slide.type === "closing" && (
                <div className="text-center max-w-4xl w-full py-10">
                    <SectionTitle title={slide.title} subtitle={slide.subtext} />
                    <ContactFormModal title="Book Your Demo">
                        <Button className="hero-gradient text-primary-foreground px-12 py-8 text-2xl font-black rounded-2xl shadow-glow flex items-center gap-4 mx-auto transition-all hover:scale-105 active:scale-95 group">
                            {slide.cta} <ArrowRight className="h-8 w-8 group-hover:translate-x-2 transition-transform" />
                        </Button>
                    </ContactFormModal>
                    <div className="mt-16 flex flex-wrap justify-center gap-10 text-muted-foreground font-black uppercase tracking-[0.3em] text-xs italic">
                        <span className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Save Time</span>
                        <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Increase Revenue</span>
                        <span className="flex items-center gap-2"><HeartPulse className="h-4 w-4 text-primary" /> Improve Care</span>
                    </div>
                </div>
            )}
        </Layout>
    );
};


