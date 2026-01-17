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
    Send,
    Search,
    Eye,
    CheckCircle2,
    XCircle,
    Clock,
    Mail,
    User,
    RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mockSentEmails = [
    {
        id: "1",
        subject: "Appointment Confirmation - January 15, 2025",
        recipients: ["john.smith@example.com"],
        sentAt: new Date(Date.now() - 1000 * 60 * 15),
        status: "delivered",
        category: "appointment",
        opens: 2,
    },
    {
        id: "2",
        subject: "Invoice #54321 - Payment Due",
        recipients: ["mike.williams@example.com"],
        sentAt: new Date(Date.now() - 1000 * 60 * 45),
        status: "delivered",
        category: "billing",
        opens: 1,
    },
    {
        id: "3",
        subject: "Your Lab Results Are Ready",
        recipients: ["lisa.davis@example.com"],
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        status: "delivered",
        category: "lab",
        opens: 3,
    },
    {
        id: "4",
        subject: "Welcome to Our Hospital",
        recipients: ["amanda.martinez@example.com"],
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
        status: "delivered",
        category: "general",
        opens: 1,
    },
    {
        id: "5",
        subject: "Appointment Reminder for Tomorrow",
        recipients: ["invalid-email@test"],
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
        status: "failed",
        category: "appointment",
    },
    {
        id: "6",
        subject: "Emergency Alert: System Maintenance",
        recipients: ["staff@hospital.com", "doctors@hospital.com"],
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        status: "delivered",
        category: "emergency",
        opens: 45,
    },
    {
        id: "7",
        subject: "Monthly Newsletter - December 2024",
        recipients: ["newsletter-list@hospital.com"],
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        status: "pending",
        category: "general",
    },
];

const formatSentTime = (date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
};

const getStatusIcon = (status) => {
    switch (status) {
        case "delivered":
            return <CheckCircle2 className="w-4 h-4 text-success" />;
        case "failed":
            return <XCircle className="w-4 h-4 text-destructive" />;
        case "pending":
            return <Clock className="w-4 h-4 text-warning" />;
    }
};

const getStatusBadge = (status) => {
    const styles = {
        delivered: "bg-success/10 text-success border-success/20",
        failed: "bg-destructive/10 text-destructive border-destructive/20",
        pending: "bg-warning/10 text-warning border-warning/20",
    };
    return styles[status];
};

export const SentItemsSheet = ({ open, onOpenChange }) => {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredEmails = mockSentEmails.filter((email) => {
        const matchesSearch =
            email.subject.toLowerCase().includes(search.toLowerCase()) ||
            email.recipients.some((r) => r.toLowerCase().includes(search.toLowerCase()));
        const matchesStatus = statusFilter === "all" || email.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: mockSentEmails.length,
        delivered: mockSentEmails.filter((e) => e.status === "delivered").length,
        failed: mockSentEmails.filter((e) => e.status === "failed").length,
        pending: mockSentEmails.filter((e) => e.status === "pending").length,
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
                <SheetHeader className="px-6 py-4 border-b bg-muted/30">
                    <SheetTitle className="font-display flex items-center gap-2">
                        <Send className="w-5 h-5 text-primary" />
                        Sent Items
                        <Badge variant="secondary" className="ml-2">
                            {stats.total}
                        </Badge>
                    </SheetTitle>
                    <SheetDescription>
                        View and track your sent emails
                    </SheetDescription>
                </SheetHeader>

                {/* Stats Bar */}
                <div className="px-6 py-3 border-b bg-muted/20 flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span className="text-sm font-medium">{stats.delivered}</span>
                        <span className="text-xs text-muted-foreground">delivered</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-destructive" />
                        <span className="text-sm font-medium">{stats.failed}</span>
                        <span className="text-xs text-muted-foreground">failed</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-warning" />
                        <span className="text-sm font-medium">{stats.pending}</span>
                        <span className="text-xs text-muted-foreground">pending</span>
                    </div>
                </div>

                <div className="px-6 py-4 border-b space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search sent emails..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex gap-2">
                        {["all", "delivered", "failed", "pending"].map((status) => (
                            <Button
                                key={status}
                                variant={statusFilter === status ? "default" : "outline"}
                                size="sm"
                                onClick={() => setStatusFilter(status)}
                                className={cn(
                                    "capitalize text-xs",
                                    statusFilter === status && "gradient-primary text-primary-foreground"
                                )}
                            >
                                {status}
                            </Button>
                        ))}
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-2">
                        {filteredEmails.length === 0 ? (
                            <div className="text-center py-12">
                                <Send className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                                <p className="text-muted-foreground">No sent emails found</p>
                            </div>
                        ) : (
                            filteredEmails.map((email) => (
                                <div
                                    key={email.id}
                                    className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {getStatusIcon(email.status)}
                                                <p className="font-medium text-sm truncate">
                                                    {email.subject}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 mb-2">
                                                <User className="w-3 h-3 text-muted-foreground" />
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {email.recipients.join(", ")}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <Badge
                                                    variant="outline"
                                                    className={cn("text-xs h-5", getStatusBadge(email.status))}
                                                >
                                                    {email.status}
                                                </Badge>
                                                {email.category && (
                                                    <Badge variant="outline" className="text-xs h-5">
                                                        {email.category}
                                                    </Badge>
                                                )}
                                                <span className="text-xs text-muted-foreground">
                                                    {formatSentTime(email.sentAt)}
                                                </span>
                                                {email.opens !== undefined && email.status === "delivered" && (
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Eye className="w-3 h-3" />
                                                        {email.opens} opens
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                title="View details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            {email.status === "failed" && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    title="Retry"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                </Button>
                                            )}
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
