'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import TemplateListItem from './TemplateListItem';
import TemplateEditor from './TemplateEditor';
import TemplatePreviewModal from './TemplatePreviewModal';
import CreateTemplateModal from './CreateTemplateModal';



const mockTemplates = [
    {
        id: '1',
        name: 'Appointment Confirmation',
        subject: 'Your Appointment at {{hospital_name}}',
        content: `Dear {{patient_name}},\n\nThis is to confirm your appointment with {{doctor_name}} on {{appointment_date}} at {{appointment_time}}.\n\nDepartment: {{department}}\nLocation: {{hospital_name}}\n\nPlease arrive 15 minutes early for check-in. If you need to reschedule, please contact us at least 24 hours in advance.\n\nThank you,\n{{hospital_name}} Team`,
        category: 'Appointment Reminders',
        lastModified: '2 hours ago',
        status: 'approved',
        description: 'Standard appointment confirmation email sent after booking',
    },
    {
        id: '2',
        name: 'Test Results Available',
        subject: 'Your {{test_name}} Results are Ready',
        content: `Dear {{patient_name}},\n\nYour {{test_name}} results are now available for review. Please log in to your patient portal or contact your doctor {{doctor_name}} to discuss the results.\n\nIf you have any questions, please don't hesitate to reach out to our {{department}} department.\n\nBest regards,\n{{hospital_name}}`,
        category: 'Test Results',
        lastModified: '1 day ago',
        status: 'approved',
        description: 'Notification when lab or test results become available',
    },
    {
        id: '3',
        name: 'Payment Reminder',
        subject: 'Payment Due for Recent Visit',
        content: `Dear {{patient_name}},\n\nThis is a friendly reminder that you have an outstanding balance of {{bill_amount}} for your recent visit to {{department}}.\n\nPlease visit our billing portal or contact our billing department to make a payment.\n\nThank you for your prompt attention to this matter.\n\n{{hospital_name}} Billing Department`,
        category: 'Billing Notifications',
        lastModified: '3 days ago',
        status: 'pending',
        description: 'Reminder for outstanding patient bills',
    },
    {
        id: '4',
        name: 'Discharge Instructions',
        subject: 'Your Discharge Instructions from {{hospital_name}}',
        content: `Dear {{patient_name}},\n\nThank you for choosing {{hospital_name}} for your care. Please find your discharge instructions below:\n\n1. Follow-up appointment with {{doctor_name}} on {{appointment_date}}\n2. Take prescribed medications as directed\n3. Rest and avoid strenuous activities\n4. Contact us immediately if you experience any complications\n\nFor questions, please call our {{department}} at any time.\n\nWishing you a speedy recovery,\n{{hospital_name}}`,
        category: 'Discharge Instructions',
        lastModified: '5 days ago',
        status: 'approved',
        description: 'Post-discharge care instructions and follow-up information',
    },
    {
        id: '5',
        name: 'Annual Health Checkup',
        subject: 'Time for Your Annual Health Checkup',
        content: `Dear {{patient_name}},\n\nIt's time for your annual health checkup! Regular checkups are important for maintaining good health and catching potential issues early.\n\nPlease contact our scheduling department to book an appointment with {{doctor_name}} at your earliest convenience.\n\nStay healthy,\n{{hospital_name}} Preventive Care Team`,
        category: 'General Announcements',
        lastModified: '1 week ago',
        status: 'draft',
        description: 'Annual checkup reminder for preventive care',
    },
];

const categories = [
    'All Categories',
    'Appointment Reminders',
    'Test Results',
    'Billing Notifications',
    'General Announcements',
    'Discharge Instructions',
    'Follow-up Care',
];

