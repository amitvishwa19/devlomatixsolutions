import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2, Wand2, FileText, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIEmail } from "../../_hooks/useAIEmail";

const categories = [
    { value: "appointment", label: "Appointment" },
    { value: "billing", label: "Billing" },
    { value: "general", label: "General" },
    { value: "lab", label: "Lab Results" },
    { value: "emergency", label: "Emergency" },
];

const tones = [
    { value: "professional", label: "Professional" },
    { value: "friendly", label: "Friendly" },
    { value: "formal", label: "Formal" },
    { value: "empathetic", label: "Empathetic" },
];

export function AITemplateDialog({
    open,
    onOpenChange,
    onTemplateGenerated,
    onContentImproved,
    onSubjectSelected,
    currentContent,
    currentSubject,
}) {
    const [prompt, setPrompt] = useState("");
    const [category, setCategory] = useState("general");
    const [tone, setTone] = useState("professional");
    const [generatedSubjects, setGeneratedSubjects] = useState([]);
    const [activeTab, setActiveTab] = useState("generate");

    const { isLoading, generateTemplate, improveContent, generateSubjectLines } = useAIEmail();

    const handleGenerateTemplate = async () => {
        if (!prompt.trim()) return;

        const result = await generateTemplate({ prompt, category });
        if (result) {
            onTemplateGenerated(result);
            onOpenChange(false);
            setPrompt("");
        }
    };

    const handleImproveContent = async () => {
        if (!currentContent) return;

        const result = await improveContent({ content: currentContent, tone });
        if (result && onContentImproved) {
            onContentImproved(result);
            onOpenChange(false);
        }
    };

    const handleGenerateSubjects = async () => {
        const result = await generateSubjectLines({
            subject: currentSubject || "",
            content: currentContent,
        });
        if (result) {
            setGeneratedSubjects(result);
        }
    };

    const handleSelectSubject = (subject) => {
        if (onSubjectSelected) {
            onSubjectSelected(subject);
            onOpenChange(false);
            setGeneratedSubjects([]);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        AI Email Assistant
                    </DialogTitle>
                    <DialogDescription>
                        Use AI to generate templates, improve content, or optimize subject lines
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="generate" className="flex items-center gap-1">
                            <Wand2 className="h-4 w-4" />
                            Generate
                        </TabsTrigger>
                        <TabsTrigger value="improve" className="flex items-center gap-1" disabled={!currentContent}>
                            <FileText className="h-4 w-4" />
                            Improve
                        </TabsTrigger>
                        <TabsTrigger value="subjects" className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            Subjects
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="generate" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="prompt">Describe the email template you need</Label>
                            <Textarea
                                id="prompt"
                                placeholder="E.g., Post-surgery follow-up email with care instructions and next appointment reminder"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={handleGenerateTemplate}
                            disabled={isLoading || !prompt.trim()}
                            className="w-full"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Generate Template
                                </>
                            )}
                        </Button>
                    </TabsContent>

                    <TabsContent value="improve" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Current content preview</Label>
                            <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground max-h-32 overflow-auto">
                                {currentContent ? (
                                    <span className="line-clamp-4">{currentContent.replace(/<[^>]*>/g, ' ').substring(0, 300)}...</span>
                                ) : (
                                    "No content to improve. Add some content to your template first."
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tone">Writing Tone</Label>
                            <Select value={tone} onValueChange={(v) => setTone(v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select tone" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tones.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>
                                            {t.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={handleImproveContent}
                            disabled={isLoading || !currentContent}
                            className="w-full"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Improving...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="mr-2 h-4 w-4" />
                                    Improve Content
                                </>
                            )}
                        </Button>
                    </TabsContent>

                    <TabsContent value="subjects" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Current subject line</Label>
                            <Input value={currentSubject || ""} disabled className="bg-muted" />
                        </div>

                        <Button
                            onClick={handleGenerateSubjects}
                            disabled={isLoading}
                            className="w-full"
                            variant="outline"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Generate Subject Line Variations
                                </>
                            )}
                        </Button>

                        {generatedSubjects.length > 0 && (
                            <ScrollArea className="h-48">
                                <div className="space-y-2">
                                    <Label>Click to select a subject line</Label>
                                    {generatedSubjects.map((subject, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSelectSubject(subject)}
                                            className="w-full text-left p-3 rounded-md border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                                        >
                                            <div className="flex items-start gap-2">
                                                <Badge variant="secondary" className="shrink-0">
                                                    {index + 1}
                                                </Badge>
                                                <span className="text-sm">{subject}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
