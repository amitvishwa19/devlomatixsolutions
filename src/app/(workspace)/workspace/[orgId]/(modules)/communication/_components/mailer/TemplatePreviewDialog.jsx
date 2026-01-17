import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getCategoryColor, getCategoryIcon } from "../../_lib/emailTemplates";


export const TemplatePreviewDialog = ({
    template,
    open,
    onOpenChange,
}) => {
    if (!template) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{getCategoryIcon(template.category)}</span>
                        <div>
                            <DialogTitle className="font-display text-xl">
                                {template.name}
                            </DialogTitle>
                            <DialogDescription className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className={getCategoryColor(template.category)}>
                                    {template.category}
                                </Badge>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Subject</h4>
                        <p className="text-foreground">{template.subject}</p>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Variables</h4>
                        <div className="flex flex-wrap gap-2">
                            {template.variables.map((variable) => (
                                <Badge key={variable} variant="outline">
                                    {`{{${variable}}}`}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Email Preview</h4>
                        <div
                            className="border rounded-lg overflow-hidden"
                            dangerouslySetInnerHTML={{ __html: template.body }}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
