'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';



const TemplatePreviewModal = ({ isOpen, onClose, template }) => {
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isOpen && isHydrated) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, isHydrated]);

    const handleClose = () => {
        if (isHydrated) {
            onClose();
        }
    };

    const renderPreviewContent = (content) => {
        const sampleData = {
            '{{patient_name}}': 'John Doe',
            '{{doctor_name}}': 'Dr. Sarah Johnson',
            '{{appointment_date}}': '01/15/2025',
            '{{appointment_time}}': '10:30 AM',
            '{{department}}': 'Cardiology',
            '{{hospital_name}}': 'City General Hospital',
            '{{test_name}}': 'Blood Test',
            '{{bill_amount}}': '$250.00',
        };

        let previewContent = content;
        Object.entries(sampleData).forEach(([variable, value]) => {
            previewContent = previewContent.replace(new RegExp(variable, 'g'), value);
        });

        return previewContent;
    };

    if (!isOpen || !template) return null;

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={handleClose}
            />
            <div className="relative w-full max-w-3xl bg-card rounded-lg shadow-elevation-xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">Template Preview</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Preview with sample data
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-md hover:bg-muted transition-smooth"
                        aria-label="Close preview"
                    >
                        <Icon name="XMarkIcon" size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="bg-background rounded-lg border border-border p-6 space-y-4">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">SUBJECT</p>
                            <p className="text-base font-semibold text-foreground">
                                {renderPreviewContent(template.subject)}
                            </p>
                        </div>

                        <div className="border-t border-border pt-4">
                            <p className="text-xs font-medium text-muted-foreground mb-3">MESSAGE</p>
                            <div className="prose prose-sm max-w-none">
                                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                                    {renderPreviewContent(template.content)}
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-border pt-4">
                            <p className="text-xs text-muted-foreground">
                                This is a preview with sample data. Actual emails will use real patient and appointment information.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
                    <button
                        onClick={handleClose}
                        className="px-6 py-2 rounded-md bg-muted text-foreground hover:bg-muted/80 transition-smooth"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TemplatePreviewModal;