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
    <div className="h-screen w-screen bg-[#020617] overflow-hidden relative font-sans text-slate-100">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />

        <div className="absolute top-6 left-8 flex items-center gap-2 z-20">
            <div className="p-1.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/10">
                <img src={curexaLogo.src} alt="Curexa" className="h-6 md:h-8" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Curexa</span>
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
                variant="ghost"
                size="icon"
                onClick={onPrev}
                disabled={currentSlide === 0}
                className="rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 disabled:opacity-20 transition-all"
            >
                <ChevronLeft className="h-6 w-6" />
            </Button>

            <div className="flex gap-2">
                {Array.from({ length: totalSlides }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => onSelect(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? "w-8 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "w-1.5 bg-white/20 hover:bg-white/40"}`}
                    />
                ))}
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={onNext}
                disabled={currentSlide === totalSlides - 1}
                className="rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 disabled:opacity-20 transition-all"
            >
                <ChevronRight className="h-6 w-6" />
            </Button>
        </div>

        <div className="absolute bottom-8 right-8 text-sm text-slate-500 font-medium">
            {currentSlide + 1} / {totalSlides}
        </div>
    </div>
);

const SectionTitle = ({ title, subtitle, centered = true }) => (
    <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
        <h2 className="text-3xl md:text-6xl font-black text-white mb-4 tracking-tight">{title}</h2>
        {subtitle && <p className="text-lg md:text-2xl text-slate-400 font-medium">{subtitle}</p>}
    </div>
);

