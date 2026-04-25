import { ALL_KINDS } from "@/flowgenix/components/canvas/NodePickerSheet";
import type { LucideIcon } from "lucide-react";

export const iconForKind = (kindId?: string): LucideIcon | undefined => {
  if (!kindId) return undefined;
  return ALL_KINDS.find((k) => k.id === kindId)?.icon;
};
