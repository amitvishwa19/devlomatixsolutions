'use client';

import { useState, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';



const RichTextEditor = ({
    content,
    onContentChange,
    variables,
    onInsertVariable,
}) => {
    const [showVariables, setShowVariables] = useState(false);
    const editorRef = useRef < HTMLTextAreaElement > (null);

    const handleInsertVariable = (variable) => {
        const textarea = editorRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent =
            content.substring(0, start) + `{{${variable}}}` + content.substring(end);

        onContentChange(newContent);
        onInsertVariable(variable);
        setShowVariables(false);

        setTimeout(() => {
            textarea.focus();
            const newPosition = start + variable.length + 4;
            textarea.setSelectionRange(newPosition, newPosition);
        }, 0);
    };

    const formatButtons = [
        { icon: 'BoldIcon', label: 'Bold', action: 'bold' },
        { icon: 'ItalicIcon', label: 'Italic', action: 'italic' },
        { icon: 'UnderlineIcon', label: 'Underline', action: 'underline' },
    ];

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-foreground">
                    Email Content
                </label>
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowVariables(!showVariables)}
                            className="flex items-center space-x-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/90 transition-smooth"
                        >
                            <Icon name="PlusIcon" size={16} />
                            <span>Insert Variable</span>
                        </button>

                        {showVariables && (
                            <div className="absolute right-0 mt-2 w-64 bg-popover border border-border rounded-md shadow-elevation-lg z-50 overflow-hidden">
                                <div className="px-3 py-2 border-b border-border">
                                    <p className="text-xs font-medium text-popover-foreground">
                                        Available Variables
                                    </p>
                                </div>
                                <div className="max-h-64 overflow-y-auto py-2">
                                    {variables.map((variable) => (
                                        <button
                                            key={variable}
                                            type="button"
                                            onClick={() => handleInsertVariable(variable)}
                                            className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted transition-smooth"
                                        >
                                            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                                                {`{{${variable}}}`}
                                            </code>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="border border-input rounded-md overflow-hidden bg-card">
                <div className="flex items-center space-x-1 px-3 py-2 border-b border-border bg-muted/50">
                    {formatButtons.map((button) => (
                        <button
                            key={button.action}
                            type="button"
                            title={button.label}
                            className="p-2 rounded hover:bg-muted transition-smooth"
                        >
                            <Icon name={button.icon} size={18} className="text-foreground" />
                        </button>
                    ))}
                </div>

                <textarea
                    //ref={editorRef}
                    value={content}
                    onChange={(e) => onContentChange(e.target.value)}
                    placeholder="Compose your email message here...\n\nYou can use variables like {{patient_name}}, {{appointment_date}}, etc."
                    className="w-full min-h-[300px] px-4 py-3 bg-card text-foreground resize-none focus:outline-none"
                />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{content.length} characters</span>
                <span className="font-caption">
                    Variables will be replaced with actual values when sent
                </span>
            </div>
        </div>
    );
};

export default RichTextEditor;