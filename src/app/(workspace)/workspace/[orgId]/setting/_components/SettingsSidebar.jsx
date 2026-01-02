import {
  Settings, Building2, Users, Calendar, Bell, Shield, CreditCard, Plug, UserCircle, Pill,
  FileText, Package, Stethoscope, ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const sections = [
  { id: "general", label: "General", icon: Settings },
  { id: "departments", label: "Departments", icon: Building2 },
  { id: "staff", label: "Staff", icon: Users },
  { id: "patients", label: "Patients", icon: UserCircle },
  { id: "appointments", label: "Appointments", icon: Calendar },
  { id: "services", label: "Services", icon: Stethoscope },
  { id: "pharmacy", label: "Pharmacy", icon: Pill },
  { id: "prescription", label: "Prescription", icon: ClipboardList },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "invoice", label: "Invoice", icon: FileText },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "integrations", label: "Integrations", icon: Plug },
];

export function SettingsSidebar({ activeSection, onSectionChange }) {
  return (
    <div className="flex-1 flex flex-col">
      <ScrollArea className="flex-1 px-4 py-2">
        <nav className="space-y-1 py-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-all duration-100",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 glow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground")} />
                {section.label}
              </button>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
