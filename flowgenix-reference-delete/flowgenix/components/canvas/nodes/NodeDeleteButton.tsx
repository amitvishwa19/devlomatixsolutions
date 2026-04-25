import { X } from "lucide-react";

interface Props {
  onDelete: () => void;
}

export const NodeDeleteButton = ({ onDelete }: Props) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onDelete();
    }}
    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background text-muted-foreground opacity-0 shadow-sm transition-opacity hover:border-destructive hover:text-destructive group-hover:opacity-100"
    title="Delete node"
  >
    <X className="h-3 w-3" />
  </button>
);
