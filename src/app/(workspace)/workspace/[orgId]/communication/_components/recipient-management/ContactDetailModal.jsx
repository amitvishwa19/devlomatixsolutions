'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';



const ContactDetailModal = ({
    contact,
    isOpen,
    onClose,
    onEdit,
    communicationHistory = [],
}) => {
    const [isHydrated, setIsHydrated] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const modalRef = useRef(null);

    useState(() => {
        setIsHydrated(true);
    });

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !contact || !isHydrated) {
        return null;
    }

    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-success/10 text-success';
            case 'inactive':
                return 'bg-muted text-muted-foreground';
            case 'unsubscribed':
                return 'bg-error/10 text-error';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    const getHistoryStatusColor = (status) => {
        switch (status) {
            case 'delivered':
                return 'bg-success/10 text-success';
            case 'failed':
                return 'bg-error/10 text-error';
            case 'pending':
                return 'bg-warning/10 text-warning';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div
                ref={modalRef}
                className="bg-card rounded-lg shadow-elevation-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-xl font-semibold text-foreground">Contact Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-md hover:bg-muted transition-smooth"
                        aria-label="Close modal"
                    >
                        <Icon name="XMarkIcon" size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="px-6 py-6">
                        <div className="flex items-start space-x-4 mb-6">
                            <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-xl flex-shrink-0">
                                {contact.avatar ? (
                                    <AppImage
                                        src={contact.avatar}
                                        alt={`Profile photo of ${contact.name}`}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    getInitials(contact.name)
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-2xl font-semibold text-foreground mb-1">
                                    {contact.name}
                                </h3>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                        {contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
                                    </span>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                            contact.status
                                        )}`}
                                    >
                                        {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                                    </span>
                                </div>
                                <button
                                    onClick={() => onEdit(contact)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-smooth"
                                >
                                    <Icon name="PencilIcon" size={16} />
                                    <span className="text-sm font-medium">Edit Contact</span>
                                </button>
                            </div>
                        </div>

                        <div className="border-b border-border mb-6">
                            <div className="flex space-x-6">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`pb-3 text-sm font-medium transition-smooth ${activeTab === 'details' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    Details
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`pb-3 text-sm font-medium transition-smooth ${activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    Communication History
                                </button>
                            </div>
                        </div>

                        {activeTab === 'details' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs text-muted-foreground font-caption mb-1">
                                            Email Address
                                        </p>
                                        <p className="text-sm text-foreground">{contact.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-caption mb-1">
                                            Phone Number
                                        </p>
                                        <p className="text-sm text-foreground">{contact.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-caption mb-1">
                                            Department
                                        </p>
                                        <p className="text-sm text-foreground">{contact.department}</p>
                                    </div>
                                    {contact.role && (
                                        <div>
                                            <p className="text-xs text-muted-foreground font-caption mb-1">
                                                Role
                                            </p>
                                            <p className="text-sm text-foreground">{contact.role}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs text-muted-foreground font-caption mb-1">
                                            Communication Preference
                                        </p>
                                        <p className="text-sm text-foreground capitalize">
                                            {contact.communicationPreference}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-caption mb-1">
                                            Last Contact
                                        </p>
                                        <p className="text-sm text-foreground">{contact.lastContact}</p>
                                    </div>
                                    {contact.patientId && (
                                        <div>
                                            <p className="text-xs text-muted-foreground font-caption mb-1">
                                                Patient ID
                                            </p>
                                            <p className="text-sm text-foreground">{contact.patientId}</p>
                                        </div>
                                    )}
                                    {contact.employeeId && (
                                        <div>
                                            <p className="text-xs text-muted-foreground font-caption mb-1">
                                                Employee ID
                                            </p>
                                            <p className="text-sm text-foreground">{contact.employeeId}</p>
                                        </div>
                                    )}
                                    {contact.dateOfBirth && (
                                        <div>
                                            <p className="text-xs text-muted-foreground font-caption mb-1">
                                                Date of Birth
                                            </p>
                                            <p className="text-sm text-foreground">{contact.dateOfBirth}</p>
                                        </div>
                                    )}
                                    {contact.emergencyContact && (
                                        <div>
                                            <p className="text-xs text-muted-foreground font-caption mb-1">
                                                Emergency Contact
                                            </p>
                                            <p className="text-sm text-foreground">{contact.emergencyContact}</p>
                                        </div>
                                    )}
                                </div>
                                {contact.address && (
                                    <div>
                                        <p className="text-xs text-muted-foreground font-caption mb-1">
                                            Address
                                        </p>
                                        <p className="text-sm text-foreground">{contact.address}</p>
                                    </div>
                                )}
                                {contact.notes && (
                                    <div>
                                        <p className="text-xs text-muted-foreground font-caption mb-1">
                                            Notes
                                        </p>
                                        <p className="text-sm text-foreground">{contact.notes}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="space-y-3">
                                {communicationHistory.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Icon
                                            name="EnvelopeIcon"
                                            size={48}
                                            className="mx-auto text-muted-foreground mb-3"
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            No communication history available
                                        </p>
                                    </div>
                                ) : (
                                    communicationHistory.map((item) => (
                                        <div
                                            key={item.id}
                                            className="p-4 border border-border rounded-lg hover:border-primary/50 transition-smooth"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center space-x-2">
                                                    <Icon
                                                        name={item.type === 'email' ? 'EnvelopeIcon' : 'ChatBubbleLeftIcon'}
                                                        size={18}
                                                        className="text-primary"
                                                    />
                                                    <span className="text-sm font-medium text-foreground">
                                                        {item.subject}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getHistoryStatusColor(
                                                        item.status
                                                    )}`}
                                                >
                                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{item.date}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-border">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-smooth"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContactDetailModal;