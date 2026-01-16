import { Loader, Save } from "lucide-react";
import { Button } from "@/components/ui/button";


const SectionHeader = ({ title, description, onSave, isSaving = false, permissions }) => {
  return (
    <div className="flex items-start justify-between p-4 border-b border-border mb-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>

      </div>
      {onSave && (

        <Button
          variant="ghost"
          size="icon"
          onClick={onSave}
          disabled={isSaving}
          className="text-muted-foreground hover:text-foreground"
        >
          {isSaving ? <Loader className="h-6 w-6 text-primary animate-spin" /> : <Save className="h-6 w-6 text-primary" />}
        </Button>

      )}
    </div>
  );
};

export default SectionHeader;
