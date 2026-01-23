import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ContactFormModal from "@/carewell/components/ContactFormModal";
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
  Cloud,
  Smartphone,
  MessageSquare,
  Pill,
  FlaskConical,
  Scan,
  Building2,
  Star,
  Quote,
  UserCog,
  Lock,
  Headphones,
  GraduationCap,
  TrendingUp,
  ClipboardList,
  Bell,
  Share2,
  Database,
  Wifi,
  Monitor,
  Phone,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import carewellLogo from "@/assets/carewell-logo.png";

const slides = [
  {
    id: 1,
    type: "hero",
    title: "Transform Your Healthcare Operations",
    subtitle: "Complete Hospital Management Solution with 15+ Modules",
    stats: [
      { value: "500+", label: "Healthcare Partners" },
      { value: "2M+", label: "Patients Served" },
      { value: "99.9%", label: "Uptime Guarantee" },
      { value: "45%", label: "Efficiency Increase" }
    ]
  },
  {
    id: 2,
    type: "problem",
    title: "The Challenge",
    subtitle: "Healthcare facilities face critical operational bottlenecks",
    points: [
      { icon: Clock, text: "Long patient wait times affecting care quality" },
      { icon: FileText, text: "Fragmented records across multiple systems" },
      { icon: Users, text: "Staff overwhelmed with administrative tasks" },
      { icon: Activity, text: "Lack of real-time visibility into operations" }
    ]
  },
  {
    id: 3,
    type: "solution",
    title: "CareWell HMS",
    subtitle: "Your Complete Hospital Management Solution",
    description: "An integrated platform that unifies patient care, administration, and analytics into one seamless experience.",
    features: [
      "Auto Cloud Backup",
      "Patient Administration",
      "Diagnosis & Treatment",
      "Billing & Collection"
    ]
  },
  {
    id: 4,
    type: "modules",
    title: "15+ Comprehensive Modules",
    subtitle: "Everything you need to run a modern healthcare facility",
    modules: [
      { icon: Stethoscope, name: "OPD/IPD Management", desc: "Patient registration & admission" },
      { icon: Hospital, name: "Diagnosis & Treatment", desc: "Detailed diagnosis sheets" },
      { icon: Calendar, name: "Appointments", desc: "Smart scheduling system" },
      { icon: CreditCard, name: "Billing & TPA", desc: "OPD/IPD billing with tie-ups" },
      { icon: BarChart3, name: "Pathology & Radiology", desc: "500+ reports & templates" },
      { icon: Layers, name: "Pharmacy & Store", desc: "Stock & inventory management" }
    ]
  },
  {
    id: 5,
    type: "features",
    title: "Powerful Features",
    subtitle: "Built for modern healthcare operations",
    items: [
      { icon: Cloud, name: "Auto Cloud Backup", desc: "Daily automatic backups to secure cloud" },
      { icon: Smartphone, name: "Mobile Application", desc: "Access patient data on-the-go" },
      { icon: MessageSquare, name: "Marketing Tools", desc: "SMS & Email campaigns" },
      { icon: Building2, name: "TPA Management", desc: "Insurance & corporate tie-ups" },
      { icon: FlaskConical, name: "Pathology Lab", desc: "500+ reports, 1500+ parameters" },
      { icon: Scan, name: "Radiology", desc: "500+ templates ready to use" }
    ]
  },
  {
    id: 6,
    type: "pharmacy",
    title: "Pharmacy & Store Management",
    subtitle: "Complete inventory control with GST compliance",
    features: [
      { icon: Pill, name: "Pharmacy Store", desc: "Stock management with batch tracking" },
      { icon: FileText, name: "GST Compliant", desc: "Automatic tax calculations" },
      { icon: Clock, name: "Expiry Management", desc: "Track and manage expiring items" },
      { icon: Layers, name: "Central Store", desc: "Requisition management system" }
    ]
  },
  {
    id: 7,
    type: "patientJourney",
    title: "Complete Patient Journey",
    subtitle: "Seamless experience from registration to discharge",
    steps: [
      { step: "1", title: "Registration", desc: "Quick patient onboarding with unique ID" },
      { step: "2", title: "Appointment", desc: "Smart scheduling with reminders" },
      { step: "3", title: "Consultation", desc: "Digital diagnosis & treatment sheets" },
      { step: "4", title: "Billing", desc: "Instant invoicing with TPA support" },
      { step: "5", title: "Follow-up", desc: "Automated reminders & history tracking" }
    ]
  },
  {
    id: 8,
    type: "benefits",
    title: "Why Choose CareWell?",
    subtitle: "Measurable impact on your healthcare operations",
    benefits: [
      { value: "500+", label: "Pathology Reports", icon: FlaskConical },
      { value: "1500+", label: "Lab Parameters", icon: FileText },
      { value: "15+", label: "Integrated Modules", icon: Layers },
      { value: "100%", label: "Data Security", icon: Shield }
    ]
  },
  {
    id: 9,
    type: "security",
    title: "Enterprise-Grade Security",
    subtitle: "Your data is protected with industry-leading security",
    features: [
      { icon: Cloud, name: "Auto Cloud Backup", desc: "Daily encrypted backups" },
      { icon: Lock, name: "Data Encryption", desc: "256-bit SSL encryption" },
      { icon: UserCog, name: "Role-Based Access", desc: "Granular user permissions" },
      { icon: Database, name: "Data Recovery", desc: "Point-in-time recovery" }
    ]
  },
  {
    id: 10,
    type: "reports",
    title: "Powerful Reports & Analytics",
    subtitle: "Make data-driven decisions with comprehensive insights",
    reports: [
      { name: "OPD Reports", desc: "Patient visits, revenue, doctor-wise analysis" },
      { name: "IPD Reports", desc: "Admissions, bed occupancy, discharge summaries" },
      { name: "Pharmacy Reports", desc: "Sales, stock movement, expiry tracking" },
      { name: "Financial Reports", desc: "Revenue, collections, outstanding dues" },
      { name: "Sharing Reports", desc: "Doctor & department wise sharing" },
      { name: "User Reports", desc: "Activity logs, collection by user" }
    ]
  },
  {
    id: 11,
    type: "mobile",
    title: "Mobile Application",
    subtitle: "Access your hospital data anywhere, anytime",
    features: [
      { icon: Users, name: "Patient Lists", desc: "View IPD/OPD patients on mobile" },
      { icon: ClipboardList, name: "Patient Details", desc: "Complete patient information" },
      { icon: CreditCard, name: "Billing Status", desc: "Check payment & dues" },
      { icon: Bell, name: "Notifications", desc: "Real-time alerts & reminders" }
    ]
  },
  {
    id: 12,
    type: "testimonial",
    title: "What Our Clients Say",
    testimonials: [
      { 
        quote: "CareWell has transformed how we manage our hospital. The pathology module alone saved us hours every day.",
        author: "Dr. Rajesh Sharma",
        role: "Medical Director, City Hospital"
      },
      { 
        quote: "The billing and TPA integration is seamless. We've reduced claim rejections by 60%.",
        author: "Priya Patel",
        role: "Admin Head, Sunrise Healthcare"
      }
    ]
  },
  {
    id: 13,
    type: "support",
    title: "Dedicated Support & Training",
    subtitle: "We're with you every step of the way",
    items: [
      { icon: Headphones, name: "24/7 Support", desc: "Round-the-clock technical assistance" },
      { icon: GraduationCap, name: "Training", desc: "Comprehensive staff training included" },
      { icon: Monitor, name: "Remote Setup", desc: "Quick remote installation & configuration" },
      { icon: Phone, name: "Phone Support", desc: "Direct line to support team" }
    ]
  },
  {
    id: 14,
    type: "implementation",
    title: "Quick Implementation",
    subtitle: "Go live in as little as 7 days",
    timeline: [
      { day: "Day 1-2", title: "Setup", desc: "System installation & configuration" },
      { day: "Day 3-4", title: "Data Migration", desc: "Import existing patient & inventory data" },
      { day: "Day 5-6", title: "Training", desc: "Staff training on all modules" },
      { day: "Day 7", title: "Go Live", desc: "Launch with full support" }
    ]
  },
  {
    id: 15,
    type: "comparison",
    title: "CareWell vs Traditional Systems",
    subtitle: "See how we compare to manual & legacy systems",
    comparisons: [
      { feature: "Patient Registration", traditional: "15-20 minutes", carewell: "2-3 minutes" },
      { feature: "Report Generation", traditional: "Hours/Days", carewell: "Instant" },
      { feature: "Data Backup", traditional: "Manual/Weekly", carewell: "Auto Daily" },
      { feature: "TPA Claims", traditional: "Paper-based", carewell: "Digital & Tracked" },
      { feature: "Inventory Tracking", traditional: "Spreadsheets", carewell: "Real-time" }
    ]
  },
  {
    id: 16,
    type: "pricing",
    title: "Flexible Pricing Plans",
    subtitle: "Choose the plan that fits your facility",
    plans: [
      { name: "Starter", price: "₹9,999", period: "/month", features: ["OPD Management", "Patient Registration", "Basic Billing", "5 Users", "Email Support"] },
      { name: "Professional", price: "₹24,999", period: "/month", features: ["Everything in Starter", "IPD Management", "Pathology & Radiology", "Pharmacy Module", "20 Users", "Priority Support"], popular: true },
      { name: "Enterprise", price: "Custom", period: "", features: ["Everything in Professional", "Unlimited Users", "Custom Integrations", "Dedicated Support", "On-premise Option", "Training Included"] }
    ]
  },
  {
    id: 17,
    type: "integration",
    title: "Key Features",
    subtitle: "Complete feature set for modern healthcare",
    integrations: [
      "Auto Cloud Backup",
      "TPA & Company Tie-ups",
      "Marketing Tools (SMS/Email)",
      "Mobile Application",
      "User Rights Management",
      "Sharing Reports"
    ]
  },
  {
    id: 18,
    type: "contact",
    title: "Get In Touch",
    subtitle: "Ready to modernize your hospital?",
    details: {
      email: "contact@carewell.devlomatix.in",
      phone: "(+91) 9712340450",
      location: "Vadodara, Gujarat"
    }
  },
  {
    id: 19,
    type: "cta",
    title: "Ready to Transform Your Hospital?",
    subtitle: "Join 500+ healthcare facilities already using CareWell",
    cta: "Schedule a Demo",
    contact: {
      email: "contact@carewell.devlomatix.in",
      phone: "(+91) 9712340450"
    }
  }
];

