'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';



const categories = [
    'Appointment Reminders',
    'Test Results',
    'Billing Notifications',
    'General Announcements',
    'Discharge Instructions',
    'Follow-up Care',
];

const CreateTemplateModal = ({ isOpen, onClose, onCreate }) => {
    const [isHydrated, setIsHydrated] = useState(false);
    const [name, setName] = useState('');
    const [category, setCategory] = useState(categories[0]);
    const [description, setDescription] = useState('');

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
            setName('');
            setCategory(categories[0]);
            setDescription('');
            onClose();
        }
    };

    const handleCreate = () => {
        if (isHydrated && name.trim() && description.trim()) {
            onCreate({ name, category, description });
            handleClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={handleClose}
            />
            <div className="relative w-full max-w-lg bg-card rounded-lg shadow-elevation-xl overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-foreground">Create New Template</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-md hover:bg-muted transition-smooth"
                        aria-label="Close modal"
                    >
                        <Icon name="XMarkIcon" size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Template Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => isHydrated && setName(e.target.value)}
                            className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="e.g., Appointment Confirmation"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Category *
                        </label>
                        <select
                            value={category}
                            onChange={(e) => isHydrated && setCategory(e.target.value)}
                            className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Description *
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => isHydrated && setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                            placeholder="Brief description of template purpose"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
                    <button
                        onClick={handleClose}
                        className="px-6 py-2 rounded-md bg-muted text-foreground hover:bg-muted/80 transition-smooth"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={!name.trim() || !description.trim()}
                        className="px-6 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Create Template
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateTemplateModal;