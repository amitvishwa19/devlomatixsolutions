import { Card, CardContent } from "@/components/ui/card";
import {
    PenSquare,
    FileText,
    Send,
    Palette,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const QuickActions = ({
    onCompose,
    onCreateTemplate,
    onViewDrafts,
    onViewSent,
    onOpenAI,
    draftsCount = 5,
    sentCount = 128,
}) => {
    const actions = [
        {
            id: "compose",
            label: "Compose New",
            icon: PenSquare,
            description: "Create a new email",
            primary: true,
            onClick: onCompose,
        },
        {
            id: "ai-generate",
            label: "AI Generate",
            icon: Sparkles,
            description: "Generate with AI",
            ai: true,
            onClick: onOpenAI,
        },
        {
            id: "template",
            label: "Create Template",
            icon: Palette,
            description: "Design a template",
            onClick: onCreateTemplate,
        },
        {
            id: "drafts",
            label: "Drafts",
            icon: FileText,
            description: "Continue drafts",
            count: draftsCount,
            onClick: onViewDrafts,
        },
        {
            id: "sent",
            label: "Sent",
            icon: Send,
            description: "View sent emails",
            count: sentCount,
            onClick: onViewSent,
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
            {actions.map((action) => (
                <Card
                    key={action.id}
                    className={cn(
                        "cursor-pointer transition-all hover:shadow-md hover:border-primary/30",
                        action.primary && "border-primary/50 bg-primary/5",
                        action.ai && "border-purple-500/50 bg-purple-500/5"
                    )}
                    onClick={action.onClick}
                >
                    <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                        <div
                            className={cn(
                                "p-3 rounded-full",
                                action.primary
                                    ? "gradient-primary text-primary-foreground"
                                    : action.ai
                                        ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                                        : "bg-muted"
                            )}
                        >
                            <action.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">{action.label}</p>
                            {action.count !== undefined && (
                                <p className="text-xs text-muted-foreground">{action.count} items</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
