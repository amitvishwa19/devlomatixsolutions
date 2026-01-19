import { Loader, Save } from "lucide-react";
import { Button } from "@/components/ui/button";


const SectionHeader = ({ title, description, onSave, isSaving = false, permissions }) => {
  return (
    <div className="flex items-start justify-between p-4 border-b border-border">
      <div>
        <h2 className="text-sm text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>

      </div>
      {onSave && (

        <div
          variant="ghost"
          size="icon"
          onClick={onSave}
          disabled={isSaving}
          className="text-muted-foreground hover:text-foreground cursor-pointer mt-2 mr-4"
        >
          {isSaving ? <Loader className="h-5 w-5 text-primary animate-spin" /> : <Save className="h-5 w-5 text-primary" />}
        </div>

      )}
    </div>
  );
};

export default SectionHeader;
