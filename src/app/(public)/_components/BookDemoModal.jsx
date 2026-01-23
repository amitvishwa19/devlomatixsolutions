import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, User, Mail, Phone, Building2, Users, MessageSquare, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const BookDemoModal = ({ children, title = "Schedule a Demo" }) => {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        size: "",
        date: "",
        time: "",
        message: "",
    });

    const getAvailableDates = () => {
        const dates = [];
        const today = new Date();
        for (let i = 1; i <= 21; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const day = date.getDay();
            if (day !== 0 && day !== 6) {
                dates.push(date);
            }
            if (dates.length >= 10) break;
        }
        return dates;
    };

    const availableDates = getAvailableDates();

    const timeSlots = [
        "09:00 AM",
        "10:00 AM",
        "11:00 AM",
        "02:00 PM",
        "03:00 PM",
        "04:00 PM",
    ];

    const companySizes = [
        { value: "1-10", label: "1-10 beds" },
        { value: "11-50", label: "11-50 beds" },
        { value: "51-100", label: "51-100 beds" },
        { value: "101-250", label: "101-250 beds" },
        { value: "250+", label: "250+ beds" },
    ];

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        setIsSuccess(true);
        toast({
            title: "Demo Scheduled! 🎉",
            description: "We'll send you a confirmation email shortly.",
        });
    };

    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            setTimeout(() => {
                setStep(1);
                setIsSuccess(false);
                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    company: "",
                    size: "",
                    date: "",
                    time: "",
                    message: "",
                });
            }, 200);
        }
    };

    const canProceedStep1 = formData.name && formData.email && formData.phone && formData.company && formData.size;
    const canProceedStep2 = formData.date && formData.time;

    const formatDate = (date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <AnimatePresence mode="wait">
                    {isSuccess ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-6"
                        >
                            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground mb-2">
                                Demo Scheduled!
                            </h2>
                            <p className="text-muted-foreground text-sm mb-4">
                                Confirmation sent to <strong>{formData.email}</strong>
                            </p>
                            <div className="p-4 rounded-xl bg-secondary/50 border border-border mb-6">
                                <div className="flex items-center justify-center gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <span>{formData.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-primary" />
                                        <span>{formData.time}</span>
                                    </div>
                                </div>
                            </div>
                            <Button onClick={() => handleOpenChange(false)}>Close</Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={`step-${step}`}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                        >
                            <DialogHeader className="mb-4">
                                <DialogTitle>{title}</DialogTitle>
                                {/* Progress Steps */}
                                <div className="flex items-center justify-center pt-4">
                                    {[1, 2, 3].map((s) => (
                                        <div key={s} className="flex items-center">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-colors ${step >= s
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-secondary text-muted-foreground"
                                                    }`}
                                            >
                                                {s}
                                            </div>
                                            {s < 3 && (
                                                <div
                                                    className={`w-12 h-0.5 mx-1 rounded-full transition-colors ${step > s ? "bg-primary" : "bg-secondary"
                                                        }`}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </DialogHeader>

                            {/* Step 1: Contact Info */}
                            {step === 1 && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-muted-foreground" />
                                                Full Name
                                            </label>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => handleChange("name", e.target.value)}
                                                placeholder="name "
                                                className="h-9"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                                Email
                                            </label>
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleChange("email", e.target.value)}
                                                placeholder="email@demo.com.com"
                                                className="h-9"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                                                Phone
                                            </label>
                                            <Input
                                                value={formData.phone}
                                                onChange={(e) => handleChange("phone", e.target.value)}
                                                placeholder="+91 9X765XX210"
                                                className="h-9"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                                                Hospital Name
                                            </label>
                                            <Input
                                                value={formData.company}
                                                onChange={(e) => handleChange("company", e.target.value)}
                                                placeholder="City General Hospital"
                                                className="h-9"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                            <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                            Hospital Size
                                        </label>
                                        <Select value={formData.size} onValueChange={(v) => handleChange("size", v)}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Select size" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {companySizes.map((size) => (
                                                    <SelectItem key={size.value} value={size.value}>
                                                        {size.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <Button onClick={() => setStep(2)} disabled={!canProceedStep1} size="sm" className="gap-1.5">
                                            Continue
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Pick Date & Time */}
                            {step === 2 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                            Select Date
                                        </label>
                                        <div className="grid grid-cols-5 gap-1.5">
                                            {availableDates.map((date, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => handleChange("date", formatDate(date))}
                                                    className={`p-2 rounded-lg border text-xs text-center transition-all ${formData.date === formatDate(date)
                                                        ? "bg-primary text-primary-foreground border-primary"
                                                        : "bg-secondary/50 border-border hover:border-primary/50"
                                                        }`}
                                                >
                                                    <div className="font-medium">{date.getDate()}</div>
                                                    <div className="text-[10px] opacity-70">
                                                        {date.toLocaleDateString("en-US", { weekday: "short" })}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                            Select Time (IST)
                                        </label>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {timeSlots.map((time) => (
                                                <button
                                                    key={time}
                                                    type="button"
                                                    onClick={() => handleChange("time", time)}
                                                    className={`p-2 rounded-lg border text-xs transition-all ${formData.time === time
                                                        ? "bg-primary text-primary-foreground border-primary"
                                                        : "bg-secondary/50 border-border hover:border-primary/50"
                                                        }`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-between pt-2">
                                        <Button variant="outline" onClick={() => setStep(1)} size="sm" className="gap-1.5">
                                            <ArrowLeft className="w-3.5 h-3.5" />
                                            Back
                                        </Button>
                                        <Button onClick={() => setStep(3)} disabled={!canProceedStep2} size="sm" className="gap-1.5">
                                            Continue
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Confirm */}
                            {step === 3 && (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="p-3 rounded-xl bg-secondary/50 border border-border space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Name</span>
                                            <span className="font-medium text-foreground">{formData.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Hospital</span>
                                            <span className="font-medium text-foreground">{formData.company}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Date & Time</span>
                                            <span className="font-medium text-foreground">{formData.date}, {formData.time}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                                            Additional Notes (Optional)
                                        </label>
                                        <Textarea
                                            value={formData.message}
                                            onChange={(e) => handleChange("message", e.target.value)}
                                            placeholder="Specific features you're interested in..."
                                            rows={2}
                                            className="text-sm"
                                        />
                                    </div>

                                    <div className="flex justify-between pt-2">
                                        <Button variant="outline" type="button" onClick={() => setStep(2)} size="sm" className="gap-1.5">
                                            <ArrowLeft className="w-3.5 h-3.5" />
                                            Back
                                        </Button>
                                        <Button type="submit" disabled={isSubmitting} size="sm" className="gap-1.5">
                                            {isSubmitting ? "Scheduling..." : (
                                                <>
                                                    Confirm Demo
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
};

export default BookDemoModal;
