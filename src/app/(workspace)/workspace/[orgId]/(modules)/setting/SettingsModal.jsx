import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SettingsSidebar } from "./SettingsSidebar";
import { GeneralSettings } from "./sections/GeneralSettings";
import { StaffSettings } from "./sections/StaffSettings";
import { PatientsSettings } from "./sections/PatientsSettings";
import { AppointmentsSettings } from "./sections/AppointmentsSettings";
import { ServicesSettings } from "./sections/ServicesSettings";
import { PharmacySettings } from "./sections/PharmacySettings";
import { PrescriptionSettings } from "./sections/PrescriptionSettings";
import { InventorySettings } from "./sections/InventorySettings";
import { InvoiceSettings } from "./sections/InvoiceSettings";
import { BillingSubscriptionSettings } from "./sections/BillingSubscriptionSettings";
import { NotificationsSettings } from "./sections/NotificationsSettings";
import { SecuritySettings } from "./sections/SecuritySettings";
import { IntegrationsSettings } from "./sections/IntegrationsSettings";

import { DatabaseManagementSettings } from "./sections/DatabaseManagementSettings";
import { CredentialsSettings } from "./sections/CredentialsSettings";
import { ScrollArea } from "@/components/ui/scroll-area";
import SectionHeader from "./_components/SectionHeader";
import ContentHeader from "./_components/ContentHeader";
import DepartmentsSettings from "./sections/DepartmentsSettings";
import { ConsultationOptions } from "./sections/ConsultationOptions";
import { TermsConditions } from "./sections/TermsConditions";
import { PrivacyPolicy } from "./sections/PrivacyPolicy";

const sections = [
  {
    id: "general",
    label: "General",
    description: "Global hospital settings, branding, and basic configuration.",
    icon: "settings",
    component: <GeneralSettings />
  },
  {
    id: "departments",
    label: "Departments",
    description: "Configure clinical, surgical, and support departments.",
    icon: "building-2",
    component: <DepartmentsSettings />
  },
  {
    id: "consultation",
    label: "Consultation Option",
    description: "Connect with Trusted Doctors When You Need Them.",
    icon: "bell-electric",
    component: <ConsultationOptions />
  },
  {
    id: "staff",
    label: "Staff",
    description: "Manage doctors, nurses, and administrative staff profiles.",
    icon: "users", component: <StaffSettings />
  },
  {
    id: "appointments",
    label: "Appointments",
    description: "Set rules for scheduling, slots, reminders, and calendars.",
    icon: "calendar", component: <AppointmentsSettings />
  },
  // {
  //   id: "services",
  //   label: "Services",
  //   description: "Define hospital services, procedures, and pricing.",
  //   icon: "stethoscope"
  // },
  // {
  //   id: "pharmacy",
  //   label: "Pharmacy",
  //   description: "Configure pharmacy workflows, drug catalogs, and stock rules.",
  //   icon: "pill"
  // },
  // {
  //   id: "prescription",
  //   label: "Prescription",
  //   description: "Manage e-prescription templates, formats, and defaults.",
  //   icon: "file-text"
  // },
  // {
  //   id: "inventory",
  //   label: "Inventory",
  //   description: "Control medical stock, consumables, and reorder thresholds.",
  //   icon: "package"
  // },
  // {
  //   id: "invoice",
  //   label: "Invoice",
  //   description: "Customize invoice formats, numbering, and tax settings.",
  //   icon: "receipt"
  // },
  // {
  //   id: "billing",
  //   label: "Billing",
  //   description: "Set billing rules, payment terms, and charge policies.",
  //   icon: "credit-card"
  // },
  {
    id: "notifications",
    label: "Notifications",
    description: "Configure email, SMS, and in-app notification preferences.",
    icon: "bell",
    component: <NotificationsSettings />
  },
  {
    id: "security",
    label: "Security",
    description: "Manage roles, permissions, and access control policies.",
    icon: "shield",
    component: <SecuritySettings />
  },
  {
    id: "integrations",
    label: "Integrations",
    description: "Connect external lab, pharmacy, payment, and SMS providers.",
    icon: "plug",
    component: <IntegrationsSettings />
  },
  {
    id: "database",
    label: "Database Management",
    description: "Backup, maintenance, and data lifecycle configuration.",
    icon: "database",
    component: <DatabaseManagementSettings />
  },
  {
    id: "credentials",
    label: "Credentials",
    description: "Store and manage API keys and integration credentials securely.",
    icon: "key-round",
    component: <CredentialsSettings />
  },
  {
    id: "terms",
    label: "Terms & Condition",
    description: "Set terms and condition for your organization.",
    icon: "heart-handshake",
    component: <TermsConditions />
  },
  {
    id: "privacy",
    label: "Privacy Policy",
    description: "Set Privacy policy for your organization.",
    icon: "globe-lock",
    component: <PrivacyPolicy />
  },
];

export function SettingsModal({ open, onOpenChange, isOpen, onClose, }) {
  const [activeSection, setActiveSection] = useState("general");

  const renderSection = () => {
    switch (activeSection) {
      case "general":
        return <GeneralSettings />;
      case "departments":
        return <DepartmentsSettings />;
      case "consultation":
        return <ConsultationOptions />;
      case "staff":
        return <StaffSettings />;
      case "patients":
        return <PatientsSettings />;
      case "appointments":
        return <AppointmentsSettings />;
      case "services":
        return <ServicesSettings />;
      case "pharmacy":
        return <PharmacySettings />;
      case "prescription":
        return <PrescriptionSettings />;
      case "inventory":
        return <InventorySettings />;
      case "invoice":
        return <InvoiceSettings />;
      case "billing":
        return <BillingSubscriptionSettings />;
      case "notifications":
        return <NotificationsSettings />;
      case "security":
        return <SecuritySettings />;
      case "integrations":
        return <IntegrationsSettings />;
      case "database":
      case "database":
        return <DatabaseManagementSettings />;
      case "credentials":
        return <CredentialsSettings />;
      case "terms":
        return <TermsConditions />;
      case "privacy":
        return <PrivacyPolicy />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[80%] max-w-[80%] min-h-[80%] max-h-[80%] p-0 gap-0 overflow-hidden bg-card  border [&>button:last-child]:hidden">
        <DialogTitle className='hidden'></DialogTitle>
        <div className="flex h-full min-h-0">
          <SettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} sections={sections} />
          <div className="flex-1 h-[80vh] min-h-0  overflow-hidden">
            <div className="h-full min-h-0 overflow-hidden">{renderSection()}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
