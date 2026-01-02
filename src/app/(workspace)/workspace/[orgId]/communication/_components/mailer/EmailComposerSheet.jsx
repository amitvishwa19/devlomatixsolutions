import { useState, useEffect } from "react";
//import { emailTemplates, getCategoryColor, getCategoryIcon } from "@/lib/emailTemplates";
import { UserSelector } from "./UserSelector";
//import { useSendEmail } from "@/hooks/useSendEmail";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Send,
    Loader2,
    Users,
    FileText,
    Eye,
    Sparkles,
    Mail,
    X,
    Clock,
    Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { emailTemplates, getCategoryColor, getCategoryIcon } from "../../_lib/emailTemplates";
import { useSendEmail } from "../../_hooks/useSendEmail";

export const EmailComposerSheet = ({
    open,
    onOpenChange,
    initialTemplate,
}) => {
    const [activeTab, setActiveTab] = useState("recipients");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [customSubject, setCustomSubject] = useState("");
    const [customBody, setCustomBody] = useState("");
    const [variables, setVariables] = useState({});
    const [useCustomEmail, setUseCustomEmail] = useState(false);
    const [manualEmail, setManualEmail] = useState("");

    const { sendEmail, isLoading } = useSendEmail();
    const { toast } = useToast();

    // Initialize with template if provided
    useEffect(() => {
        if (initialTemplate) {
            setSelectedTemplate(initialTemplate);
            setCustomSubject(initialTemplate.subject);
            setCustomBody(initialTemplate.body);
            const initialVars = {};
            initialTemplate.variables.forEach((v) => {
                initialVars[v] = "";
            });
            setVariables(initialVars);
        }
    }, [initialTemplate]);

    // Update variables when template changes
    useEffect(() => {
        if (selectedTemplate) {
            setCustomSubject(selectedTemplate.subject);
            setCustomBody(selectedTemplate.body);
            const initialVars = {};
            selectedTemplate.variables.forEach((v) => {
                initialVars[v] = "";
            });
            setVariables(initialVars);
        }
    }, [selectedTemplate]);

    const handleSelectUser = (user) => {
        setSelectedUsers((prev) => [...prev, user]);
    };

    const handleRemoveUser = (userId) => {
        setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
    };

    const replaceVariables = (text) => {
        let result = text;
        Object.entries(variables).forEach(([key, value]) => {
            result = result.replace(new RegExp(`{{${key}}}`, "g"), value || `{{${key}}}`);
        });
        return result;
    };

    const getRecipients = () => {
        if (useCustomEmail && manualEmail) {
            return manualEmail.split(",").map((e) => e.trim()).filter(Boolean);
        }
        return selectedUsers.map((u) => u.email);
    };

    const handleSendEmails = async () => {
        const recipients = getRecipients();

        if (recipients.length === 0) {
            toast({
                title: "No Recipients",
                description: "Please select at least one recipient",
                variant: "destructive",
            });
            return;
        }

        const subject = replaceVariables(customSubject);
        const html = replaceVariables(customBody);

        // Send to each recipient
        let successCount = 0;
        for (const recipient of recipients) {
            const result = await sendEmail({ to: recipient, subject, html });
            if (result.success) successCount++;
        }

        if (successCount === recipients.length) {
            toast({
                title: "All Emails Sent",
                description: `Successfully sent ${successCount} email(s)`,
            });
            onOpenChange(false);
            resetForm();
        } else if (successCount > 0) {
            toast({
                title: "Partial Success",
                description: `Sent ${successCount} of ${recipients.length} emails`,
                variant: "destructive",
            });
        }
    };

    const resetForm = () => {
        setSelectedUsers([]);
        setSelectedTemplate(null);
        setCustomSubject("");
        setCustomBody("");
        setVariables({});
        setManualEmail("");
        setActiveTab("recipients");
    };

    const handleSaveDraft = () => {
        toast({
            title: "Draft Saved",
            description: "Your email draft has been saved",
        });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col">
                <SheetHeader className="px-6 py-4 border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <SheetTitle className="font-display flex items-center gap-2">
                                <Mail className="w-5 h-5 text-primary" />
                                Compose Email
                            </SheetTitle>
                            <SheetDescription>
                                Create and send emails to patients, doctors, or staff
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <Tabs
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v)}
                    className="flex-1 flex flex-col overflow-hidden"
                >
                    <TabsList className="mx-6 mt-4 grid grid-cols-3">
                        <TabsTrigger value="recipients" className="gap-2">
                            <Users className="w-4 h-4" />
                            Recipients
                            {selectedUsers.length > 0 && (
                                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                                    {selectedUsers.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="compose" className="gap-2">
                            <FileText className="w-4 h-4" />
                            Compose
                        </TabsTrigger>
                        <TabsTrigger value="preview" className="gap-2">
                            <Eye className="w-4 h-4" />
                            Preview
                        </TabsTrigger>
                    </TabsList>

                    <ScrollArea className="flex-1 px-6">
                        <TabsContent value="recipients" className="mt-4 space-y-4">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant={!useCustomEmail ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setUseCustomEmail(false)}
                                    className={cn(!useCustomEmail && "gradient-primary text-primary-foreground")}
                                >
                                    <Users className="w-4 h-4 mr-2" />
                                    Select Users
                                </Button>
                                <Button
                                    variant={useCustomEmail ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setUseCustomEmail(true)}
                                    className={cn(useCustomEmail && "gradient-primary text-primary-foreground")}
                                >
                                    <Mail className="w-4 h-4 mr-2" />
                                    Manual Entry
                                </Button>
                            </div>

                            {useCustomEmail ? (
                                <div className="space-y-2">
                                    <Label>Email Addresses</Label>
                                    <Textarea
                                        placeholder="Enter email addresses separated by commas..."
                                        value={manualEmail}
                                        onChange={(e) => setManualEmail(e.target.value)}
                                        className="min-h-[120px]"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Separate multiple emails with commas
                                    </p>
                                </div>
                            ) : (
                                <UserSelector
                                    selectedUsers={selectedUsers}
                                    onSelect={handleSelectUser}
                                    onRemove={handleRemoveUser}
                                />
                            )}
                        </TabsContent>

                        <TabsContent value="compose" className="mt-4 space-y-6">
                            {/* Template Selector */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    Use Template (Optional)
                                </Label>
                                <Select
                                    value={selectedTemplate?.id || "custom"}
                                    onValueChange={(value) => {
                                        if (value === "custom") {
                                            setSelectedTemplate(null);
                                            setCustomSubject("");
                                            setCustomBody("");
                                            setVariables({});
                                        } else {
                                            const template = emailTemplates.find((t) => t.id === value);
                                            if (template) setSelectedTemplate(template);
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="custom">✏️ Custom Email</SelectItem>
                                        {emailTemplates.map((template) => (
                                            <SelectItem key={template.id} value={template.id}>
                                                <span className="flex items-center gap-2">
                                                    <span>{getCategoryIcon(template.category)}</span>
                                                    {template.name}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedTemplate && (
                                <Badge className={cn("w-fit", getCategoryColor(selectedTemplate.category))}>
                                    {selectedTemplate.category}
                                </Badge>
                            )}

                            <Separator />

                            {/* Subject */}
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    placeholder="Email subject..."
                                    value={customSubject}
                                    onChange={(e) => setCustomSubject(e.target.value)}
                                />
                            </div>

                            {/* Template Variables */}
                            {selectedTemplate && selectedTemplate.variables.length > 0 && (
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">Template Variables</Label>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {selectedTemplate.variables.map((variable) => (
                                            <div key={variable} className="space-y-1">
                                                <Label htmlFor={variable} className="text-xs capitalize text-muted-foreground">
                                                    {variable.replace(/([A-Z])/g, " $1").trim()}
                                                </Label>
                                                <Input
                                                    id={variable}
                                                    placeholder={`Enter ${variable}`}
                                                    value={variables[variable] || ""}
                                                    onChange={(e) =>
                                                        setVariables((prev) => ({
                                                            ...prev,
                                                            [variable]: e.target.value,
                                                        }))
                                                    }
                                                    className="h-9"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Body */}
                            {!selectedTemplate && (
                                <div className="space-y-2">
                                    <Label htmlFor="body">Email Body (HTML)</Label>
                                    <Textarea
                                        id="body"
                                        placeholder="Write your email content here..."
                                        value={customBody}
                                        onChange={(e) => setCustomBody(e.target.value)}
                                        className="min-h-[200px] font-mono text-sm"
                                    />
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="preview" className="mt-4 space-y-4 pb-6">
                            <div className="space-y-2">
                                <Label>Recipients</Label>
                                <div className="flex flex-wrap gap-2">
                                    {getRecipients().map((email, i) => (
                                        <Badge key={i} variant="secondary">
                                            {email}
                                        </Badge>
                                    ))}
                                    {getRecipients().length === 0 && (
                                        <p className="text-sm text-muted-foreground">No recipients selected</p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <p className="text-sm font-medium">{replaceVariables(customSubject) || "No subject"}</p>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label>Email Preview</Label>
                                <div
                                    className="border rounded-lg overflow-hidden bg-card"
                                    dangerouslySetInnerHTML={{
                                        __html: replaceVariables(customBody) || "<p class='p-4 text-muted-foreground'>No content</p>",
                                    }}
                                />
                            </div>
                        </TabsContent>
                    </ScrollArea>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between gap-3">
                        <Button variant="outline" onClick={handleSaveDraft} className="gap-2">
                            <Save className="w-4 h-4" />
                            Save Draft
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSendEmails}
                                disabled={isLoading || getRecipients().length === 0}
                                className="gap-2 gradient-primary text-primary-foreground hover:opacity-90"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Send Email
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
};
