import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";;
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Building2, Users, Stethoscope, Settings, Check, ChevronRight, ChevronLeft, Hospital, Mail, Phone, MapPin,
    User, Lock, CreditCard, Bell, Clock, Globe, Upload, Bed, FileText, DollarSign, Calendar, Zap,
    CheckIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";



const steps = [
    { id: 1, title: "Hospital Info", icon: Building2, description: "Basic details" },
    { id: 2, title: "Departments", icon: Stethoscope, description: "Configure units" },
    { id: 3, title: "Admin Setup", icon: Users, description: "Create admin" },
    { id: 4, title: "Billing", icon: CreditCard, description: "Payment settings" },
    { id: 5, title: "Schedule", icon: Clock, description: "Working hours" },
    { id: 6, title: "Notifications", icon: Bell, description: "Alert preferences" },
    { id: 7, title: "Preferences", icon: Settings, description: "System settings" },
];

export function SetupWizard({ open, onComplete }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Hospital Info
        hospitalName: "",
        hospitalEmail: "",
        hospitalPhone: "",
        hospitalAddress: "",
        hospitalLicense: "",
        bedCapacity: "",
        emergencyPhone: "",
        website: "",
        // Departments
        departments: [],
        // Admin
        adminName: "",
        adminEmail: "",
        adminPassword: "",
        adminRole: "Super Admin",
        // Billing
        currency: "INR",
        taxRate: "0",
        paymentMethods: [],
        invoicePrefix: "INV",
        enableInsurance: true,
        // Schedule
        workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        openingTime: "08:00",
        closingTime: "18:00",
        appointmentDuration: "30",
        breakTime: "12:00-13:00",
        // Notifications
        emailNotifications: true,
        smsNotifications: false,
        appointmentReminders: true,
        reminderHours: "24",
        emergencyAlerts: true,
        staffNotifications: true,
        patientPortal: true,
        // Preferences
        language: "english",
        timezone: "UTC",
        dateFormat: "MM/DD/YYYY",
        timeFormat: "12h",
        theme: "dark",
    });

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const toggleDepartment = (dept) => {
        setFormData(prev => ({
            ...prev,
            departments: prev.departments.includes(dept)
                ? prev.departments.filter(d => d !== dept)
                : [...prev.departments, dept]
        }));
    };

    const togglePaymentMethod = (method) => {
        setFormData(prev => ({
            ...prev,
            paymentMethods: prev.paymentMethods.includes(method)
                ? prev.paymentMethods.filter(m => m !== method)
                : [...prev.paymentMethods, method]
        }));
    };

    const toggleWorkingDay = (day) => {
        setFormData(prev => ({
            ...prev,
            workingDays: prev.workingDays.includes(day)
                ? prev.workingDays.filter(d => d !== day)
                : [...prev.workingDays, day]
        }));
    };

    const departmentOptions = [
        "Emergency", "Cardiology", "Neurology", "Orthopedics",
        "Pediatrics", "Oncology", "Radiology", "Surgery",
        "ICU", "Pharmacy", "Laboratory", "Outpatient",
        "Dermatology", "Psychiatry", "Ophthalmology", "ENT"
    ];

    const paymentOptions = [
        { id: "cash", label: "Cash", icon: DollarSign },
        { id: "card", label: "Credit/Debit Card", icon: CreditCard },
        { id: "insurance", label: "Insurance", icon: FileText },
        { id: "online", label: "Online Payment", icon: Globe },
    ];

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    return (
        <Dialog open={open}>
            <DialogContent className="max-w-5xl p-0 gap-0 bg-card border-border overflow-hidden max-h-[90vh] min-w-[60%] flex flex-col [&>button:last-child]:hidden ">

                <DialogHeader className="mb-0 pb-0 hidden">
                    <DialogTitle className="sr-only">
                        {/* Title exists for accessibility, visually hidden */}
                    </DialogTitle>
                </DialogHeader>


                {/* Header with Logo */}
                <div className="relative p-4 pb-0 flex-1 h-40">
                    <div className="absolute inset-0 gradient-glow opacity-50" />
                    <div className="relative flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl  shadow-glow">
                            <Hospital className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <div>
                            <h1 className="text-xl font-display font-bold text-foreground">
                                Healthyfine HMS
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Hospital Management System Setup
                            </p>
                        </div>
                    </div>

                    {/* Progress Steps - Scrollable */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-4 scrollbar-hide">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center flex-shrink-0">
                                <div className="flex flex-col items-center min-w-[80px]">
                                    <div
                                        className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300",
                                            currentStep === step.id
                                                ? "bg-sky-500  shadow-primary/30 border"
                                                : currentStep > step.id
                                                    ? "bg-primary/20 text-primary"
                                                    : " text-muted-foreground border"
                                        )}
                                    >
                                        {currentStep > step.id ? (
                                            <Check className="w-4 h-4" />
                                        ) : (
                                            <step.icon className="w-4 h-4" />
                                        )}
                                    </div>
                                    <p className={cn(
                                        "text-xs font-medium mt-1.5 transition-colors text-center",
                                        currentStep === step.id ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                        {step.title}
                                    </p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={cn(
                                        "w-8 h-0.5 mx-1 transition-colors flex-shrink-0",
                                        currentStep > step.id ? "bg-primary" : "bg-border"
                                    )} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="px-6 py-5 min-h-[380px] max-h-[50vh] overflow-y-auto  flex-1">


                    {/* Step 1: Hospital Info */}
                    {currentStep === 1 && (
                        <div className="space-y-5 animate-fade-in">
                            <div>
                                <h2 className="text-xl font-display font-semibold text-foreground mb-1">
                                    Hospital Information
                                </h2>
                                <p className="text-muted-foreground text-sm">
                                    Enter your hospital's basic details and contact information
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <Label htmlFor="hospitalName" className="text-foreground">Hospital Name *</Label>
                                    <div className="relative mt-1.5">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="hospitalName"
                                            placeholder="City General Hospital"
                                            className="pl-10 bg-secondary/50 border-border focus:border"
                                            value={formData.hospitalName}
                                            onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <Label htmlFor="hospitalLicense" className="text-foreground">License Number</Label>
                                    <div className="relative mt-1.5">
                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="hospitalLicense"
                                            placeholder="HSP-2024-XXXXX"
                                            className="pl-10 bg-secondary/50 border-border focus:border"
                                            value={formData.hospitalLicense}
                                            onChange={(e) => setFormData({ ...formData, hospitalLicense: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="hospitalEmail" className="text-foreground">Email Address *</Label>
                                    <div className="relative mt-1.5">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="hospitalEmail"
                                            type="email"
                                            placeholder="admin@hospital.com"
                                            className="pl-10 bg-secondary/50 border-border focus:border"
                                            value={formData.hospitalEmail}
                                            onChange={(e) => setFormData({ ...formData, hospitalEmail: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="hospitalPhone" className="text-foreground">Phone Number *</Label>
                                    <div className="relative mt-1.5">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="hospitalPhone"
                                            placeholder="+1 (555) 000-0000"
                                            className="pl-10 bg-secondary/50 border-border focus:border"
                                            value={formData.hospitalPhone}
                                            onChange={(e) => setFormData({ ...formData, hospitalPhone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="emergencyPhone" className="text-foreground">Emergency Hotline</Label>
                                    <div className="relative mt-1.5">
                                        <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="emergencyPhone"
                                            placeholder="+1 (555) 911-0000"
                                            className="pl-10 bg-secondary/50 border-border focus:border"
                                            value={formData.emergencyPhone}
                                            onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="bedCapacity" className="text-foreground">Bed Capacity</Label>
                                    <div className="relative mt-1.5">
                                        <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="bedCapacity"
                                            type="number"
                                            placeholder="250"
                                            className="pl-10 bg-secondary/50 border-border focus:border"
                                            value={formData.bedCapacity}
                                            onChange={(e) => setFormData({ ...formData, bedCapacity: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="website" className="text-foreground">Website</Label>
                                    <div className="relative mt-1.5">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="website"
                                            placeholder="https://hospital.com"
                                            className="pl-10 bg-secondary/50 border-border focus:border"
                                            value={formData.website}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-foreground">Hospital Logo</Label>
                                    <div className="mt-1.5">
                                        <Button className="w-full h-10 px-4 rounded-lg border border-dashed border-border bg-secondary/30 text-muted-foreground text-sm flex items-center justify-center gap-2 hover:border-primary/50 hover:text-foreground transition-colors">
                                            <Upload className="w-4 h-4" />
                                            Upload Logo
                                        </Button>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <Label htmlFor="hospitalAddress" className="text-foreground">Address *</Label>
                                    <div className="relative mt-1.5">
                                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="hospitalAddress"
                                            placeholder="123 Medical Center Blvd, City, State 12345"
                                            className="pl-10 bg-secondary/50 border-border focus:border"
                                            value={formData.hospitalAddress}
                                            onChange={(e) => setFormData({ ...formData, hospitalAddress: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Departments */}
                    {currentStep === 2 && (
                        <div className="space-y-5 animate-fade-in">
                            <div>
                                <h2 className="text-xl font-display font-semibold text-foreground mb-1">
                                    Select Departments
                                </h2>
                                <p className="text-muted-foreground text-sm">
                                    Choose the departments you want to set up in your hospital
                                </p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {departmentOptions.map((dept) => (
                                    <Button
                                        key={dept}
                                        variant={'outline'}
                                        onClick={() => toggleDepartment(dept)}
                                        className={cn(
                                            " rounded-md border text-sm font-medium transition-all duration-200",
                                            formData.departments.includes(dept)
                                                ? "bg-primary/10 dark:bg-darkFocusColor border-1 text-primary "
                                                : "bg-secondary/50 border-border text-muted-foreground  hover:text-foreground"
                                        )}
                                    >
                                        {formData.departments.includes(dept) && <CheckIcon />}
                                        {dept}
                                    </Button>
                                ))}
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                                <span className="text-sm text-muted-foreground">
                                    {formData.departments.length} department(s) selected
                                </span>
                                <Button
                                    variant='outline'
                                    onClick={() => setFormData({ ...formData, departments: departmentOptions })}
                                    className="text-sm text-primary"
                                >
                                    Select All
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Admin Setup */}
                    {currentStep === 3 && (
                        <div className="space-y-5 animate-fade-in">
                            <div>
                                <h2 className="text-xl font-display font-semibold text-foreground mb-1">
                                    Create Admin Account
                                </h2>
                                <p className="text-muted-foreground text-sm">
                                    Set up the primary administrator account for system access
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Label htmlFor="adminName" className="text-foreground">Full Name *</Label>
                                    <div className="relative mt-1.5">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="adminName"
                                            placeholder="Dr. John Smith"
                                            className="pl-10 bg-secondary/50 border-border focus:border"
                                            value={formData.adminName}
                                            onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="adminEmail" className="text-foreground">Email Address *</Label>
                                    <div className="relative mt-1.5">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="adminEmail"
                                            type="email"
                                            placeholder="admin@hospital.com"
                                            className="pl-10 bg-secondary/50 border-border focus:border"
                                            value={formData.adminEmail}
                                            onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="adminPassword" className="text-foreground">Password *</Label>
                                    <div className="relative mt-1.5">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="adminPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-10 bg-secondary/50 border-border focus:border"
                                            value={formData.adminPassword}
                                            onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-foreground">Admin Role</Label>
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {["Super Admin", "Admin", "Manager"].map((role) => (
                                            <Button
                                                key={role}
                                                variant={'outline'}
                                                onClick={() => setFormData({ ...formData, adminRole: role })}
                                                className={cn(
                                                    "border text-sm font-medium transition-all",
                                                    formData.adminRole === role
                                                        ? "bg-primary/10 dark:bg-darkFocusColor border-primary text-primary"
                                                        : "bg-secondary/50 border-border text-muted-foreground hover:border-primary/30"
                                                )}
                                            >
                                                {formData.adminRole === role && <CheckIcon />}
                                                {role}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Billing */}
                    {currentStep === 4 && (
                        <div className="space-y-5 animate-fade-in">
                            <div>
                                <h2 className="text-xl font-display font-semibold text-foreground mb-1">
                                    Billing & Payment Settings
                                </h2>
                                <p className="text-muted-foreground text-sm">
                                    Configure payment methods and billing preferences
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-foreground">Currency</Label>
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {["INR", "EUR", "USD"].map((curr) => (
                                            <Button
                                                key={curr}
                                                variant={'outline'}
                                                onClick={() => setFormData({ ...formData, currency: curr })}
                                                className={cn(
                                                    "p-2.5 border text-sm font-medium transition-all",
                                                    formData.currency === curr
                                                        ? "bg-primary/10 dark:bg-darkFocusColor border-primary text-primary"
                                                        : "bg-secondary/50 border-border text-muted-foreground hover:border-primary/30"
                                                )}
                                            >
                                                {formData.currency === curr && <CheckIcon />}
                                                {curr}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="taxRate" className="text-foreground">Tax Rate (%)</Label>
                                    <Input
                                        id="taxRate"
                                        type="number"
                                        placeholder="10"
                                        className="mt-2 bg-secondary/50 border-border focus:border"
                                        value={formData.taxRate}
                                        onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="invoicePrefix" className="text-foreground">Invoice Prefix</Label>
                                    <Input
                                        id="invoicePrefix"
                                        placeholder="INV"
                                        className="mt-2 bg-secondary/50 border-border focus:border"
                                        value={formData.invoicePrefix}
                                        onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Insurance Claims</p>
                                        <p className="text-xs text-muted-foreground">Enable insurance processing</p>
                                    </div>
                                    <Switch
                                        checked={formData.enableInsurance}
                                        onCheckedChange={(checked) => setFormData({ ...formData, enableInsurance: checked })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-foreground">Payment Methods</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                                        {paymentOptions.map((method) => (
                                            <Button
                                                key={method.id}
                                                variant={'outline'}
                                                onClick={() => togglePaymentMethod(method.id)}
                                                className={cn(
                                                    "p-4 h-20 border text-sm font-medium transition-all items-center  flex flex-row gap-10",
                                                    formData.paymentMethods.includes(method.id)
                                                        ? "bg-primary/10 border-primary text-primary"
                                                        : "bg-secondary/50 border-border text-muted-foreground hover:border-primary/30"
                                                )}
                                            >
                                                {formData.paymentMethods.includes(method.id) && <CheckIcon />}
                                                <div className="flex flex-col items-center gap-2">
                                                    <method.icon className="w-5 h-5" />
                                                    {method.label}
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Schedule */}
                    {currentStep === 5 && (
                        <div className="space-y-5 animate-fade-in">
                            <div>
                                <h2 className="text-xl font-display font-semibold text-foreground mb-1">
                                    Working Hours & Schedule
                                </h2>
                                <p className="text-muted-foreground text-sm">
                                    Set your hospital's operating hours and appointment settings
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-foreground">Working Days</Label>
                                    <div className="grid grid-cols-7 gap-2 mt-2">
                                        {daysOfWeek.map((day) => (
                                            <Button
                                                key={day}
                                                variant={'outline'}
                                                onClick={() => toggleWorkingDay(day)}
                                                className={cn(
                                                    "p-2.5  border text-xs font-medium transition-all",
                                                    formData.workingDays.includes(day)
                                                        ? "bg-primary/10 dark:bg-darkFocusColor border-primary text-primary"
                                                        : "bg-secondary/50 border-border text-muted-foreground hover:border-primary/30"
                                                )}
                                            >
                                                {formData.workingDays.includes(day) && <CheckIcon />}
                                                {day.slice(0, 3)}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div>
                                        <Label htmlFor="openingTime" className="text-foreground">Opening Time</Label>
                                        <Input
                                            id="openingTime"
                                            type="time"
                                            className="mt-1.5 bg-secondary/50 border-border focus:border"
                                            value={formData.openingTime}
                                            onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="closingTime" className="text-foreground">Closing Time</Label>
                                        <Input
                                            id="closingTime"
                                            type="time"
                                            className="mt-1.5 bg-secondary/50 border-border focus:border"
                                            value={formData.closingTime}
                                            onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-foreground">Appointment Duration</Label>
                                        <div className="grid grid-cols-3 gap-1 mt-1.5">
                                            {["15", "30", "45"].map((min) => (
                                                <Button
                                                    key={min}
                                                    variant='outline'
                                                    onClick={() => setFormData({ ...formData, appointmentDuration: min })}
                                                    className={cn(
                                                        "p-2  border text-xs font-medium transition-all",
                                                        formData.appointmentDuration === min
                                                            ? "bg-primary/10 dark:bg-darkFocusColor border-primary text-primary"
                                                            : "bg-secondary/50 border-border text-muted-foreground"
                                                    )}
                                                >
                                                    {formData.appointmentDuration === min && <CheckIcon />}
                                                    {min}m
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="breakTime" className="text-foreground">Break Time</Label>
                                        <Input
                                            id="breakTime"
                                            placeholder="12:00-13:00"
                                            className="mt-1.5 bg-secondary/50 border-border focus:border"
                                            value={formData.breakTime}
                                            onChange={(e) => setFormData({ ...formData, breakTime: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 6: Notifications */}
                    {currentStep === 6 && (
                        <div className="space-y-5 animate-fade-in">
                            <div>
                                <h2 className="text-xl font-display font-semibold text-foreground mb-1">
                                    Notification Preferences
                                </h2>
                                <p className="text-muted-foreground text-sm">
                                    Configure how you receive alerts and notifications
                                </p>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { key: "emailNotifications", label: "Email Notifications", desc: "Receive updates via email" },
                                    { key: "smsNotifications", label: "SMS Notifications", desc: "Receive alerts via SMS" },
                                    { key: "appointmentReminders", label: "Appointment Reminders", desc: "Send reminders to patients" },
                                    { key: "emergencyAlerts", label: "Emergency Alerts", desc: "Critical system notifications" },
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{item.label}</p>
                                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                                        </div>
                                        <Switch
                                            checked={formData[item.key]}
                                            onCheckedChange={(checked) => setFormData({ ...formData, [item.key]: checked })}
                                        />
                                    </div>
                                ))}
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <Label className="text-foreground">Reminder Hours Before</Label>
                                        <div className="grid grid-cols-4 gap-2 mt-2">
                                            {["12", "24", "48", "72"].map((hours) => (
                                                <Button
                                                    key={hours}
                                                    variant='outline'
                                                    onClick={() => setFormData({ ...formData, reminderHours: hours })}
                                                    className={cn(
                                                        "p-2  border text-xs font-medium transition-all",
                                                        formData.reminderHours === hours
                                                            ? "bg-primary/10 dark:bg-darkFocusColor border-primary text-primary"
                                                            : "bg-secondary/50 border-border text-muted-foreground"
                                                    )}
                                                >
                                                    {formData.reminderHours === hours && <CheckIcon />}
                                                    {hours}h
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 7: Preferences */}
                    {currentStep === 7 && (
                        <div className="space-y-5 animate-fade-in">
                            <div>
                                <h2 className="text-xl font-display font-semibold text-foreground mb-1">
                                    System Preferences
                                </h2>
                                <p className="text-muted-foreground text-sm">
                                    Configure regional and display settings
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-foreground">Language</Label>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {["English", "Spanish", "French", "German"].map((lang) => (
                                            <Button
                                                key={lang}
                                                variant={'outline'}
                                                onClick={() => setFormData({ ...formData, language: lang.toLowerCase() })}
                                                className={cn(
                                                    "p-2.5 border text-sm font-medium transition-all",
                                                    formData.language === lang.toLowerCase()
                                                        ? "bg-primary/10 border dark:bg-darkFocusColor text-primary"
                                                        : "bg-secondary/50 border-border text-muted-foreground hover:border-primary/30"
                                                )}
                                            >
                                                {formData.language === lang.toLowerCase() && <CheckIcon />}
                                                {lang}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-foreground">Timezone</Label>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {["UTC", "EST", "PST", "GMT"].map((tz) => (
                                            <Button
                                                key={tz}
                                                variant={'outline'}
                                                onClick={() => setFormData({ ...formData, timezone: tz })}
                                                className={cn(
                                                    "p-2.5  border text-sm font-medium transition-all",
                                                    formData.timezone === tz
                                                        ? "bg-primary/10 border-primary dark:bg-darkFocusColor text-primary"
                                                        : "bg-secondary/50 border-border text-muted-foreground hover:border-primary/30"
                                                )}
                                            >
                                                {formData.timezone === tz && <CheckIcon />}
                                                {tz}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-foreground">Date Format</Label>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {["MM/DD/YYYY", "DD/MM/YYYY"].map((fmt) => (
                                            <Button
                                                key={fmt}
                                                variant={'outline'}
                                                onClick={() => setFormData({ ...formData, dateFormat: fmt })}
                                                className={cn(
                                                    "p-2.5  border text-xs font-medium transition-all",
                                                    formData.dateFormat === fmt
                                                        ? "bg-primary/10 border-primary dark:bg-darkFocusColor text-primary"
                                                        : "bg-secondary/50 border-border text-muted-foreground hover:border-primary/30"
                                                )}
                                            >
                                                {formData.dateFormat === fmt && <CheckIcon />}
                                                {fmt}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-foreground">Time Format</Label>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {["12h", "24h"].map((fmt) => (
                                            <Button
                                                key={fmt}
                                                variant={'outline'}
                                                onClick={() => setFormData({ ...formData, timeFormat: fmt })}
                                                className={cn(
                                                    "p-2.5  border text-sm font-medium transition-all",
                                                    formData.timeFormat === fmt
                                                        ? "bg-primary/10 border-primary dark:bg-darkFocusColor text-primary"
                                                        : "bg-secondary/50 border-border text-muted-foreground hover:border-primary/30"
                                                )}
                                            >
                                                {formData.timeFormat === fmt && <CheckIcon />}
                                                {fmt === "12h" ? "12 Hour" : "24 Hour"}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Final Summary */}
                            <div className="mt-4 p-4 rounded-xl bg-primary/5 dark:bg-darkFocusColor border ">
                                <h3 className="text-sm font-medium text-primary mb-3 flex items-center gap-2">
                                    <Check className="w-4 h-4" />
                                    Setup Summary
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                                    <div>
                                        <p className="text-muted-foreground text-xs">Hospital</p>
                                        <p className="text-foreground font-medium">{formData.hospitalName || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">Departments</p>
                                        <p className="text-foreground font-medium">{formData.departments.length} selected</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">Admin</p>
                                        <p className="text-foreground font-medium">{formData.adminName || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">Currency</p>
                                        <p className="text-foreground font-medium">{formData.currency}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">Working Days</p>
                                        <p className="text-foreground font-medium">{formData.workingDays.length} days</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs">Timezone</p>
                                        <p className="text-foreground font-medium">{formData.timezone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 h-20 border-t border-border bg-secondary/20 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className="text-muted-foreground"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back
                    </Button>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Step {currentStep} of {steps.length}
                        </span>
                    </div>
                    <Button
                        variant="premium"
                        onClick={handleNext}
                        className="min-w-[140px]"
                    >
                        {currentStep === steps.length ? "Complete Setup" : "Continue"}
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
