import { Building2, Video, MessageCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { DynamicIcon } from "lucide-react/dynamic";

const appointmentTypes = {
  clinic: { id: "clinic", label: "In-Person", description: "Visit clinic", icon: 'building-2' },
  video: { id: "video", label: "Video", description: "Video call", icon: 'video' },
  chat: { id: "chat", label: "Chat", description: "Text chat", icon: 'message-circle' },
  phone: { id: "phone", label: "Phone", description: "Voice call", icon: 'phone' },
};

export function AppointmentTypeSelector({ selectedType, onSelectType, disabled, value }) {
  //const Icon = appointmentTypes[slot?.slot];
  const data = appointmentTypes[selectedType?.type];

  return (
    <button

      type="button"
      onClick={() => onSelectType(selectedType)}
      className={cn(
        "relative overflow-hidden flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 w-full",
        "border focus:outline-none focus:ring-2 focus:ring-primary/30",
        "hover:scale-[1.02] active:scale-[0.98]",
        selectedType?.type === value?.type
          ? "border-primary bg-primary/10 shadow-glow-sm"
          : "border-border/60 bg-secondary/50 hover:border-primary/40 hover:bg-secondary/80"
      )}
    >
      <div className={cn(
        "p-2.5 rounded-xl transition-colors",
        selectedType?.type === value?.type ? "bg-primary/20" : "bg-background/50"
      )}>
        <DynamicIcon name={data?.icon} className={cn(
          "h-5 w-5 transition-colors",
          selectedType?.type === value?.type ? "text-primary" : "text-muted-foreground"
        )} />
      </div>
      <div className="text-center">
        <span className={cn(
          "text-sm font-semibold transition-colors block",
          selectedType?.type === value?.type ? "text-primary" : "text-foreground"
        )}>
          {data?.label}
        </span>
        <span className="text-[10px] text-muted-foreground">{data?.description}</span>
      </div>
    </button>
  );
}

export default AppointmentTypeSelector;
