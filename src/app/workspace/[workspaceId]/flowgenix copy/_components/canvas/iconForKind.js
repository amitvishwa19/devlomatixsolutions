import { ALL_KINDS } from "./NodePickerSheet";

export const iconForKind = (kindId) => {
  if (!kindId) return undefined;
  return ALL_KINDS.find((k) => k.id === kindId)?.icon;
};
