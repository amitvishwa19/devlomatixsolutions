import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
    FileText,
    Search,
    Trash2,
    Edit3,
    Clock,
    Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mockDrafts = [
    {
        id: "1",
        subject: "Appointment Reminder for Tomorrow",
        recipients: ["john.smith@example.com"],
        preview: "Dear John, This is a reminder about your upcoming appointment...",
        lastModified: new Date(Date.now() - 1000 * 60 * 30),
        category: "appointment",
    },
    {
        id: "2",
        subject: "Invoice #12345 - Payment Due",
        recipients: ["mike.williams@example.com", "lisa.davis@example.com"],
        preview: "Please find attached your billing statement for the month of...",
        lastModified: new Date(Date.now() - 1000 * 60 * 60 * 2),
        category: "billing",
    },
    {
        id: "3",
        subject: "Lab Results Available",
        recipients: ["amanda.martinez@example.com"],
        preview: "Your recent lab test results are now available. Please log in to...",
        lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24),
        category: "lab",
    },
    {
        id: "4",
        subject: "Welcome to Our Hospital",
        recipients: [],
        preview: "Dear Patient, Welcome to our healthcare family. We are honored...",
        lastModified: new Date(Date.now() - 1000 * 60 * 60 * 48),
        category: "general",
    },
    {
        id: "5",
        subject: "",
        recipients: ["jennifer.garcia@hospital.com"],
        preview: "Starting to draft a new email...",
        lastModified: new Date(Date.now() - 1000 * 60 * 60 * 72),
    },
];

const formatTimeAgo = (date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

export const DraftsSheet = ({ open, onOpenChange, onEditDraft }) => {
    const [search, setSearch] = useState("");
    const [drafts, setDrafts] = useState(mockDrafts);

    const filteredDrafts = drafts.filter(
        (draft) =>
            draft.subject.toLowerCase().includes(search.toLowerCase()) ||
            draft.preview.toLowerCase().includes(search.toLowerCase()) ||
            draft.recipients.some((r) => r.toLowerCase().includes(search.toLowerCase()))
    );

    const handleDelete = (id) => {
        setDrafts((prev) => prev.filter((d) => d.id !== id));
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
                <SheetHeader className="px-6 py-4 border-b bg-muted/30">
                    <SheetTitle className="font-display flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Drafts
                        <Badge variant="secondary" className="ml-2">
                            {drafts.length}
                        </Badge>
                    </SheetTitle>
                    <SheetDescription>
                        Continue working on your saved drafts
                    </SheetDescription>
                </SheetHeader>

                <div className="px-6 py-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search drafts..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-2">
                        {filteredDrafts.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                                <p className="text-muted-foreground">No drafts found</p>
                            </div>
                        ) : (
                            filteredDrafts.map((draft) => (
                                <div
                                    key={draft.id}
                                    className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                                                <p className="font-medium text-sm truncate">
                                                    {draft.subject || "(No subject)"}
                                                </p>
                                            </div>
                                            {draft.recipients.length > 0 && (
                                                <p className="text-xs text-muted-foreground mb-1 truncate">
                                                    To: {draft.recipients.join(", ")}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {draft.preview}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Clock className="w-3 h-3 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground">
                                                    {formatTimeAgo(draft.lastModified)}
                                                </span>
                                                {draft.category && (
                                                    <Badge variant="outline" className="text-xs h-5">
                                                        {draft.category}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => onEditDraft?.(draft)}
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(draft.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
};
