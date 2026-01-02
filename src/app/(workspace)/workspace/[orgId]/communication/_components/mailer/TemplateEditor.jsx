import { useState, useEffect, useCallback, useRef } from "react";
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
    Code,
    Eye,
    Palette,
    Plus,
    X,
    Save,
    Copy,
    Sparkles,
    Variable,
    FileCode,
    Monitor,
    Smartphone,
    Tablet,
    Undo2,
    Redo2,
    Download,
    Upload,
    Send,
    Image,
    Link,
    Bold,
    Italic,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    Type,
    RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const colorPresets = [
    { name: "Teal", primary: "#0d9488", secondary: "#f0fdfa", accent: "#0f766e" },
    { name: "Blue", primary: "#0284c7", secondary: "#e0f2fe", accent: "#0369a1" },
    { name: "Purple", primary: "#7c3aed", secondary: "#faf5ff", accent: "#6b21a8" },
    { name: "Green", primary: "#059669", secondary: "#ecfdf5", accent: "#047857" },
    { name: "Red", primary: "#dc2626", secondary: "#fef2f2", accent: "#991b1b" },
    { name: "Orange", primary: "#ea580c", secondary: "#fff7ed", accent: "#c2410c" },
];

const templateSnippets = [
    {
        name: "Header",
        icon: "🏥",
        code: `<div style="text-align: center; margin-bottom: 30px;">
  <h1 style="color: {{primaryColor}}; margin: 0; font-size: 24px;">{{title}}</h1>
</div>`,
    },
    {
        name: "Info Box",
        icon: "📦",
        code: `<div style="background: {{secondaryColor}}; border-radius: 8px; padding: 20px; margin: 20px 0;">
  <p style="margin: 5px 0; color: {{accentColor}};"><strong>Label:</strong> {{value}}</p>
</div>`,
    },
    {
        name: "Button",
        icon: "🔘",
        code: `<a href="{{buttonUrl}}" style="display: inline-block; background: {{primaryColor}}; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">{{buttonText}}</a>`,
    },
    {
        name: "Footer",
        icon: "📝",
        code: `<p style="color: #64748b; font-size: 14px; margin-top: 30px; text-align: center;">
  Best regards,<br><strong>{{teamName}}</strong>
</p>`,
    },
    {
        name: "Two Columns",
        icon: "📊",
        code: `<table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
  <tr>
    <td width="48%" style="vertical-align: top; padding-right: 2%;">
      <p style="color: #334155;">Left column content</p>
    </td>
    <td width="48%" style="vertical-align: top; padding-left: 2%;">
      <p style="color: #334155;">Right column content</p>
    </td>
  </tr>
</table>`,
    },
    {
        name: "Alert Box",
        icon: "⚠️",
        code: `<div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
  <p style="margin: 0; color: #92400e; font-weight: 600;">⚠️ Important Notice</p>
  <p style="margin: 8px 0 0 0; color: #92400e;">Your alert message here.</p>
</div>`,
    },
    {
        name: "Image Block",
        icon: "🖼️",
        code: `<div style="text-align: center; margin: 20px 0;">
  <img src="{{imageUrl}}" alt="{{imageAlt}}" style="max-width: 100%; height: auto; border-radius: 8px;" />
</div>`,
    },
    {
        name: "Divider",
        icon: "➖",
        code: `<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />`,
    },
    {
        name: "Social Links",
        icon: "🔗",
        code: `<div style="text-align: center; margin: 30px 0;">
  <a href="{{facebookUrl}}" style="display: inline-block; margin: 0 8px; color: {{primaryColor}}; text-decoration: none;">Facebook</a>
  <a href="{{twitterUrl}}" style="display: inline-block; margin: 0 8px; color: {{primaryColor}}; text-decoration: none;">Twitter</a>
  <a href="{{linkedinUrl}}" style="display: inline-block; margin: 0 8px; color: {{primaryColor}}; text-decoration: none;">LinkedIn</a>
</div>`,
    },
    {
        name: "Quote",
        icon: "💬",
        code: `<blockquote style="border-left: 4px solid {{primaryColor}}; margin: 20px 0; padding: 15px 20px; background: {{secondaryColor}}; font-style: italic; color: #475569;">
  "{{quoteText}}"
  <footer style="margin-top: 10px; font-style: normal; color: #64748b;">— {{authorName}}</footer>
</blockquote>`,
    },
];

