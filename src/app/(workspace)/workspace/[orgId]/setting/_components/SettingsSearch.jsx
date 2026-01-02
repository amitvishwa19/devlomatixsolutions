import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const searchableItems = [
  // General
  { section: "general", keywords: ["hospital name", "name", "branding", "logo"], label: "Hospital Name" },
  { section: "general", keywords: ["timezone", "time zone", "time"], label: "Timezone" },
  { section: "general", keywords: ["date format", "date"], label: "Date Format" },
  { section: "general", keywords: ["language", "locale"], label: "Language" },
  { section: "general", keywords: ["backup", "recovery", "restore"], label: "Backup & Recovery" },

  // Departments
  { section: "departments", keywords: ["department", "ward", "unit", "floor"], label: "Departments" },
  { section: "departments", keywords: ["beds", "capacity", "occupancy"], label: "Bed Management" },

  // Staff
  { section: "staff", keywords: ["staff", "employee", "doctor", "nurse", "role"], label: "Staff Roles" },
  { section: "staff", keywords: ["shift", "schedule", "overtime", "hours"], label: "Shift Management" },
  { section: "staff", keywords: ["attendance", "clock in", "clock out"], label: "Attendance" },

  // Patients
  { section: "patients", keywords: ["patient", "registration", "id", "record"], label: "Patient Registration" },
  { section: "patients", keywords: ["portal", "online", "access"], label: "Patient Portal" },
  { section: "patients", keywords: ["hipaa", "privacy", "compliance", "consent"], label: "Privacy & Compliance" },

  // Appointments
  { section: "appointments", keywords: ["appointment", "booking", "schedule", "slot"], label: "Appointments" },
  { section: "appointments", keywords: ["reminder", "notification", "sms", "email"], label: "Reminders" },
  { section: "appointments", keywords: ["walk-in", "waitlist", "queue"], label: "Walk-ins" },

  // Pharmacy
  { section: "pharmacy", keywords: ["pharmacy", "prescription", "drug", "medication"], label: "Prescriptions" },
  { section: "pharmacy", keywords: ["refill", "renewal"], label: "Refills" },
  { section: "pharmacy", keywords: ["inventory", "stock", "supply"], label: "Inventory" },
  { section: "pharmacy", keywords: ["controlled substance", "narcotics"], label: "Controlled Substances" },

  // Notifications
  { section: "notifications", keywords: ["notification", "alert", "email", "sms", "push"], label: "Notifications" },
  { section: "notifications", keywords: ["quiet hours", "do not disturb"], label: "Quiet Hours" },
  { section: "notifications", keywords: ["emergency", "critical"], label: "Emergency Alerts" },

  // Security
  { section: "security", keywords: ["security", "password", "2fa", "two factor", "authentication"], label: "Security" },
  { section: "security", keywords: ["session", "timeout", "logout"], label: "Session Management" },
  { section: "security", keywords: ["ip", "whitelist", "vpn", "access"], label: "Access Control" },
  { section: "security", keywords: ["audit", "log", "tracking"], label: "Audit Log" },

  // Billing
  { section: "billing", keywords: ["billing", "invoice", "payment", "charge"], label: "Billing" },
  { section: "billing", keywords: ["tax", "rate"], label: "Tax Settings" },
  { section: "billing", keywords: ["insurance", "claim", "provider"], label: "Insurance" },
  { section: "billing", keywords: ["discount", "coupon"], label: "Discounts" },

  // Integrations
  { section: "integrations", keywords: ["integration", "api", "connect", "sync"], label: "Integrations" },
  { section: "integrations", keywords: ["ehr", "electronic health record"], label: "EHR Integration" },

  // Invoice
  { section: "invoice", keywords: ["invoice", "receipt", "bill format", "print"], label: "Invoice Settings" },
  { section: "invoice", keywords: ["tax", "currency", "payment terms"], label: "Invoice Tax" },

  // Inventory
  { section: "inventory", keywords: ["inventory", "stock", "warehouse", "supply"], label: "Inventory" },
  { section: "inventory", keywords: ["reorder", "low stock", "expiry"], label: "Stock Alerts" },

  // Services
  { section: "services", keywords: ["service", "procedure", "catalog", "pricing"], label: "Services" },
  { section: "services", keywords: ["package", "bundle", "discount"], label: "Service Packages" },

  // Prescription
  { section: "prescription", keywords: ["prescription", "rx", "medication", "drug"], label: "Prescription" },
  { section: "prescription", keywords: ["refill", "interaction", "allergy check"], label: "Drug Safety" },
];

export function SettingsSearch({ onSectionChange, onClose }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return searchableItems
      .filter((item) =>
        item.keywords.some((kw) => kw.includes(lowerQuery)) ||
        item.label.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 8);
  }, [query]);

  const handleSelect = (section) => {
    onSectionChange(section);
    setQuery("");
    onClose?.();
  };

  const sectionLabels = {
    general: "General",
    departments: "Departments",
    staff: "Staff",
    patients: "Patients",
    appointments: "Appointments",
    pharmacy: "Pharmacy",
    notifications: "Notifications",
    security: "Security",
    billing: "Billing",
    integrations: "Integrations",
    invoice: "Invoice",
    inventory: "Inventory",
    services: "Services",
    prescription: "Prescription",
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search settings..."
          className="pl-10  border-border"
        />
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
          {results.map((result, index) => (
            <button
              key={`${result.section}-${result.label}-${index}`}
              onClick={() => handleSelect(result.section)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-2 transition-colors text-left"
            >
              <span className="text-sm text-foreground">{result.label}</span>
              <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-surface-3">
                {sectionLabels[result.section]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
