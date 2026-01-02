'use client';

import { useState, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';



const ContactsTable = ({
    contacts,
    selectedContacts,
    onSelectContact,
    onSelectAll,
    onViewContact,
    onEditContact,
    searchQuery,
    sortField,
    sortDirection,
    onSort,
}) => {
    const [isHydrated, setIsHydrated] = useState(false);

    useState(() => {
        setIsHydrated(true);
    });

    const filteredContacts = useMemo(() => {
        if (!searchQuery) return contacts;
        const query = searchQuery.toLowerCase();
        return contacts.filter(
            (contact) =>
                contact.name.toLowerCase().includes(query) ||
                contact.email.toLowerCase().includes(query) ||
                contact.department.toLowerCase().includes(query) ||
                contact.phone.includes(query)
        );
    }, [contacts, searchQuery]);

    const allSelected = filteredContacts.length > 0 &&
        filteredContacts.every((contact) => selectedContacts.includes(contact.id));

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

    const handleSort = (field) => {
        onSort(field);
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) {
            return <Icon name="ChevronUpDownIcon" size={16} className="text-muted-foreground" />;
        }
        return sortDirection === 'asc' ? (
            <Icon name="ChevronUpIcon" size={16} className="text-primary" />
        ) : (
            <Icon name="ChevronDownIcon" size={16} className="text-primary" />
        );
    };

    if (!isHydrated) {
        return (
            <div className="bg-card rounded-lg shadow-elevation-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Last Contact
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {[1, 2, 3].map((i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4">
                                        <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                                            <div className="space-y-2">
                                                <div className="w-32 h-4 bg-muted rounded animate-pulse" />
                                                <div className="w-40 h-3 bg-muted rounded animate-pulse" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-16 h-6 bg-muted rounded animate-pulse" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-24 h-4 bg-muted rounded animate-pulse" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-16 h-6 bg-muted rounded animate-pulse" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-20 h-4 bg-muted rounded animate-pulse" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end space-x-2">
                                            <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                                            <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-lg shadow-elevation-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-6 py-3 text-left">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-3 focus:ring-ring focus:ring-offset-3"
                                    aria-label="Select all contacts"
                                />
                            </th>
                            <th className="px-6 py-3 text-left">
                                <button
                                    onClick={() => handleSort('name')}
                                    className="flex items-center space-x-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-smooth"
                                >
                                    <span>Contact</span>
                                    <SortIcon field="name" />
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left">
                                <button
                                    onClick={() => handleSort('type')}
                                    className="flex items-center space-x-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-smooth"
                                >
                                    <span>Type</span>
                                    <SortIcon field="type" />
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left">
                                <button
                                    onClick={() => handleSort('department')}
                                    className="flex items-center space-x-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-smooth"
                                >
                                    <span>Department</span>
                                    <SortIcon field="department" />
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left">
                                <button
                                    onClick={() => handleSort('status')}
                                    className="flex items-center space-x-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-smooth"
                                >
                                    <span>Status</span>
                                    <SortIcon field="status" />
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left">
                                <button
                                    onClick={() => handleSort('lastContact')}
                                    className="flex items-center space-x-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-smooth"
                                >
                                    <span>Last Contact</span>
                                    <SortIcon field="lastContact" />
                                </button>
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredContacts.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center">
                                    <Icon name="UserGroupIcon" size={48} className="mx-auto text-muted-foreground mb-3" />
                                    <p className="text-sm text-muted-foreground">
                                        {searchQuery ? 'No contacts found matching your search' : 'No contacts available'}
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            filteredContacts.map((contact) => (
                                <tr
                                    key={contact.id}
                                    className="hover:bg-muted/30 transition-smooth"
                                >
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedContacts.includes(contact.id)}
                                            onChange={() => onSelectContact(contact.id)}
                                            className="w-4 h-4 rounded border-border text-primary focus:ring-3 focus:ring-ring focus:ring-offset-3"
                                            aria-label={`Select ${contact.name}`}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium text-sm flex-shrink-0">
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
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">
                                                    {contact.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {contact.email}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {contact.phone}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                                                contact.type
                                            )}`}
                                        >
                                            {contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-foreground">{contact.department}</p>
                                        {contact.role && (
                                            <p className="text-xs text-muted-foreground">{contact.role}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                contact.status
                                            )}`}
                                        >
                                            {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-muted-foreground">{contact.lastContact}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => onViewContact(contact)}
                                                className="p-2 rounded-md hover:bg-muted transition-smooth"
                                                title="View contact details"
                                            >
                                                <Icon name="EyeIcon" size={18} className="text-foreground" />
                                            </button>
                                            <button
                                                onClick={() => onEditContact(contact)}
                                                className="p-2 rounded-md hover:bg-muted transition-smooth"
                                                title="Edit contact"
                                            >
                                                <Icon name="PencilIcon" size={18} className="text-foreground" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ContactsTable;