const MAX_HISTORY = 50;

export const TemplateEditor = ({
    open,
    onOpenChange,
    editingTemplate,
}) => {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("general");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState(getDefaultTemplate());
    const [variables, setVariables] = useState([]);
    const [newVariable, setNewVariable] = useState("");
    const [activeTab, setActiveTab] = useState("edit");
    const [previewDevice, setPreviewDevice] = useState("desktop");
    const [selectedColorPreset, setSelectedColorPreset] = useState(colorPresets[0]);

    // Undo/Redo state
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const isUndoRedo = useRef(false);

    // Dialogs
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
    const [isTestEmailDialogOpen, setIsTestEmailDialogOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [imageAlt, setImageAlt] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [linkText, setLinkText] = useState("");
    const [testEmail, setTestEmail] = useState("");

    const fileInputRef = useRef(null);
    const { toast } = useToast();

    // Track body changes for undo/redo
    useEffect(() => {
        if (isUndoRedo.current) {
            isUndoRedo.current = false;
            return;
        }

        if (body !== history[historyIndex]) {
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(body);
            if (newHistory.length > MAX_HISTORY) {
                newHistory.shift();
            }
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        }
    }, [body]);

    useEffect(() => {
        if (editingTemplate) {
            setName(editingTemplate.name);
            setCategory(editingTemplate.category);
            setSubject(editingTemplate.subject);
            setBody(editingTemplate.body);
            setVariables(editingTemplate.variables);
        } else {
            resetForm();
        }
    }, [editingTemplate, open]);

    function getDefaultTemplate() {
        return `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafb; padding: 40px 20px;">
  <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #0d9488; margin: 0; font-size: 24px;">Your Title Here</h1>
    </div>
    <p style="color: #334155; font-size: 16px; line-height: 1.6;">Dear {{recipientName}},</p>
    <p style="color: #334155; font-size: 16px; line-height: 1.6;">Your message content goes here.</p>
    <p style="color: #334155; font-size: 16px; margin-top: 30px;">Best regards,<br><strong>Your Team</strong></p>
  </div>
</div>`;
    }

    const resetForm = () => {
        setName("");
        setCategory("general");
        setSubject("");
        setBody(getDefaultTemplate());
        setVariables(["recipientName"]);
        setNewVariable("");
    };

    const handleAddVariable = () => {
        if (newVariable && !variables.includes(newVariable)) {
            setVariables([...variables, newVariable]);
            setNewVariable("");
            toast({
                title: "Variable Added",
                description: `Use {{${newVariable}}} in your template`,
            });
        }
    };

    const handleRemoveVariable = (variable) => {
        setVariables(variables.filter((v) => v !== variable));
    };

    const insertVariable = (variable) => {
        setBody((prev) => prev + `{{${variable}}}`);
        toast({
            title: "Variable Inserted",
            description: `Added {{${variable}}} to template`,
        });
    };

    const insertSnippet = (code) => {
        setBody((prev) => prev + "\n" + code);
        toast({
            title: "Snippet Inserted",
            description: "Code snippet added to template",
        });
    };

    const applyColorPreset = (preset) => {
        setSelectedColorPreset(preset);
        let updatedBody = body;
        updatedBody = updatedBody.replace(/#0d9488|#0284c7|#7c3aed|#059669|#dc2626|#ea580c/gi, preset.primary);
        updatedBody = updatedBody.replace(/#f0fdfa|#e0f2fe|#faf5ff|#ecfdf5|#fef2f2|#fff7ed/gi, preset.secondary);
        updatedBody = updatedBody.replace(/#0f766e|#0369a1|#6b21a8|#047857|#991b1b|#c2410c/gi, preset.accent);
        setBody(updatedBody);
        toast({
            title: "Colors Applied",
            description: `Applied ${preset.name} color scheme`,
        });
    };

    // Undo/Redo handlers
    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            isUndoRedo.current = true;
            setHistoryIndex(historyIndex - 1);
            setBody(history[historyIndex - 1]);
        }
    }, [history, historyIndex]);

    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            isUndoRedo.current = true;
            setHistoryIndex(historyIndex + 1);
            setBody(history[historyIndex + 1]);
        }
    }, [history, historyIndex]);

    // Export template
    const handleExport = () => {
        const template = {
            name,
            category,
            subject,
            body,
            variables,
            exportedAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${name || "template"}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast({
            title: "Template Exported",
            description: "Template saved as JSON file",
        });
    };

    // Import template
    const handleImport = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target?.result);
                if (imported.name) setName(imported.name);
                if (imported.category) setCategory(imported.category);
                if (imported.subject) setSubject(imported.subject);
                if (imported.body) setBody(imported.body);
                if (imported.variables) setVariables(imported.variables);
                toast({
                    title: "Template Imported",
                    description: "Template loaded successfully",
                });
            } catch {
                toast({
                    title: "Import Failed",
                    description: "Invalid template file",
                    variant: "destructive",
                });
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Insert image
    const handleInsertImage = () => {
        if (!imageUrl) {
            toast({
                title: "Missing URL",
                description: "Please enter an image URL",
                variant: "destructive",
            });
            return;
        }
        const imageHtml = `<img src="${imageUrl}" alt="${imageAlt || 'Image'}" style="max-width: 100%; height: auto; border-radius: 8px;" />`;
        setBody((prev) => prev + "\n" + imageHtml);
        setImageUrl("");
        setImageAlt("");
        setIsImageDialogOpen(false);
        toast({
            title: "Image Inserted",
            description: "Image added to template",
        });
    };

    // Insert link
    const handleInsertLink = () => {
        if (!linkUrl || !linkText) {
            toast({
                title: "Missing Fields",
                description: "Please enter both URL and text",
                variant: "destructive",
            });
            return;
        }
        const linkHtml = `<a href="${linkUrl}" style="color: ${selectedColorPreset.primary}; text-decoration: underline;">${linkText}</a>`;
        setBody((prev) => prev + linkHtml);
        setLinkUrl("");
        setLinkText("");
        setIsLinkDialogOpen(false);
        toast({
            title: "Link Inserted",
            description: "Link added to template",
        });
    };

    // Send test email
    const handleSendTestEmail = () => {
        if (!testEmail) {
            toast({
                title: "Missing Email",
                description: "Please enter an email address",
                variant: "destructive",
            });
            return;
        }
        // Simulate sending test email
        toast({
            title: "Test Email Sent",
            description: `Preview sent to ${testEmail}`,
        });
        setTestEmail("");
        setIsTestEmailDialogOpen(false);
    };

    // Formatting helpers
    const wrapSelection = (tag, style) => {
        const styleAttr = style ? ` style="${style}"` : "";
        setBody((prev) => prev + `<${tag}${styleAttr}>Your text here</${tag}>`);
    };

    const insertFormatting = (type) => {
        switch (type) {
            case "bold":
                wrapSelection("strong");
                break;
            case "italic":
                wrapSelection("em");
                break;
            case "heading":
                wrapSelection("h2", `color: ${selectedColorPreset.primary}; font-size: 20px; margin: 20px 0 10px 0;`);
                break;
            case "paragraph":
                wrapSelection("p", "color: #334155; font-size: 16px; line-height: 1.6; margin: 10px 0;");
                break;
            case "list":
                setBody((prev) => prev + `\n<ul style="color: #334155; margin: 15px 0; padding-left: 20px;">
  <li>List item 1</li>
  <li>List item 2</li>
  <li>List item 3</li>
</ul>`);
                break;
            case "align-left":
                wrapSelection("div", "text-align: left;");
                break;
            case "align-center":
                wrapSelection("div", "text-align: center;");
                break;
            case "align-right":
                wrapSelection("div", "text-align: right;");
                break;
        }
        toast({
            title: "Formatting Applied",
            description: `Added ${type} formatting`,
        });
    };

    const handleResetTemplate = () => {
        setBody(getDefaultTemplate());
        toast({
            title: "Template Reset",
            description: "Restored to default template",
        });
    };

    const handleSave = () => {
        if (!name || !subject || !body) {
            toast({
                title: "Missing Fields",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        const template = {
            id: editingTemplate?.id || `custom-${Date.now()}`,
            name,
            category,
            subject,
            body,
            variables,
        };

        // In a real app, this would save to database
        toast({
            title: "Template Saved",
            description: `"${name}" has been saved successfully`,
        });

        onOpenChange(false);
    };

    const handleCopyHtml = () => {
        navigator.clipboard.writeText(body);
        toast({
            title: "Copied",
            description: "HTML copied to clipboard",
        });
    };

    const getPreviewWidth = () => {
        switch (previewDevice) {
            case "mobile":
                return "375px";
            case "tablet":
                return "768px";
            default:
                return "100%";
        }
    };

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-4xl p-0 flex flex-col">
                <SheetHeader className="px-6 py-4 border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <SheetTitle className="font-display flex items-center gap-2">
                                <FileCode className="w-5 h-5 text-primary" />
                                {editingTemplate ? "Edit Template" : "Create Template"}
                            </SheetTitle>
                            <SheetDescription>
                                Design your email template with live preview
                            </SheetDescription>
                        </div>
                        <div className="flex items-center gap-1">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImport}
                                accept=".json"
                                className="hidden"
                            />
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={handleUndo}
                                            disabled={!canUndo}
                                        >
                                            <Undo2 className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Undo</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={handleRedo}
                                            disabled={!canRedo}
                                        >
                                            <Redo2 className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Redo</TooltipContent>
                                </Tooltip>
                                <Separator orientation="vertical" className="h-6 mx-1" />
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Import Template</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={handleExport}
                                        >
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Export Template</TooltipContent>
                                </Tooltip>
                                <Separator orientation="vertical" className="h-6 mx-1" />
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setIsTestEmailDialogOpen(true)}
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Send Test Email</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={handleResetTemplate}
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Reset Template</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel - Editor */}
                    <div className="w-1/2 border-r flex flex-col overflow-hidden">
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)} className="flex-1 flex flex-col">
                            <div className="px-4 pt-4 border-b">
                                <TabsList className="grid grid-cols-2 w-full">
                                    <TabsTrigger value="edit" className="gap-2">
                                        <Code className="w-4 h-4" />
                                        Editor
                                    </TabsTrigger>
                                    <TabsTrigger value="preview" className="gap-2">
                                        <Eye className="w-4 h-4" />
                                        Code Preview
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <ScrollArea className="flex-1">
                                <TabsContent value="edit" className="m-0 p-4 space-y-4">
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Template Name *</Label>
                                            <Input
                                                id="name"
                                                placeholder="e.g., Welcome Email"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <Select value={category} onValueChange={(v) => setCategory(v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="appointment">📅 Appointment</SelectItem>
                                                    <SelectItem value="billing">💳 Billing</SelectItem>
                                                    <SelectItem value="general">📧 General</SelectItem>
                                                    <SelectItem value="lab">🔬 Lab Results</SelectItem>
                                                    <SelectItem value="emergency">🚨 Emergency</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject Line *</Label>
                                        <Input
                                            id="subject"
                                            placeholder="e.g., Welcome to {{hospitalName}}"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                        />
                                    </div>

                                    <Separator />

                                    {/* Variables */}
                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2">
                                            <Variable className="w-4 h-4 text-primary" />
                                            Template Variables
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                            {variables.map((variable) => (
                                                <Badge
                                                    key={variable}
                                                    variant="secondary"
                                                    className="pl-2 pr-1 py-1 gap-1 cursor-pointer hover:bg-primary/10"
                                                    onClick={() => insertVariable(variable)}
                                                >
                                                    <span className="font-mono text-xs">{`{{${variable}}}`}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-4 w-4 hover:bg-destructive/20 rounded-full"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveVariable(variable);
                                                        }}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Add variable (e.g., patientName)"
                                                value={newVariable}
                                                onChange={(e) => setNewVariable(e.target.value.replace(/\s/g, ""))}
                                                onKeyDown={(e) => e.key === "Enter" && handleAddVariable()}
                                                className="flex-1"
                                            />
                                            <Button onClick={handleAddVariable} size="icon" variant="outline">
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Click a variable to insert it into the template
                                        </p>
                                    </div>

                                    <Separator />

                                    {/* Color Presets */}
                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2">
                                            <Palette className="w-4 h-4 text-primary" />
                                            Color Scheme
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                            {colorPresets.map((preset) => (
                                                <button
                                                    key={preset.name}
                                                    onClick={() => applyColorPreset(preset)}
                                                    className={cn(
                                                        "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                                                        selectedColorPreset.name === preset.name
                                                            ? "border-primary bg-primary/5"
                                                            : "border-border hover:border-primary/50"
                                                    )}
                                                >
                                                    <div
                                                        className="w-4 h-4 rounded-full"
                                                        style={{ backgroundColor: preset.primary }}
                                                    />
                                                    <span className="text-xs font-medium">{preset.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Snippets */}
                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-primary" />
                                            Quick Snippets
                                        </Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {templateSnippets.map((snippet) => (
                                                <Button
                                                    key={snippet.name}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => insertSnippet(snippet.code)}
                                                    className="justify-start text-xs gap-2"
                                                >
                                                    <span>{snippet.icon}</span>
                                                    {snippet.name}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Formatting Toolbar */}
                                    <div className="space-y-3">
                                        <Label className="flex items-center gap-2">
                                            <Type className="w-4 h-4 text-primary" />
                                            Formatting Tools
                                        </Label>
                                        <div className="flex flex-wrap gap-1">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => insertFormatting("bold")}>
                                                            <Bold className="w-4 h-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Bold Text</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => insertFormatting("italic")}>
                                                            <Italic className="w-4 h-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Italic Text</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => insertFormatting("heading")}>
                                                            <Type className="w-4 h-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Heading</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => insertFormatting("list")}>
                                                            <List className="w-4 h-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Bullet List</TooltipContent>
                                                </Tooltip>
                                                <Separator orientation="vertical" className="h-8 mx-1" />
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => insertFormatting("align-left")}>
                                                            <AlignLeft className="w-4 h-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Align Left</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => insertFormatting("align-center")}>
                                                            <AlignCenter className="w-4 h-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Align Center</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => insertFormatting("align-right")}>
                                                            <AlignRight className="w-4 h-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Align Right</TooltipContent>
                                                </Tooltip>
                                                <Separator orientation="vertical" className="h-8 mx-1" />
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setIsImageDialogOpen(true)}>
                                                            <Image className="w-4 h-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Insert Image</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setIsLinkDialogOpen(true)}>
                                                            <Link className="w-4 h-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Insert Link</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* HTML Editor */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label>HTML Content *</Label>
                                            <Button variant="ghost" size="sm" onClick={handleCopyHtml} className="h-7 text-xs">
                                                <Copy className="w-3 h-3 mr-1" />
                                                Copy
                                            </Button>
                                        </div>
                                        <Textarea
                                            value={body}
                                            onChange={(e) => setBody(e.target.value)}
                                            className="min-h-[300px] font-mono text-xs"
                                            placeholder="Enter your HTML template..."
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="preview" className="m-0 p-4">
                                    <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-xs">
                                        <code>{body}</code>
                                    </pre>
                                </TabsContent>
                            </ScrollArea>
                        </Tabs>
                    </div>

                    {/* Right Panel - Live Preview */}
                    <div className="w-1/2 flex flex-col overflow-hidden bg-muted/30">
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                            <Label className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-primary" />
                                Live Preview
                            </Label>
                            <div className="flex gap-1">
                                <Button
                                    variant={previewDevice === "desktop" ? "default" : "ghost"}
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setPreviewDevice("desktop")}
                                >
                                    <Monitor className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={previewDevice === "tablet" ? "default" : "ghost"}
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setPreviewDevice("tablet")}
                                >
                                    <Tablet className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={previewDevice === "mobile" ? "default" : "ghost"}
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setPreviewDevice("mobile")}
                                >
                                    <Smartphone className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <ScrollArea className="flex-1 p-4">
                            <div
                                className="mx-auto bg-card border rounded-lg overflow-hidden shadow-sm transition-all"
                                style={{ maxWidth: getPreviewWidth() }}
                            >
                                {subject && (
                                    <div className="px-4 py-3 border-b bg-muted/50">
                                        <p className="text-xs text-muted-foreground">Subject:</p>
                                        <p className="text-sm font-medium truncate">{subject}</p>
                                    </div>
                                )}
                                <div
                                    dangerouslySetInnerHTML={{ __html: body }}
                                />
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-end gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="gap-2 gradient-primary text-primary-foreground hover:opacity-90"
                    >
                        <Save className="w-4 h-4" />
                        Save Template
                    </Button>
                </div>
            </SheetContent>

            {/* Image Dialog */}
            <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Image className="w-5 h-5 text-primary" />
                            Insert Image
                        </DialogTitle>
                        <DialogDescription>
                            Add an image to your email template
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">Image URL</Label>
                            <Input
                                id="imageUrl"
                                placeholder="https://example.com/image.png"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="imageAlt">Alt Text (optional)</Label>
                            <Input
                                id="imageAlt"
                                placeholder="Describe the image"
                                value={imageAlt}
                                onChange={(e) => setImageAlt(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsImageDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleInsertImage}>
                            <Image className="w-4 h-4 mr-2" />
                            Insert
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Link Dialog */}
            <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Link className="w-5 h-5 text-primary" />
                            Insert Link
                        </DialogTitle>
                        <DialogDescription>
                            Add a hyperlink to your email template
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="linkUrl">URL</Label>
                            <Input
                                id="linkUrl"
                                placeholder="https://example.com"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="linkText">Link Text</Label>
                            <Input
                                id="linkText"
                                placeholder="Click here"
                                value={linkText}
                                onChange={(e) => setLinkText(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleInsertLink}>
                            <Link className="w-4 h-4 mr-2" />
                            Insert
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Test Email Dialog */}
            <Dialog open={isTestEmailDialogOpen} onOpenChange={setIsTestEmailDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Send className="w-5 h-5 text-primary" />
                            Send Test Email
                        </DialogTitle>
                        <DialogDescription>
                            Send a preview of this template to an email address
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="testEmail">Email Address</Label>
                            <Input
                                id="testEmail"
                                type="email"
                                placeholder="test@example.com"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                            />
                        </div>
                        {subject && (
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">Subject Preview:</p>
                                <p className="text-sm font-medium">{subject}</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTestEmailDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSendTestEmail}>
                            <Send className="w-4 h-4 mr-2" />
                            Send Test
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Sheet>
    );
};
