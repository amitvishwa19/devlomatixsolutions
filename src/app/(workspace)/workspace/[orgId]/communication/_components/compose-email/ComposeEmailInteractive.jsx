'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import TemplateSelector from './TemplateSelector';
import RichTextEditor from './RichTextEditor';
import RecipientSelector from './RecipientSelector';
import AttachmentManager from './AttachmentManager';
import ScheduleControls from './ScheduleControls';
import EmailPreview from './EmailPreview';





const mockTemplates = [
    {
        id: '1',
        name: 'Appointment Reminder',
        category: 'Appointments',
        subject: 'Reminder: Your appointment with {{doctor_name}} on {{appointment_date}}',
        content: `Dear {{patient_name}},\n\nThis is a friendly reminder about your upcoming appointment:\n\nDoctor: {{doctor_name}}\nDate: {{appointment_date}}\nTime: {{appointment_time}}\nLocation: {{location}}\n\nPlease arrive 15 minutes early to complete any necessary paperwork.\n\nIf you need to reschedule, please contact us at least 24 hours in advance.\n\nBest regards,\n{{hospital_name}}`,
        variables: ['patient_name', 'doctor_name', 'appointment_date', 'appointment_time', 'location', 'hospital_name'],
    },
    {
        id: '2',
        name: 'Test Results Available',
        category: 'Medical Records',
        subject: 'Your test results are now available',
        content: `Dear {{patient_name}},\n\nYour recent test results from {{test_date}} are now available for review.\n\nYou can access your results through our patient portal or schedule an appointment with {{doctor_name}} to discuss them.\n\nIf you have any questions, please don't hesitate to contact us.\n\nBest regards,\n{{hospital_name}}`,
        variables: ['patient_name', 'test_date', 'doctor_name', 'hospital_name'],
    },
    {
        id: '3',
        name: 'Billing Statement',
        category: 'Billing',
        subject: 'Your billing statement for {{service_date}}',
        content: `Dear {{patient_name}},\n\nYour billing statement for services rendered on {{service_date}} is now available.\n\nAmount Due: {{amount_due}}\nDue Date: {{due_date}}\n\nYou can make a payment online through our patient portal or contact our billing department for payment arrangements.\n\nThank you,\n{{hospital_name}}`,
        variables: ['patient_name', 'service_date', 'amount_due', 'due_date', 'hospital_name'],
    },
    {
        id: '4',
        name: 'General Announcement',
        category: 'Announcements',
        subject: '{{announcement_title}}',
        content: `Dear {{recipient_name}},\n\n{{announcement_content}}\n\nFor more information, please visit our website or contact us.\n\nBest regards,\n{{hospital_name}}`,
        variables: ['recipient_name', 'announcement_title', 'announcement_content', 'hospital_name'],
    },
];

