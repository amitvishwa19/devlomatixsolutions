import {
  Settings,
  Building2,
  Users,
  UserCircle,
  Calendar,
  Stethoscope,
  Pill,
  FileText,
  Package,
  Receipt,
  CreditCard,
  Bell,
  Shield,
  Plug,
  Database,
  KeyRound
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DynamicIcon } from "lucide-react/dynamic";


export function SettingsSidebar({ activeSection, onSectionChange, sections = [] }) {
  return (
    <div className="w-56  flex flex-col h-full border border-r ">
      <div className="p-4 flex items-center gap-2 text-sidebar-foreground">
        <Settings className="h-4 w-4" />
        <span className=" text-sm ">Organization settings</span>
      </div>
      <ScrollArea className="flex-1 mt-10">
        <nav className="px-2 pb-4 space-y-0.5">
          {sections.map((section) => (
            <div
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={cn(
                "w-full flex items-center gap-3 p-2 rounded-md text-sm font-medium transition-all duration-100 text-muted-foreground cursor-pointer",
                activeSection === section.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <DynamicIcon name={section.icon} className="h-4 w-4" />
              {section.label}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}
