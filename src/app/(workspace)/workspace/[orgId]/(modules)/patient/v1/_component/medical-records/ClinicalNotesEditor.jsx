'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function ClinicalNotesEditor({ templates, onSaveNote }) {
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [noteType, setNoteType] = useState('general');
    const [isSaving, setIsSaving] = useState(false);

    const handleTemplateSelect = (templateId) => {
        const template = templates?.find(t => t?.id === templateId);
        if (template) {
            setSelectedTemplate(templateId);
            setNoteContent(template?.content);
            setNoteType(template?.type);
        }
    };

    const handleSave = () => {
        if (!noteContent?.trim()) return;

        setIsSaving(true);
        setTimeout(() => {
            onSaveNote({
                content: noteContent,
                type: noteType,
                timestamp: new Date()?.toISOString()
            });
            setNoteContent('');
            setSelectedTemplate('');
            setNoteType('general');
            setIsSaving(false);
        }, 500);
    };

    const handleClear = () => {
        setNoteContent('');
        setSelectedTemplate('');
        setNoteType('general');
    };

    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Clinical Documentation</h2>
                <div className="flex items-center gap-2">
                    <Icon name="DocumentTextIcon" size={20} className="text-primary" />
                </div>
            </div>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Note Template
                        </label>
                        <select
                            value={selectedTemplate}
                            onChange={(e) => handleTemplateSelect(e?.target?.value)}
                            className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">Select a template...</option>
                            {templates?.map(template => (
                                <option key={template?.id} value={template?.id}>
                                    {template?.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Note Type
                        </label>
                        <select
                            value={noteType}
                            onChange={(e) => setNoteType(e?.target?.value)}
                            className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="general">General Note</option>
                            <option value="soap">SOAP Note</option>
                            <option value="progress">Progress Note</option>
                            <option value="consultation">Consultation</option>
                            <option value="procedure">Procedure Note</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Clinical Notes
                    </label>
                    <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e?.target?.value)}
                        placeholder="Enter clinical notes here..."
                        rows={12}
                        className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono text-sm"
                    />
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-text-secondary">
                            {noteContent?.length} characters
                        </span>
                        <span className="text-xs text-text-secondary">
                            Last saved: Never
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={handleClear}
                        disabled={!noteContent?.trim()}
                        className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        Clear
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!noteContent?.trim() || isSaving}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        {isSaving ? (
                            <>
                                <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Icon name="CheckIcon" size={16} />
                                <span>Save Note</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

ClinicalNotesEditor.propTypes = {
    templates: PropTypes?.arrayOf(
        PropTypes?.shape({
            id: PropTypes?.string?.isRequired,
            name: PropTypes?.string?.isRequired,
            type: PropTypes?.string?.isRequired,
            content: PropTypes?.string?.isRequired
        })
    )?.isRequired,
    onSaveNote: PropTypes?.func?.isRequired
};