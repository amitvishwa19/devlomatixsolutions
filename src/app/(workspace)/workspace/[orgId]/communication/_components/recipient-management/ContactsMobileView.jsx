'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';



const ContactsMobileView = ({
    contacts,
    selectedContacts,
    onSelectContact,
    onViewContact,
    onEditContact,
    searchQuery,
}) => {
    const [isHydrated, setIsHydrated] = useState(false);
    const [expandedContact, setExpandedContact] = useState(null);

    useState(() => {
        setIsHydrated(true);
    });

    const filteredContacts = contacts.filter(
        (contact) =>
            !searchQuery ||
            contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    const getTypeColor = (type) => {
        switch (type) {
            case 'patient':
                return 'bg-primary/10 text-primary';
            case 'doctor':
                return 'bg-accent/10 text-accent';
            case 'staff':
                return 'bg-secondary/10 text-secondary';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const toggleExpand = (id) => {
        setExpandedContact(expandedContact === id ? null : id);
    };

    if (!isHydrated) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card rounded-lg shadow-elevation-sm p-4">
                        <div className="flex items-start space-x-3">
                            <div className="w-4 h-4 bg-muted rounded animate-pulse mt-1" />
                            <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
                            <div className="flex-1 space-y-2">
                                <div className="w-32 h-4 bg-muted rounded animate-pulse" />
                                <div className="w-40 h-3 bg-muted rounded animate-pulse" />
                                <div className="flex space-x-2">
                                    <div className="w-16 h-6 bg-muted rounded animate-pulse" />
                                    <div className="w-16 h-6 bg-muted rounded animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {filteredContacts.length === 0 ? (
                <div className="bg-card rounded-lg shadow-elevation-sm p-8 text-center">
                    <Icon name="UserGroupIcon" size={48} className="mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                        {searchQuery ? 'No contacts found matching your search' : 'No contacts available'}
                    </p>
                </div>
            ) : (
                filteredContacts.map((contact) => (
                    <div
                        key={contact.id}
                        className="bg-card rounded-lg shadow-elevation-sm overflow-hidden"
                    >
                        <div className="p-4">
                            <div className="flex items-start space-x-3">
                                <input
                                    type="checkbox"
                                    checked={selectedContacts.includes(contact.id)}
                                    onChange={() => onSelectContact(contact.id)}
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-3 focus:ring-ring focus:ring-offset-3 mt-1"
                                    aria-label={`Select ${contact.name}`}
                                />
                                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium text-sm flex-shrink-0">
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
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {contact.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {contact.email}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => toggleExpand(contact.id)}
                                            className="p-1 rounded-md hover:bg-muted transition-smooth ml-2"
                                            aria-label={expandedContact === contact.id ? 'Collapse details' : 'Expand details'}
                                        >
                                            <Icon
                                                name={expandedContact === contact.id ? 'ChevronUpIcon' : 'ChevronDownIcon'}
                                                size={20}
                                                className="text-muted-foreground"
                                            />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                                                contact.type
                                            )}`}
                                        >
                                            {contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
                                        </span>
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                contact.status
                                            )}`}
                                        >
                                            {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {expandedContact === contact.id && (
                                <div className="mt-4 pt-4 border-t border-border space-y-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground font-caption">Phone</p>
                                        <p className="text-sm text-foreground">{contact.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-caption">Department</p>
                                        <p className="text-sm text-foreground">{contact.department}</p>
                                        {contact.role && (
                                            <p className="text-xs text-muted-foreground">{contact.role}</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-caption">Last Contact</p>
                                        <p className="text-sm text-foreground">{contact.lastContact}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-caption">Communication Preference</p>
                                        <p className="text-sm text-foreground capitalize">
                                            {contact.communicationPreference}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2 pt-2">
                                        <button
                                            onClick={() => onViewContact(contact)}
                                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-smooth"
                                        >
                                            <Icon name="EyeIcon" size={18} />
                                            <span className="text-sm font-medium">View</span>
                                        </button>
                                        <button
                                            onClick={() => onEditContact(contact)}
                                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-smooth"
                                        >
                                            <Icon name="PencilIcon" size={18} />
                                            <span className="text-sm font-medium">Edit</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default ContactsMobileView;