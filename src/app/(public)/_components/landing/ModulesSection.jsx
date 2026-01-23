import { motion } from "framer-motion";
import { 
  Cloud,
  Calendar,
  Users,
  Stethoscope,
  FileText,
  CreditCard,
  UserCog,
  Building2,
  MessageSquare,
  BarChart3,
  Pill,
  Package,
  Share2,
  FlaskConical,
  Scan,
  Smartphone,
  Bell,
  ClipboardList,
  Receipt,
  ShieldCheck,
  Database
} from "lucide-react";

const modules = {
  cloudBackup: {
    title: "Auto Cloud Backup",
    description: "Secure your data with automated cloud backup solutions",
    color: "from-sky-500 to-sky-600",
    items: [
      { icon: Database, name: "Schedule Data Backup" },
      { icon: Cloud, name: "Auto Daily Backup to Cloud" },
      { icon: ShieldCheck, name: "Secure Data Storage" },
    ]
  },
  appointment: {
    title: "Appointment Management",
    description: "Efficient scheduling and patient appointment workflows",
    color: "from-blue-500 to-blue-600",
    items: [
      { icon: Calendar, name: "Schedule Appointments" },
      { icon: Users, name: "Manage Patient Appointments" },
      { icon: Bell, name: "Automated Reminders" },
    ]
  },
  patientAdmin: {
    title: "Patient Administration",
    description: "Complete patient lifecycle management from registration to discharge",
    color: "from-emerald-500 to-emerald-600",
    items: [
      { icon: Users, name: "Patient Registration" },
      { icon: ClipboardList, name: "OPD New / Follow-up Case" },
      { icon: Building2, name: "Indoor Admission" },
      { icon: Bell, name: "Birthday & Allergy Reminders" },
    ]
  },
  diagnosis: {
    title: "Diagnosis & Treatment",
    description: "Detailed diagnosis sheets and treatment history tracking",
    color: "from-teal-500 to-teal-600",
    items: [
      { icon: Stethoscope, name: "Detail Diagnosis Sheet" },
      { icon: FileText, name: "Previous Visits History" },
      { icon: ClipboardList, name: "Daily Treatment Order Sheet" },
    ]
  },
  billing: {
    title: "Billing & Collection",
    description: "Comprehensive billing and payment collection system",
    color: "from-amber-500 to-amber-600",
    items: [
      { icon: Receipt, name: "OPD Billing" },
      { icon: CreditCard, name: "Daily IPD Billing" },
      { icon: CreditCard, name: "Cash Collection by User" },
    ]
  },
  userManagement: {
    title: "User Management",
    description: "Secure user access control and reporting",
    color: "from-purple-500 to-purple-600",
    items: [
      { icon: UserCog, name: "User Rights & Restrictions" },
      { icon: BarChart3, name: "User Collection Report" },
      { icon: ShieldCheck, name: "User Account Security" },
    ]
  },
  tpaCompany: {
    title: "TPA & Company",
    description: "Manage insurance and corporate tie-ups efficiently",
    color: "from-indigo-500 to-indigo-600",
    items: [
      { icon: Building2, name: "TPA Tie-up Management" },
      { icon: Building2, name: "Company Tie-ups" },
      { icon: CreditCard, name: "Tie-up Based Billing" },
    ]
  },
  marketing: {
    title: "Marketing Tools",
    description: "Engage patients and doctors with custom communication",
    color: "from-pink-500 to-pink-600",
    items: [
      { icon: MessageSquare, name: "Custom SMS/Mail Templates" },
      { icon: MessageSquare, name: "Camp SMS/Mails to Patients" },
      { icon: MessageSquare, name: "SMS/Mails to Doctors" },
    ]
  },
  reports: {
    title: "Reports",
    description: "Comprehensive reporting across all departments",
    color: "from-orange-500 to-orange-600",
    items: [
      { icon: BarChart3, name: "OPD Reports" },
      { icon: BarChart3, name: "IPD Reports" },
      { icon: BarChart3, name: "Pharmacy Reports" },
    ]
  },
  pharmacy: {
    title: "Pharmacy",
    description: "Complete pharmacy management with GST compliance",
    color: "from-green-500 to-green-600",
    items: [
      { icon: Pill, name: "Store & Stock Management" },
      { icon: Receipt, name: "GST Tax Included" },
      { icon: Pill, name: "Expiry Return Management" },
    ]
  },
  centralStore: {
    title: "Central Store",
    description: "Centralized inventory and requisition management",
    color: "from-cyan-500 to-cyan-600",
    items: [
      { icon: Package, name: "Stock Management" },
      { icon: ClipboardList, name: "Requisition Management" },
    ]
  },
  sharing: {
    title: "Sharing Report",
    description: "Define and manage revenue sharing policies",
    color: "from-rose-500 to-rose-600",
    items: [
      { icon: Share2, name: "Define Sharing Policy" },
      { icon: BarChart3, name: "One-Click Sharing Reports" },
    ]
  },
  pathology: {
    title: "Pathology",
    description: "Ready-to-use pathology database with extensive templates",
    color: "from-violet-500 to-violet-600",
    items: [
      { icon: FlaskConical, name: "Readymade Database" },
      { icon: FileText, name: "500+ Reports" },
      { icon: ClipboardList, name: "1500+ Parameters" },
    ]
  },
  radiology: {
    title: "Radiology",
    description: "Comprehensive radiology templates and reporting",
    color: "from-fuchsia-500 to-fuchsia-600",
    items: [
      { icon: Scan, name: "Readymade Database" },
      { icon: FileText, name: "500+ Templates" },
    ]
  },
  mobileApp: {
    title: "Mobile Application",
    description: "Access patient information on-the-go",
    color: "from-slate-500 to-slate-600",
    items: [
      { icon: Smartphone, name: "IPD/OPD Patient List" },
      { icon: Users, name: "Patient Personal Details" },
      { icon: CreditCard, name: "Billing Status" },
    ]
  }
};

const ModulesSection = () => {
  return (
    <section id="modules" className="section-padding bg-background">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="module-badge mb-4">Complete ERP Solution</span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6">
            Integrated Modules for{" "}
            <span className="hero-gradient-text">Every Department</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            15+ comprehensive modules covering every aspect of hospital operations 
            from patient care to financial management.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(modules).map(([key, module], moduleIndex) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: moduleIndex * 0.05 }}
              className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-lg font-bold text-white">
                    {module.title.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {module.title}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
              
              <div className="space-y-2">
                {module.items.map((item, itemIndex) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50 text-sm"
                  >
                    <item.icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModulesSection;