const mockRecipients = [
    { id: '1', name: 'John Smith', email: 'john.smith@email.com', type: 'patient', department: 'Cardiology' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah.j@email.com', type: 'patient', department: 'Orthopedics' },
    { id: '3', name: 'Dr. Michael Chen', email: 'dr.chen@hospital.com', type: 'doctor', department: 'Emergency' },
    { id: '4', name: 'Dr. Emily Rodriguez', email: 'dr.rodriguez@hospital.com', type: 'doctor', department: 'Pediatrics' },
    { id: '5', name: 'Lisa Anderson', email: 'l.anderson@hospital.com', type: 'staff', department: 'Administration' },
    { id: '6', name: 'Robert Williams', email: 'robert.w@email.com', type: 'patient', department: 'Neurology' },
    { id: '7', name: 'Dr. James Taylor', email: 'dr.taylor@hospital.com', type: 'doctor', department: 'Surgery' },
    { id: '8', name: 'Maria Garcia', email: 'm.garcia@hospital.com', type: 'staff', department: 'Nursing' },
];

const ComposeEmailInteractive = () => {
    const [isHydrated, setIsHydrated] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [selectedRecipients, setSelectedRecipients] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [scheduleType, setScheduleType] = useState('immediate');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        if (template) {
            setSubject(template.subject);
            setContent(template.content);
        } else {
            setSubject('');
            setContent('');
        }
    };

    const handleSaveDraft = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert('Draft saved successfully!');
        }, 1000);
    };

    const handleSendEmail = () => {
        if (!subject.trim()) {
            alert('Please enter an email subject');
            return;
        }
        if (!content.trim()) {
            alert('Please enter email content');
            return;
        }
        if (selectedRecipients.length === 0) {
            alert('Please select at least one recipient');
            return;
        }
        if (scheduleType === 'scheduled' && (!scheduledDate || !scheduledTime)) {
            alert('Please select a date and time for scheduled delivery');
            return;
        }

        setIsSending(true);
        setTimeout(() => {
            setIsSending(false);
            alert(
                scheduleType === 'immediate'
                    ? `Email sent successfully to ${selectedRecipients.length} recipient(s)!`
                    : `Email scheduled successfully for ${new Date(scheduledDate + 'T' + scheduledTime).toLocaleString()}!`
            );
            handleReset();
        }, 2000);
    };

    const handleReset = () => {
        setSelectedTemplate(null);
        setSubject('');
        setContent('');
        setSelectedRecipients([]);
        setAttachments([]);
        setScheduleType('immediate');
        setScheduledDate('');
        setScheduledTime('');
    };

    if (!isHydrated) {
        return (
            <div className="space-y-6">
                <div className="bg-card rounded-lg p-6 shadow-elevation-sm">
                    <div className="animate-pulse space-y-4">
                        <div className="h-10 bg-muted rounded w-1/3" />
                        <div className="h-64 bg-muted rounded" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 shadow-elevation-sm space-y-6">
                <TemplateSelector
                    templates={mockTemplates}
                    selectedTemplate={selectedTemplate}
                    onTemplateSelect={handleTemplateSelect}
                />

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Subject Line
                    </label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Enter email subject..."
                        className="w-full px-4 py-3 bg-card border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                <RichTextEditor
                    content={content}
                    onContentChange={setContent}
                    variables={selectedTemplate?.variables || []}
                    onInsertVariable={() => { }}
                />

                <RecipientSelector
                    recipients={mockRecipients}
                    selectedRecipients={selectedRecipients}
                    onRecipientsChange={setSelectedRecipients}
                />

                <AttachmentManager
                    attachments={attachments}
                    onAttachmentsChange={setAttachments}
                />

                <ScheduleControls
                    scheduleType={scheduleType}
                    scheduledDate={scheduledDate}
                    scheduledTime={scheduledTime}
                    onScheduleTypeChange={setScheduleType}
                    onScheduledDateChange={setScheduledDate}
                    onScheduledTimeChange={setScheduledTime}
                />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card rounded-lg p-6 shadow-elevation-sm">
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={handleSaveDraft}
                        disabled={isSaving}
                        className="flex items-center space-x-2 px-4 py-2.5 bg-muted text-foreground rounded-md text-sm hover:bg-muted/80 transition-smooth disabled:opacity-50"
                    >
                        <Icon name="DocumentIcon" size={18} />
                        <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowPreview(true)}
                        className="flex items-center space-x-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/90 transition-smooth"
                    >
                        <Icon name="EyeIcon" size={18} />
                        <span>Preview</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex items-center space-x-2 px-4 py-2.5 bg-muted text-foreground rounded-md text-sm hover:bg-muted/80 transition-smooth"
                    >
                        <Icon name="ArrowPathIcon" size={18} />
                        <span>Reset</span>
                    </button>
                </div>

                <button
                    type="button"
                    onClick={handleSendEmail}
                    disabled={isSending}
                    className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-smooth disabled:opacity-50"
                >
                    <Icon name={scheduleType === 'immediate' ? 'PaperAirplaneIcon' : 'ClockIcon'} size={18} />
                    <span>
                        {isSending
                            ? 'Processing...'
                            : scheduleType === 'immediate' ? 'Send Email' : 'Schedule Email'}
                    </span>
                </button>
            </div>

            {showPreview && (
                <EmailPreview
                    subject={subject}
                    content={content}
                    recipients={selectedRecipients}
                    attachments={attachments}
                    onClose={() => setShowPreview(false)}
                />
            )}
        </div>
    );
};

export default ComposeEmailInteractive;