const Page = () => {
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
                        className="bg-blue-500/10 p-8 rounded-[2.5rem] mb-8 border border-blue-500/20 backdrop-blur-xl shadow-[0_0_50px_rgba(59,130,246,0.1)]"
                        initial={{ scale: 0.8, rotate: -5 }}
                        animate={{ scale: 1, rotate: 0 }}
                    >
                        <Hospital className="h-20 w-20 text-blue-400" />
                    </motion.div>
                    <h1 className="text-6xl sm:text-8xl md:text-[10rem] font-black tracking-tighter text-white mb-4 leading-none">
                        <span className="bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">{slide.title}</span>
                    </h1>
                    <p className="text-xl sm:text-3xl md:text-4xl font-semibold text-slate-400 mb-6">{slide.subtitle}</p>
                    <div className="px-6 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
                        <p className="text-xs sm:text-sm md:text-base font-black text-blue-400 tracking-[0.2em] uppercase">{slide.tagline}</p>
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
                                className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-all hover:translate-x-2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-400 border border-rose-500/20">
                                    <p.icon className="h-6 w-6" />
                                </div>
                                <p className="text-xl font-semibold text-slate-200">{p.text}</p>
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
                                className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border-t-4 border-rose-500 text-center hover:bg-white/10 transition-all"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className={`mb-4 mx-auto w-fit px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest ${imp.severity === 'urgent' ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'bg-rose-500/20 text-rose-400'}`}>
                                    {imp.severity}
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-white">{imp.label}</h3>
                                <p className="text-slate-400 font-medium">{imp.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {slide.type === "intro" && (
                <div className="max-w-4xl w-full">
                    <div className="mb-12">
                        <span className="text-blue-600 font-bold uppercase tracking-wider mb-2 block">{slide.headline}</span>
                        <h2 className="text-5xl md:text-7xl font-bold text-slate-900">{slide.title}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {slide.points.map((p, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20">
                                    <p.icon className="h-7 w-7" />
                                </div>
                                <p className="text-2xl text-slate-300 leading-relaxed font-semibold italic">{p.text}</p>
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
                            <div key={i} className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-2">
                                <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400 w-fit mb-6 border border-blue-500/20">
                                    <b.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-white">{b.title}</h3>
                                <p className="text-slate-400 font-medium text-sm leading-relaxed">{b.desc}</p>
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
                                <div className="bg-white/5 backdrop-blur-md px-8 py-5 rounded-2xl border border-white/10 flex items-center gap-4 shadow-xl">
                                    <div className="h-8 w-8 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center font-black shadow-[0_0_15px_rgba(59,130,246,0.5)]">{s.id}</div>
                                    <span className="font-bold text-slate-100 text-lg">{s.label}</span>
                                </div>
                                {i < slide.steps.length - 1 && <ArrowRight className="text-slate-600 h-6 w-6" />}
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 text-center">
                        <span className="px-8 py-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-black tracking-widest uppercase italic">“All in one system”</span>
                    </div>
                </div>
            )}

            {slide.type === "frontdesk" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl w-full">
                    <div>
                        <SectionTitle title={slide.title} subtitle={slide.message} centered={false} />
                        <ul className="space-y-6">
                            <li className="flex items-center gap-4 text-2xl text-slate-300 font-medium">
                                <CheckCircle2 className="text-emerald-400 h-8 w-8" /> Fast Registration
                            </li>
                            <li className="flex items-center gap-4 text-2xl text-slate-300 font-medium">
                                <CheckCircle2 className="text-emerald-400 h-8 w-8" /> Appointment Calendar
                            </li>
                            <li className="flex items-center gap-4 text-2xl text-slate-300 font-medium">
                                <CheckCircle2 className="text-emerald-400 h-8 w-8" /> Live Queue Status
                            </li>
                        </ul>
                    </div>
                    <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/10 shadow-3xl">
                        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                            <h4 className="font-black text-slate-500 uppercase text-xs tracking-widest">{slide.mockup.title}</h4>
                            <div className="flex gap-2">
                                <div className="h-2 w-2 rounded-full bg-rose-400" />
                                <div className="h-2 w-2 rounded-full bg-amber-400" />
                                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                            </div>
                        </div>
                        <div className="space-y-4 mb-8">
                            {slide.mockup.fields.map((f, idx) => (
                                <div key={idx} className="bg-white/5 p-5 rounded-2xl font-bold text-slate-200 border border-white/5">{f}</div>
                            ))}
                        </div>
                        <Button className="w-full bg-blue-600 hover:bg-blue-500 h-14 rounded-2xl text-xl font-black shadow-[0_10px_30px_rgba(37,99,235,0.3)]">{slide.mockup.action}</Button>
                    </div>
                </div>
            )}

            {slide.type === "doctor" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl w-full">
                    <div className="bg-slate-900 shadow-2xl aspect-video relative overflow-hidden rounded-[2.5rem] border border-white/10 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-4 left-4 flex gap-1.5">
                             <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                             <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                             <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                        </div>
                        <div className="h-full flex flex-col justify-center px-10">
                            <div className="bg-white/5 w-full h-8 rounded-lg mb-4 border border-white/5" />
                            <div className="bg-white/5 w-3/4 h-8 rounded-lg mb-4 border border-white/5" />
                            <div className="bg-white/5 w-1/2 h-8 rounded-lg border border-white/5" />
                        </div>
                        <div className="absolute bottom-8 right-8">
                            <div className="bg-blue-500 px-6 py-2 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)] text-xs font-black text-white uppercase tracking-widest italic">Digital Prescription</div>
                        </div>
                    </div>
                    <div>
                        <SectionTitle title={slide.title} subtitle={slide.message} centered={false} />
                        <div className="space-y-8">
                            {slide.features.map((f, i) => (
                                <div key={i} className="flex items-center gap-6 group">
                                    <div className="p-4 bg-white/5 rounded-2xl text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all border border-white/10 group-hover:scale-110">
                                        <f.icon className="h-7 w-7" />
                                    </div>
                                    <span className="text-2xl font-bold text-slate-100">{f.text}</span>
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
                            <div key={i} className="group">
                                <div className="mx-auto w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-8 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                                    <f.icon className="h-10 w-10" />
                                </div>
                                <h3 className="text-xl font-black text-slate-100 text-center tracking-tight">{f.text}</h3>
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
                                <div key={i} className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border-l-4 border-emerald-500 border-r border-t border-b border-white/10 shadow-xl">
                                    <h4 className="font-black text-emerald-400 mb-2 uppercase tracking-widest text-xs">{a.type}</h4>
                                    <p className="text-xl font-semibold text-slate-200">{a.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-full md:w-80 bg-slate-900 rounded-[3rem] p-5 shadow-3xl border-[10px] border-slate-800 relative ring-1 ring-white/10">
                         <div className="bg-slate-800 w-32 h-6 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-2xl z-20" />
                         <div className="bg-emerald-600 -mx-5 -mt-5 h-20 flex items-center px-8 gap-4 mb-6 rounded-t-[2.3rem]">
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
                            <div className="bg-emerald-500/20 border border-emerald-500/30 p-4 rounded-2xl rounded-tl-none shadow-sm text-sm mr-4 font-black text-emerald-400 underline decoration-emerald-400">
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
                            <div key={i} className="bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/5 flex flex-col items-center hover:bg-white/10 transition-all shadow-2xl">
                                <div className="p-5 bg-blue-500/10 rounded-2xl text-blue-400 mb-6 border border-blue-500/20">
                                    <s.icon className="h-10 w-10" />
                                </div>
                                <span className="text-slate-500 text-xs mb-2 uppercase font-black tracking-[0.2em]">{s.label}</span>
                                <span className="text-5xl font-black text-white">{s.value}</span>
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
                            <div key={i} className="flex items-center gap-8 bg-emerald-500/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-emerald-500/20 hover:bg-emerald-500/10 transition-all group">
                                <div className="p-5 bg-emerald-500 rounded-3xl text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] group-hover:scale-110 transition-transform">
                                    <r.icon className="h-9 w-9" />
                                </div>
                                <span className="text-2xl font-black text-slate-100 leading-tight italic tracking-tight">{r.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {slide.type === "pricing" && (
                <div className="max-w-6xl w-full">
                    <SectionTitle title={slide.title} subtitle="Affordable monthly plans" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {slide.plans.map((p, i) => (
                            <div key={i} className={`bg-white/5 backdrop-blur-3xl p-12 rounded-[3rem] border-t-[12px] flex flex-col h-full ring-1 ring-white/10 ${p.popular ? 'border-blue-500 scale-105 shadow-[0_20px_80px_rgba(59,130,246,0.2)]' : 'border-slate-800 shadow-3xl overflow-hidden'}`}>
                                <h3 className="text-3xl font-black mb-2 text-white italic">{p.name}</h3>
                                <p className="text-slate-500 font-black text-xs uppercase tracking-[0.3em] mb-8">{p.target}</p>
                                <div className="text-5xl font-black text-white mb-10 tracking-tighter">
                                    {p.price}
                                </div>
                                <ul className="space-y-6 mb-12 flex-1">
                                    {p.features.map((f, idx) => (
                                        <li key={idx} className="flex items-center gap-4 text-slate-300 font-bold italic group">
                                            <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <Button className={`w-full h-16 rounded-[1.5rem] text-xl font-black shadow-2xl transition-all hover:scale-105 active:scale-95 ${p.popular ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}>Get Started</Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {slide.type === "riskfree" && (
                <div className="max-w-4xl w-full">
                    <SectionTitle title={slide.title} subtitle={slide.subtitle} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {slide.points.map((p, i) => (
                            <div key={i} className="text-center group">
                                <div className="mx-auto w-28 h-28 bg-blue-500/10 rounded-[3rem] border border-blue-500/20 flex items-center justify-center text-blue-400 mb-8 group-hover:bg-blue-500 group-hover:text-white transition-all duration-700 shadow-[0_0_40px_rgba(59,130,246,0.1)]">
                                    <p.icon className="h-12 w-12" />
                                </div>
                                <h3 className="text-3xl font-black text-white italic tracking-tight">{p.text}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {slide.type === "closing" && (
                <div className="text-center max-w-4xl w-full py-10">
                    <SectionTitle title={slide.title} subtitle={slide.subtext} />
                    <ContactFormModal title="Book Your Demo">
                        <Button className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white px-16 py-10 text-3xl font-black rounded-[2.5rem] shadow-[0_20px_50px_rgba(37,99,235,0.4)] flex items-center gap-6 mx-auto transition-all hover:scale-105 active:scale-95 group">
                            {slide.cta} <ArrowRight className="h-10 w-10 group-hover:translate-x-2 transition-transform" />
                        </Button>
                    </ContactFormModal>
                    <div className="mt-20 flex flex-wrap justify-center gap-16 text-slate-500 font-black uppercase tracking-[0.4em] text-xs md:text-sm italic">
                        <span className="flex items-center gap-3"><Zap className="h-4 w-4 text-amber-500" /> Save Time</span>
                        <span className="flex items-center gap-3"><TrendingUp className="h-4 w-4 text-emerald-500" /> Increase Revenue</span>
                        <span className="flex items-center gap-3"><HeartPulse className="h-4 w-4 text-rose-500" /> Improve Care</span>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Page;
