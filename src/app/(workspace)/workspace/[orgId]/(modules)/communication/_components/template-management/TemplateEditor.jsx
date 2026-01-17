'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';



const availableVariables = [
    { name: '{{patient_name}}', placeholder: 'John Doe', description: 'Patient full name' },
    { name: '{{doctor_name}}', placeholder: 'Dr. Sarah Johnson', description: 'Doctor full name' },
    { name: '{{appointment_date}}', placeholder: '01/15/2025', description: 'Appointment date' },
    { name: '{{appointment_time}}', placeholder: '10:30 AM', description: 'Appointment time' },
    { name: '{{department}}', placeholder: 'Cardiology', description: 'Department name' },
    { name: '{{hospital_name}}', placeholder: 'City General Hospital', description: 'Hospital name' },
    { name: '{{test_name}}', placeholder: 'Blood Test', description: 'Test or procedure name' },
    { name: '{{bill_amount}}', placeholder: '$250.00', description: 'Bill amount' },
];

const TemplateEditor = ({ template, onSave, onPreview, onApprove }) => {
    const [isHydrated, setIsHydrated] = useState(false);
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [showVariables, setShowVariables] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (template) {
            setName(template.name);
            setSubject(template.subject);
            setContent(template.content);
        }
    }, [template]);

    const handleInsertVariable = (variable) => {
        if (isHydrated) {
            setContent((prev) => prev + variable);
            setShowVariables(false);
        }
    };

    const handleSave = () => {
        if (isHydrated) {
            onSave({ name, subject, content });
        }
    };

    const handlePreview = () => {
        if (isHydrated) {
            onPreview();
        }
    };

    const handleApprove = () => {
        if (isHydrated && onApprove) {
            onApprove();
        }
    };

    if (!template) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Icon name="DocumentTextIcon" size={64} className="text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                    No Template Selected
                </h3>
                <p className="text-sm text-muted-foreground">
                    Select a template from the list to edit or create a new one
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Edit Template</h2>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handlePreview}
                        className="flex items-center space-x-2 px-4 py-2 rounded-md bg-muted text-foreground hover:bg-muted/80 transition-smooth"
                    >
                        <Icon name="EyeIcon" size={18} />
                        <span className="text-sm font-medium">Preview</span>
                    </button>
                    {template.status === 'pending' && onApprove && (
                        <button
                            onClick={handleApprove}
                            className="flex items-center space-x-2 px-4 py-2 rounded-md bg-success text-success-foreground hover:bg-success/90 transition-smooth"
                        >
                            <Icon name="CheckCircleIcon" size={18} />
                            <span className="text-sm font-medium">Approve</span>
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        className="flex items-center space-x-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth"
                    >
                        <Icon name="CheckIcon" size={18} />
                        <span className="text-sm font-medium">Save</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Template Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => isHydrated && setName(e.target.value)}
                        className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Enter template name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Email Subject
                    </label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => isHydrated && setSubject(e.target.value)}
                        className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Enter email subject"
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-foreground">
                            Email Content
                        </label>
                        <button
                            onClick={() => isHydrated && setShowVariables(!showVariables)}
                            className="flex items-center space-x-1 text-sm text-primary hover:text-primary/80 transition-smooth"
                        >
                            <Icon name="PlusCircleIcon" size={16} />
                            <span>Insert Variable</span>
                        </button>
                    </div>

                    {showVariables && (
                        <div className="mb-4 p-4 rounded-md bg-muted border border-border">
                            <p className="text-xs font-medium text-foreground mb-3">
                                Available Variables
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {availableVariables.map((variable) => (
                                    <button
                                        key={variable.name}
                                        onClick={() => handleInsertVariable(variable.name)}
                                        className="flex items-start space-x-2 p-2 rounded-md bg-background hover:bg-muted/50 transition-smooth text-left"
                                    >
                                        <Icon name="CodeBracketIcon" size={16} className="text-primary mt-0.5" />
                                        <div>
                                            <p className="text-xs font-medium text-foreground font-mono">
                                                {variable.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {variable.description}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <textarea
                        value={content}
                        onChange={(e) => isHydrated && setContent(e.target.value)}
                        rows={12}
                        className="w-full px-4 py-3 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono text-sm"
                        placeholder="Enter email content with variables..."
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                        Use variables like {'{{'} patient_name {'}}'} to personalize emails
                    </p>
                </div>

                <div className="flex items-center space-x-4 p-4 rounded-md bg-muted/50 border border-border">
                    <Icon name="InformationCircleIcon" size={20} className="text-primary" />
                    <div>
                        <p className="text-sm font-medium text-foreground">Template Guidelines</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Ensure all required variables are included. Templates must be approved before use in production emails.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateEditor;