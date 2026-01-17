
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Send, Eye } from "lucide-react";
import { getCategoryColor, getCategoryIcon } from "../../_lib/emailTemplates";

export const TemplateCard = ({ template, onSelect, onPreview }) => {
    return (
        <Card className="group hover:shadow-soft transition-all duration-300 border-border/50 hover:border-primary/30 animate-scale-in">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{getCategoryIcon(template.category)}</span>
                        <CardTitle className="font-display text-lg">{template.name}</CardTitle>
                    </div>
                    <Badge variant="secondary" className={getCategoryColor(template.category)}>
                        {template.category}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    Subject: {template.subject}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                    {template.variables.slice(0, 3).map((variable) => (
                        <Badge key={variable} variant="outline" className="text-xs">
                            {`{{${variable}}}`}
                        </Badge>
                    ))}
                    {template.variables.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                            +{template.variables.length - 3} more
                        </Badge>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onPreview(template)}
                    >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                    </Button>
                    <Button
                        size="sm"
                        className="flex-1 gradient-primary text-primary-foreground hover:opacity-90"
                        onClick={() => onSelect(template)}
                    >
                        <Send className="w-4 h-4 mr-1" />
                        Use
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