const TemplateManagementInteractive = () => {
    const [isHydrated, setIsHydrated] = useState(false);
    const [templates, setTemplates] = useState(mockTemplates);
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showPreview, setShowPreview] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showMobileEditor, setShowMobileEditor] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || null;

    const filteredTemplates = templates.filter((template) => {
        const matchesSearch =
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
            selectedCategory === 'All Categories' || template.category === selectedCategory;
        const matchesStatus =
            selectedStatus === 'all' || template.status === selectedStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const handleSelectTemplate = (id) => {
        if (isHydrated) {
            setSelectedTemplateId(id);
            setShowMobileEditor(true);
        }
    };

    const handleSaveTemplate = (data) => {
        if (isHydrated && selectedTemplateId) {
            setTemplates((prev) =>
                prev.map((t) =>
                    t.id === selectedTemplateId
                        ? { ...t, ...data, lastModified: 'Just now' }
                        : t
                )
            );
        }
    };

    const handlePreview = () => {
        if (isHydrated) {
            setShowPreview(true);
        }
    };

    const handleApprove = () => {
        if (isHydrated && selectedTemplateId) {
            setTemplates((prev) =>
                prev.map((t) =>
                    t.id === selectedTemplateId ? { ...t, status: 'approved' } : t
                )
            );
        }
    };

    const handleCreateTemplate = (data) => {
        if (isHydrated) {
            const newTemplate = {
                id: Date.now().toString(),
                name: data.name,
                subject: '',
                content: '',
                category: data.category,
                lastModified: 'Just now',
                status: 'draft',
                description: data.description,
            };
            setTemplates((prev) => [newTemplate, ...prev]);
            setSelectedTemplateId(newTemplate.id);
        }
    };

    const statusCounts = {
        all: templates.length,
        approved: templates.filter((t) => t.status === 'approved').length,
        pending: templates.filter((t) => t.status === 'pending').length,
        draft: templates.filter((t) => t.status === 'draft').length,
    };

    return (
        <>
            <div className="flex flex-col lg:flex-row h-full gap-6">
                <div
                    className={`w-full lg:w-96 flex-shrink-0 ${showMobileEditor ? 'hidden lg:flex' : 'flex'
                        } flex-col`}
                >
                    <div className="bg-card rounded-lg shadow-elevation-md p-4 mb-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-foreground">Templates</h2>
                            <button
                                onClick={() => isHydrated && setShowCreateModal(true)}
                                className="flex items-center space-x-2 px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth"
                            >
                                <Icon name="PlusIcon" size={18} />
                                <span className="text-sm font-medium">New</span>
                            </button>
                        </div>

                        <div className="relative mb-4">
                            <Icon
                                name="MagnifyingGlassIcon"
                                size={20}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => isHydrated && setSearchQuery(e.target.value)}
                                placeholder="Search templates..."
                                className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <div className="space-y-2 mb-4">
                            <select
                                value={selectedCategory}
                                onChange={(e) => isHydrated && setSelectedCategory(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center space-x-2 mb-4 overflow-x-auto pb-2">
                            {(['all', 'approved', 'pending', 'draft']).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => isHydrated && setSelectedStatus(status)}
                                    className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-smooth ${selectedStatus === status
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                        }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)} (
                                    {statusCounts[status]})
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {filteredTemplates.length === 0 ? (
                            <div className="text-center py-8">
                                <Icon
                                    name="DocumentTextIcon"
                                    size={48}
                                    className="mx-auto text-muted-foreground mb-2"
                                />
                                <p className="text-sm text-muted-foreground">No templates found</p>
                            </div>
                        ) : (
                            filteredTemplates.map((template) => (
                                <TemplateListItem
                                    key={template.id}
                                    template={template}
                                    isSelected={template.id === selectedTemplateId}
                                    onSelect={handleSelectTemplate}
                                />
                            ))
                        )}
                    </div>
                </div>

                <div
                    className={`flex-1 bg-card rounded-lg shadow-elevation-md overflow-hidden ${!showMobileEditor ? 'hidden lg:flex' : 'flex'
                        } flex-col`}
                >
                    {showMobileEditor && (
                        <div className="lg:hidden flex items-center space-x-2 p-4 border-b border-border">
                            <button
                                onClick={() => isHydrated && setShowMobileEditor(false)}
                                className="p-2 rounded-md hover:bg-muted transition-smooth"
                            >
                                <Icon name="ChevronLeftIcon" size={24} />
                            </button>
                            <h2 className="text-lg font-semibold text-foreground">Edit Template</h2>
                        </div>
                    )}
                    <TemplateEditor
                        template={selectedTemplate}
                        onSave={handleSaveTemplate}
                        onPreview={handlePreview}
                        onApprove={handleApprove}
                    />
                </div>
            </div>

            <TemplatePreviewModal
                isOpen={showPreview}
                onClose={() => isHydrated && setShowPreview(false)}
                template={selectedTemplate}
            />

            <CreateTemplateModal
                isOpen={showCreateModal}
                onClose={() => isHydrated && setShowCreateModal(false)}
                onCreate={handleCreateTemplate}
            />
        </>
    );
};

export default TemplateManagementInteractive;