const SlideIndicator = ({ total, current, onSelect }) => (
  <div className="flex gap-2 flex-wrap justify-center max-w-xs">
    {Array.from({ length: total }).map((_, i) => (
      <button
        key={i}
        onClick={() => onSelect(i)}
        className={`w-2 h-2 rounded-full transition-all duration-300 ${
          i === current 
            ? "bg-primary w-6" 
            : "bg-primary/30 hover:bg-primary/50"
        }`}
      />
    ))}
  </div>
);

const HeroSlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center text-center px-8">
    <motion.img 
      src={carewellLogo} 
      alt="CareWell" 
      className="h-16 md:h-20 mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    />
    <motion.h1 
      className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {slide.title}
    </motion.h1>
    <motion.p 
      className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      {slide.subtitle}
    </motion.p>
    <motion.div 
      className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      {slide.stats.map((stat, i) => (
        <div key={i} className="text-center">
          <div className="text-3xl md:text-5xl font-bold hero-gradient-text mb-2">{stat.value}</div>
          <div className="text-sm md:text-base text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </motion.div>
  </div>
);

const ProblemSlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center px-8">
    <motion.h2 
      className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {slide.title}
    </motion.h2>
    <motion.p 
      className="text-xl text-muted-foreground mb-12 text-center max-w-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {slide.subtitle}
    </motion.p>
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full">
      {slide.points.map((point, i) => (
        <motion.div
          key={i}
          className="flex items-start gap-4 p-6 bg-destructive/5 border border-destructive/20 rounded-2xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + i * 0.1 }}
        >
          <div className="p-3 bg-destructive/10 rounded-xl">
            <point.icon className="w-6 h-6 text-destructive" />
          </div>
          <p className="text-lg text-foreground">{point.text}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

const SolutionSlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center px-8">
    <motion.div
      className="text-center mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <img src={carewellLogo} alt="CareWell" className="h-12 mx-auto mb-4" />
      <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
        {slide.title}
      </h2>
      <p className="text-xl text-muted-foreground">{slide.subtitle}</p>
    </motion.div>
    <motion.p
      className="text-lg text-muted-foreground text-center max-w-2xl mb-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {slide.description}
    </motion.p>
    <motion.div 
      className="flex flex-wrap justify-center gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {slide.features.map((feature, i) => (
        <div 
          key={i} 
          className="flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-full"
        >
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <span className="text-foreground font-medium">{feature}</span>
        </div>
      ))}
    </motion.div>
  </div>
);

const ModulesSlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center px-8">
    <motion.h2 
      className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {slide.title}
    </motion.h2>
    <motion.p 
      className="text-xl text-muted-foreground mb-12 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {slide.subtitle}
    </motion.p>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl w-full">
      {slide.modules.map((module, i) => (
        <motion.div
          key={i}
          className="p-6 bg-card border border-border rounded-2xl hover:shadow-lg transition-shadow"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.1 }}
        >
          <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
            <module.icon className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{module.name}</h3>
          <p className="text-sm text-muted-foreground">{module.desc}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

const FeaturesSlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center px-8">
    <motion.h2 
      className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {slide.title}
    </motion.h2>
    <motion.p 
      className="text-xl text-muted-foreground mb-12 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {slide.subtitle}
    </motion.p>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl w-full">
      {slide.items.map((item, i) => (
        <motion.div
          key={i}
          className="p-5 bg-card border border-border rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.08 }}
        >
          <div className="p-3 bg-primary/10 rounded-xl w-fit mb-3">
            <item.icon className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
          <p className="text-sm text-muted-foreground">{item.desc}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

const PharmacySlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center px-8">
    <motion.div
      className="p-4 bg-green-500/10 rounded-2xl mb-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Pill className="w-10 h-10 text-green-600" />
    </motion.div>
    <motion.h2 
      className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {slide.title}
    </motion.h2>
    <motion.p 
      className="text-xl text-muted-foreground mb-12 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {slide.subtitle}
    </motion.p>
    <div className="grid grid-cols-2 gap-6 max-w-3xl w-full">
      {slide.features.map((feature, i) => (
        <motion.div
          key={i}
          className="p-6 bg-card border border-border rounded-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.1 }}
        >
          <div className="p-3 bg-green-500/10 rounded-xl w-fit mb-4">
            <feature.icon className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{feature.name}</h3>
          <p className="text-sm text-muted-foreground">{feature.desc}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

const BenefitsSlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center px-8">
    <motion.h2 
      className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {slide.title}
    </motion.h2>
    <motion.p 
      className="text-xl text-muted-foreground mb-12 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {slide.subtitle}
    </motion.p>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl w-full">
      {slide.benefits.map((benefit, i) => (
        <motion.div
          key={i}
          className="text-center p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.1 }}
        >
          <div className="p-4 bg-primary/10 rounded-2xl w-fit mx-auto mb-4">
            <benefit.icon className="w-8 h-8 text-primary" />
          </div>
          <div className="text-4xl md:text-5xl font-bold hero-gradient-text mb-2">
            {benefit.value}
          </div>
          <div className="text-muted-foreground">{benefit.label}</div>
        </motion.div>
      ))}
    </div>
  </div>
);

const TestimonialSlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center px-8">
    <motion.div
      className="p-4 bg-primary/10 rounded-2xl mb-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Quote className="w-10 h-10 text-primary" />
    </motion.div>
    <motion.h2 
      className="text-4xl md:text-5xl font-display font-bold text-foreground mb-12 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {slide.title}
    </motion.h2>
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full">
      {slide.testimonials.map((testimonial, i) => (
        <motion.div
          key={i}
          className="p-8 bg-card border border-border rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.15 }}
        >
          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-lg text-foreground mb-6 italic">"{testimonial.quote}"</p>
          <div>
            <p className="font-semibold text-foreground">{testimonial.author}</p>
            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const PricingSlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center px-8 py-12">
    <motion.h2 
      className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {slide.title}
    </motion.h2>
    <motion.p 
      className="text-xl text-muted-foreground mb-10 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {slide.subtitle}
    </motion.p>
    <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full">
      {slide.plans.map((plan, i) => (
        <motion.div
          key={i}
          className={`p-6 rounded-2xl border-2 ${plan.popular ? 'bg-primary/5 border-primary' : 'bg-card border-border'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.1 }}
        >
          {plan.popular && (
            <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full mb-4">
              Most Popular
            </span>
          )}
          <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
          <div className="flex items-baseline mb-4">
            <span className="text-3xl font-bold text-foreground">{plan.price}</span>
            <span className="text-muted-foreground ml-1">{plan.period}</span>
          </div>
          <ul className="space-y-2">
            {plan.features.map((feature, fi) => (
              <li key={fi} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  </div>
);

const IntegrationSlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center px-8">
    <motion.div
      className="p-4 bg-primary/10 rounded-2xl mb-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Layers className="w-10 h-10 text-primary" />
    </motion.div>
    <motion.h2 
      className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {slide.title}
    </motion.h2>
    <motion.p 
      className="text-xl text-muted-foreground mb-12 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {slide.subtitle}
    </motion.p>
    <motion.div 
      className="flex flex-wrap justify-center gap-4 max-w-3xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {slide.integrations.map((integration, i) => (
        <div 
          key={i} 
          className="px-6 py-4 bg-card border border-border rounded-xl text-foreground font-medium"
        >
          {integration}
        </div>
      ))}
    </motion.div>
  </div>
);

const PatientJourneySlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center px-8">
    <motion.h2 
      className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {slide.title}
    </motion.h2>
    <motion.p 
      className="text-xl text-muted-foreground mb-12 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {slide.subtitle}
    </motion.p>
    <div className="flex flex-wrap justify-center gap-4 max-w-5xl">
      {slide.steps.map((step, i) => (
        <motion.div
          key={i}
          className="flex flex-col items-center p-6 bg-card border border-border rounded-2xl w-40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.1 }}
        >
          <div className="w-12 h-12 rounded-full hero-gradient flex items-center justify-center mb-3">
            <span className="text-xl font-bold text-primary-foreground">{step.step}</span>
          </div>
          <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
          <p className="text-xs text-muted-foreground text-center">{step.desc}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

const SecuritySlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center px-8">
    <motion.div
      className="p-4 bg-green-500/10 rounded-2xl mb-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Shield className="w-10 h-10 text-green-600" />
    </motion.div>
    <motion.h2 
      className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {slide.title}
    </motion.h2>
    <motion.p 
      className="text-xl text-muted-foreground mb-12 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {slide.subtitle}
    </motion.p>
    <div className="grid grid-cols-2 gap-6 max-w-3xl w-full">
      {slide.features.map((feature, i) => (
        <motion.div
          key={i}
          className="p-6 bg-card border border-border rounded-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.1 }}
        >
          <div className="p-3 bg-green-500/10 rounded-xl w-fit mb-4">
            <feature.icon className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{feature.name}</h3>
          <p className="text-sm text-muted-foreground">{feature.desc}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

const ReportsSlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center px-8">
    <motion.div
      className="p-4 bg-primary/10 rounded-2xl mb-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <BarChart3 className="w-10 h-10 text-primary" />
    </motion.div>
    <motion.h2 
      className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {slide.title}
    </motion.h2>
    <motion.p 
      className="text-xl text-muted-foreground mb-12 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {slide.subtitle}
    </motion.p>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl w-full">
      {slide.reports.map((report, i) => (
        <motion.div
          key={i}
          className="p-5 bg-card border border-border rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.08 }}
        >
          <h3 className="font-semibold text-foreground mb-1">{report.name}</h3>
          <p className="text-sm text-muted-foreground">{report.desc}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

const MobileSlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center px-8">
    <motion.div
      className="p-4 bg-blue-500/10 rounded-2xl mb-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Smartphone className="w-10 h-10 text-blue-600" />
    </motion.div>
    <motion.h2 
      className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {slide.title}
    </motion.h2>
    <motion.p 
      className="text-xl text-muted-foreground mb-12 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {slide.subtitle}
    </motion.p>
    <div className="grid grid-cols-2 gap-6 max-w-3xl w-full">
      {slide.features.map((feature, i) => (
        <motion.div
          key={i}
          className="p-6 bg-card border border-border rounded-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.1 }}
        >
          <div className="p-3 bg-blue-500/10 rounded-xl w-fit mb-4">
            <feature.icon className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{feature.name}</h3>
          <p className="text-sm text-muted-foreground">{feature.desc}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

const SupportSlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center px-8">
    <motion.div
      className="p-4 bg-purple-500/10 rounded-2xl mb-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Headphones className="w-10 h-10 text-purple-600" />
    </motion.div>
    <motion.h2 
      className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {slide.title}
    </motion.h2>
    <motion.p 
      className="text-xl text-muted-foreground mb-12 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {slide.subtitle}
    </motion.p>
    <div className="grid grid-cols-2 gap-6 max-w-3xl w-full">
      {slide.items.map((item, i) => (
        <motion.div
          key={i}
          className="p-6 bg-card border border-border rounded-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.1 }}
        >
          <div className="p-3 bg-purple-500/10 rounded-xl w-fit mb-4">
            <item.icon className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{item.name}</h3>
          <p className="text-sm text-muted-foreground">{item.desc}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

const ImplementationSlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center px-8">
    <motion.div
      className="p-4 bg-amber-500/10 rounded-2xl mb-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Zap className="w-10 h-10 text-amber-600" />
    </motion.div>
    <motion.h2 
      className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {slide.title}
    </motion.h2>
    <motion.p 
      className="text-xl text-muted-foreground mb-12 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {slide.subtitle}
    </motion.p>
    <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
      {slide.timeline.map((item, i) => (
        <motion.div
          key={i}
          className="p-6 bg-card border border-border rounded-2xl w-52"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + i * 0.15 }}
        >
          <div className="text-amber-600 font-bold text-sm mb-2">{item.day}</div>
          <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
          <p className="text-sm text-muted-foreground">{item.desc}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

const ComparisonSlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center px-8">
    <motion.h2 
      className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {slide.title}
    </motion.h2>
    <motion.p 
      className="text-xl text-muted-foreground mb-12 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {slide.subtitle}
    </motion.p>
    <motion.div 
      className="w-full max-w-3xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
        <div className="font-semibold text-foreground">Feature</div>
        <div className="font-semibold text-destructive">Traditional</div>
        <div className="font-semibold text-primary">CareWell</div>
      </div>
      {slide.comparisons.map((item, i) => (
        <motion.div
          key={i}
          className="grid grid-cols-3 gap-4 p-4 bg-card border border-border rounded-xl mb-2 text-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 + i * 0.1 }}
        >
          <div className="text-foreground font-medium text-sm">{item.feature}</div>
          <div className="text-destructive text-sm">{item.traditional}</div>
          <div className="text-primary font-semibold text-sm">{item.carewell}</div>
        </motion.div>
      ))}
    </motion.div>
  </div>
);

const ContactSlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center px-8 text-center">
    <motion.img 
      src={carewellLogo} 
      alt="CareWell" 
      className="h-14 mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    />
    <motion.h2 
      className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {slide.title}
    </motion.h2>
    <motion.p 
      className="text-xl text-muted-foreground mb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      {slide.subtitle}
    </motion.p>
    <motion.div 
      className="flex flex-col gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center gap-4 text-lg">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <span className="text-foreground">{slide.details.email}</span>
      </div>
      <div className="flex items-center gap-4 text-lg">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Phone className="w-6 h-6 text-primary" />
        </div>
        <span className="text-foreground">{slide.details.phone}</span>
      </div>
      <div className="flex items-center gap-4 text-lg">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <span className="text-foreground">{slide.details.location}</span>
      </div>
    </motion.div>
  </div>
);

const CTASlide = ({ slide }) => (
  <div className="h-full flex flex-col items-center justify-center px-8 text-center">
    <motion.img 
      src={carewellLogo} 
      alt="CareWell" 
      className="h-14 mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    />
    <motion.h2 
      className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {slide.title}
    </motion.h2>
    <motion.p 
      className="text-xl text-muted-foreground mb-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      {slide.subtitle}
    </motion.p>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <ContactFormModal title="Schedule a Demo">
        <Button 
          size="lg" 
          className="hero-gradient text-primary-foreground px-10 py-7 text-xl rounded-2xl shadow-glow hover:shadow-xl transition-all"
        >
          {slide.cta}
          <ArrowRight className="ml-3 h-6 w-6" />
        </Button>
      </ContactFormModal>
    </motion.div>
    <motion.div 
      className="mt-12 flex flex-col md:flex-row items-center gap-6 text-muted-foreground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <span>{slide.contact.email}</span>
      <span className="hidden md:block">•</span>
      <span>{slide.contact.phone}</span>
    </motion.div>
  </div>
);

const Deck = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const goToSlide = useCallback((index) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  }, [currentSlide]);

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide(prev => prev + 1);
    }
  }, [currentSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(prev => prev - 1);
    }
  }, [currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Touch/Swipe gestures
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (diff > threshold) {
      nextSlide();
    } else if (diff < -threshold) {
      prevSlide();
    }
  };

  const renderSlide = (slide) => {
    switch (slide.type) {
      case "hero": return <HeroSlide slide={slide} />;
      case "problem": return <ProblemSlide slide={slide} />;
      case "solution": return <SolutionSlide slide={slide} />;
      case "modules": return <ModulesSlide slide={slide} />;
      case "features": return <FeaturesSlide slide={slide} />;
      case "pharmacy": return <PharmacySlide slide={slide} />;
      case "patientJourney": return <PatientJourneySlide slide={slide} />;
      case "benefits": return <BenefitsSlide slide={slide} />;
      case "security": return <SecuritySlide slide={slide} />;
      case "reports": return <ReportsSlide slide={slide} />;
      case "mobile": return <MobileSlide slide={slide} />;
      case "testimonial": return <TestimonialSlide slide={slide} />;
      case "support": return <SupportSlide slide={slide} />;
      case "implementation": return <ImplementationSlide slide={slide} />;
      case "comparison": return <ComparisonSlide slide={slide} />;
      case "pricing": return <PricingSlide slide={slide} />;
      case "integration": return <IntegrationSlide slide={slide} />;
      case "contact": return <ContactSlide slide={slide} />;
      case "cta": return <CTASlide slide={slide} />;
      default: return null;
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0
    })
  };

  return (
    <div 
      ref={containerRef}
      className="h-screen w-screen bg-background overflow-hidden relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slide Content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "tween", duration: 0.4 }}
          className="absolute inset-0"
        >
          {renderSlide(slides[currentSlide])}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="p-3 rounded-full bg-muted hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        
        <SlideIndicator 
          total={slides.length} 
          current={currentSlide} 
          onSelect={goToSlide}
        />
        
        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="p-3 rounded-full bg-muted hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Slide Counter */}
      <div className="absolute top-6 right-6 text-sm text-muted-foreground">
        {currentSlide + 1} / {slides.length}
      </div>

      {/* Keyboard Hint */}
      <div className="absolute bottom-8 right-8 text-xs text-muted-foreground hidden md:block">
        Use ← → arrows to navigate
      </div>

      {/* Swipe Hint - Mobile */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-xs text-muted-foreground md:hidden">
        Swipe to navigate
      </div>
    </div>
  );
};

export default Deck;
