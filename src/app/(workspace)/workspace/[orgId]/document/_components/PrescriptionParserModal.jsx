import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PrescriptionParser } from "./PrescriptionParser";

export function PrescriptionParserModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <PrescriptionParser onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
