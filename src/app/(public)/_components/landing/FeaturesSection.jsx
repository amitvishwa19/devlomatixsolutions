import { motion } from "framer-motion";
import { 
  Cloud, 
  Calendar, 
  Users, 
  Stethoscope, 
  CreditCard,
  UserCog,
  MessageSquare,
  BarChart3,
  Pill,
  FlaskConical,
  Scan,
  Smartphone,
  Bell,
  Building2,
  Share2
} from "lucide-react";

const features = [
  {
    icon: Cloud,
    title: "Auto Cloud Backup",
    description: "Schedule daily automatic backups to secure cloud storage with disaster recovery",
    category: "Security"
  },
  {
    icon: Calendar,
    title: "Appointment Management",
    description: "Schedule and manage patient appointments with automated reminders",
    category: "Operations"
  },
  {
    icon: Users,
    title: "Patient Administration",
    description: "Complete patient registration, OPD/IPD management, and birthday reminders",
    category: "Clinical"
  },
  {
    icon: Stethoscope,
    title: "Diagnosis & Treatment",
    description: "Detailed diagnosis sheets with previous visit history and treatment orders",
    category: "Clinical"
  },
  {
    icon: CreditCard,
    title: "Billing & Collection",
    description: "OPD/IPD billing with cash collection tracking and TPA tie-up support",
    category: "Finance"
  },
  {
    icon: UserCog,
    title: "User Management",
    description: "Role-based access control with user rights, restrictions, and security",
    category: "Admin"
  },
  {
    icon: Building2,
    title: "TPA & Company Tie-ups",
    description: "Manage insurance TPAs and corporate tie-ups with custom billing rates",
    category: "Finance"
  },
  {
    icon: MessageSquare,
    title: "Marketing Tools",
    description: "Custom SMS/email templates for patient camps and doctor communications",
    category: "Marketing"
  },
  {
    icon: BarChart3,
    title: "Comprehensive Reports",
    description: "OPD, IPD, and Pharmacy reports with analytics and insights",
    category: "Analytics"
  },
  {
    icon: Pill,
    title: "Pharmacy Management",
    description: "Stock management with GST compliance and expiry return tracking",
    category: "Operations"
  },
  {
    icon: FlaskConical,
    title: "Pathology Lab",
    description: "500+ reports with 1500+ parameters in ready-to-use database",
    category: "Clinical"
  },
  {
    icon: Scan,
    title: "Radiology",
    description: "500+ templates with readymade database for radiology reporting",
    category: "Clinical"
  },
  {
    icon: Share2,
    title: "Sharing Reports",
    description: "Define sharing policies and generate reports with one click",
    category: "Finance"
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Automated reminders for birthdays, allergies, and follow-ups",
    category: "Operations"
  },
  {
    icon: Smartphone,
    title: "Mobile Application",
    description: "Access patient lists, details, and billing status on mobile",
    category: "Technology"
  }
];

const categoryColors = {
  Operations: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Clinical: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Finance: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Security: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Marketing: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  Analytics: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  Technology: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400"
};

const FeaturesSection = () => {
  return (
    <section id="features" className="section-padding bg-secondary/30">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="module-badge mb-4">Comprehensive Features</span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6">
            Everything You Need to{" "}
            <span className="hero-gradient-text">Run Your Hospital</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From patient registration to discharge, our HMS covers every aspect of 
            hospital operations with intelligent automation and seamless integration.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="feature-card group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="feature-icon-wrapper group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[feature.category]}`}>
                  {feature.category}
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
