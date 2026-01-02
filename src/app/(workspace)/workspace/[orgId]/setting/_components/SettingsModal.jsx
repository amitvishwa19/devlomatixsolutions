import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SettingsSidebar } from "./SettingsSidebar";
import { SettingsSearch } from "./SettingsSearch";
import { GeneralSettings } from "./sections/GeneralSettings";
import { DepartmentSettings } from "./sections/DepartmentSettings";
import { StaffSettings } from "./sections/StaffSettings";
import { PatientSettings } from "./sections/PatientSettings";
import { AppointmentSettings } from "./sections/AppointmentSettings";
import { PharmacySettings } from "./sections/PharmacySettings";
import { NotificationSettings } from "./sections/NotificationSettings";
import { SecuritySettings } from "./sections/SecuritySettings";
import { BillingSettings } from "./sections/BillingSettings";
import { IntegrationSettings } from "./sections/IntegrationSettings";
import { InvoiceSettings } from "./sections/InvoiceSettings";
import { InventorySettings } from "./sections/InventorySettings";
import { ServicesSettings } from "./sections/ServicesSettings";
import { PrescriptionSettings } from "./sections/PrescriptionSettings";

export function SettingsModal({ open, onOpenChange }) {
  const [activeSection, setActiveSection] = useState("general");

  const renderSection = () => {
    switch (activeSection) {
      case "general": return <GeneralSettings />;
      case "departments": return <DepartmentSettings />;
      case "staff": return <StaffSettings />;
      case "patients": return <PatientSettings />;
      case "appointments": return <AppointmentSettings />;
      case "pharmacy": return <PharmacySettings />;
      case "notifications": return <NotificationSettings />;
      case "security": return <SecuritySettings />;
      case "billing": return <BillingSettings />;
      case "integrations": return <IntegrationSettings />;
      case "invoice": return <InvoiceSettings />;
      case "inventory": return <InventorySettings />;
      case "services": return <ServicesSettings />;
      case "prescription": return <PrescriptionSettings />;
      default: return <GeneralSettings />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 gap-0 overflow-hidden bg-card border-border animate-scale-in">
        <div className="flex h-full">
          <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
            <div className="p-4 border-b border-sidebar-border">
              <SettingsSearch onSectionChange={setActiveSection} />
            </div>
            <SettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
          </div>
          <div className="flex-1 overflow-hidden animate-fade-in" key={activeSection}>
            {renderSection()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
