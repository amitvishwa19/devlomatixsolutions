import { useState } from "react";
import { EmailStats } from "./EmailStats";
import { QuickActions } from "./QuickActions";
import { TemplateFilters } from "./TemplateFilters";
import { TemplateCard } from "./TemplateCard";
import { TemplatePreviewDialog } from "./TemplatePreviewDialog";
import { EmailComposerSheet } from "./EmailComposerSheet";
import { TemplateEditor } from "./TemplateEditor";
import { DraftsSheet } from "./DraftsSheet";
import { SentItemsSheet } from "./SentItemsSheet";
import { AITemplateDialog } from "./AITemplateDialog";
import { emailTemplates } from "../../_lib/emailTemplates";


const MailerIntractive = () => {
    const [activeFilter, setActiveFilter] = useState("all");
    const [previewTemplate, setPreviewTemplate] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isComposerOpen, setIsComposerOpen] = useState(false);
    const [composerTemplate, setComposerTemplate] = useState(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [isDraftsOpen, setIsDraftsOpen] = useState(false);
    const [isSentOpen, setIsSentOpen] = useState(false);
    const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
    const [aiGeneratedTemplate, setAiGeneratedTemplate] = useState(null);

    const filteredTemplates = emailTemplates.filter(
        (template) => activeFilter === "all" || template.category === activeFilter
    );

    const handleSelectTemplate = (template) => {
        setComposerTemplate(template);
        setIsComposerOpen(true);
    };

    const handlePreviewTemplate = (template) => {
        setPreviewTemplate(template);
        setIsPreviewOpen(true);
    };

    const handleOpenComposer = () => {
        setComposerTemplate(null);
        setIsComposerOpen(true);
    };

    const handleOpenTemplateEditor = () => {
        setEditingTemplate(null);
        setIsEditorOpen(true);
    };

    const handleAITemplateGenerated = (template) => {
        setAiGeneratedTemplate(template);
        setIsEditorOpen(true);
    };

    return (
        <div className="min-h-screen ">
            <div className="container max-w-7xl">
                <EmailStats />

                <QuickActions
                    onCompose={handleOpenComposer}
                    onCreateTemplate={handleOpenTemplateEditor}
                    onViewDrafts={() => setIsDraftsOpen(true)}
                    onViewSent={() => setIsSentOpen(true)}
                    onOpenAI={() => setIsAIDialogOpen(true)}
                />

                <TemplateFilters
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                />

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((template, index) => (
                        <div
                            key={template.id}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <TemplateCard
                                template={template}
                                onSelect={handleSelectTemplate}
                                onPreview={handlePreviewTemplate}
                            />
                        </div>
                    ))}
                </div>

                {filteredTemplates.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No templates found for this category.
                    </div>
                )}

                <TemplatePreviewDialog
                    template={previewTemplate}
                    open={isPreviewOpen}
                    onOpenChange={setIsPreviewOpen}
                />

                <EmailComposerSheet
                    open={isComposerOpen}
                    onOpenChange={setIsComposerOpen}
                    initialTemplate={composerTemplate}
                />

                <TemplateEditor
                    open={isEditorOpen}
                    onOpenChange={setIsEditorOpen}
                    editingTemplate={editingTemplate}
                />

                <DraftsSheet
                    open={isDraftsOpen}
                    onOpenChange={setIsDraftsOpen}
                />

                <SentItemsSheet
                    open={isSentOpen}
                    onOpenChange={setIsSentOpen}
                />

                <AITemplateDialog
                    open={isAIDialogOpen}
                    onOpenChange={setIsAIDialogOpen}
                    onTemplateGenerated={handleAITemplateGenerated}
                />
            </div>
        </div>
    );
};

export default MailerIntractive;
