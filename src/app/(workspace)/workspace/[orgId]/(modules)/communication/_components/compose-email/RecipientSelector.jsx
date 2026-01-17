'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';



const RecipientSelector = ({
    recipients,
    selectedRecipients,
    onRecipientsChange,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [showDropdown, setShowDropdown] = useState(false);

    const filteredRecipients = recipients.filter((recipient) => {
        const matchesSearch =
            recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            recipient.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || recipient.type === filterType;
        const notSelected = !selectedRecipients.find((r) => r.id === recipient.id);
        return matchesSearch && matchesType && notSelected;
    });

    const handleAddRecipient = (recipient) => {
        onRecipientsChange([...selectedRecipients, recipient]);
        setSearchQuery('');
    };

    const handleRemoveRecipient = (recipientId) => {
        onRecipientsChange(selectedRecipients.filter((r) => r.id !== recipientId));
    };

    const handleSelectAll = () => {
        const allFiltered = recipients.filter((recipient) => {
            const matchesType = filterType === 'all' || recipient.type === filterType;
            const notSelected = !selectedRecipients.find((r) => r.id === recipient.id);
            return matchesType && notSelected;
        });
        onRecipientsChange([...selectedRecipients, ...allFiltered]);
    };

    const handleClearAll = () => {
        onRecipientsChange([]);
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'patient':
                return 'bg-primary/10 text-primary';
            case 'doctor':
                return 'bg-secondary/10 text-secondary';
            case 'staff':
                return 'bg-accent/10 text-accent';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'patient':
                return 'UserIcon';
            case 'doctor':
                return 'UserCircleIcon';
            case 'staff':
                return 'UsersIcon';
            default:
                return 'UserIcon';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-foreground">
                    Recipients ({selectedRecipients.length})
                </label>
                {selectedRecipients.length > 0 && (
                    <button
                        type="button"
                        onClick={handleClearAll}
                        className="text-sm text-destructive hover:text-destructive/80 transition-smooth"
                    >
                        Clear all
                    </button>
                )}
            </div>

            <div className="space-y-3">
                <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                        <Icon
                            name="MagnifyingGlassIcon"
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <input
                            type="text"
                            placeholder="Search recipients by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setShowDropdown(true)}
                            className="w-full pl-10 pr-4 py-2.5 bg-card border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleSelectAll}
                        className="px-4 py-2.5 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/90 transition-smooth whitespace-nowrap"
                    >
                        Select All
                    </button>
                </div>

                <div className="flex items-center space-x-2">
                    {(['all', 'patient', 'doctor', 'staff']).map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setFilterType(type)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-smooth ${filterType === type
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {showDropdown && searchQuery && (
                <div className="relative">
                    <div className="absolute z-50 w-full bg-popover border border-border rounded-md shadow-elevation-lg max-h-64 overflow-hidden">
                        <div className="overflow-y-auto max-h-64">
                            {filteredRecipients.length === 0 ? (
                                <div className="px-4 py-8 text-center">
                                    <Icon
                                        name="UserGroupIcon"
                                        size={48}
                                        className="mx-auto text-muted-foreground mb-2"
                                    />
                                    <p className="text-sm text-muted-foreground">No recipients found</p>
                                </div>
                            ) : (
                                <div className="py-2">
                                    {filteredRecipients.map((recipient) => (
                                        <button
                                            key={recipient.id}
                                            type="button"
                                            onClick={() => handleAddRecipient(recipient)}
                                            className="w-full px-4 py-3 text-left hover:bg-muted transition-smooth"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Icon
                                                    name={getTypeIcon(recipient.type)}
                                                    size={20}
                                                    className="text-muted-foreground flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-popover-foreground">
                                                        {recipient.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground font-caption">
                                                        {recipient.email}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(
                                                        recipient.type
                                                    )}`}
                                                >
                                                    {recipient.type}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {selectedRecipients.length > 0 && (
                <div className="bg-muted/50 rounded-md p-4 space-y-2 max-h-64 overflow-y-auto">
                    {selectedRecipients.map((recipient) => (
                        <div
                            key={recipient.id}
                            className="flex items-center justify-between bg-card px-3 py-2 rounded-md"
                        >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <Icon
                                    name={getTypeIcon(recipient.type)}
                                    size={18}
                                    className="text-muted-foreground flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {recipient.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground font-caption truncate">
                                        {recipient.email}
                                    </p>
                                </div>
                                <span
                                    className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${getTypeColor(
                                        recipient.type
                                    )}`}
                                >
                                    {recipient.type}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveRecipient(recipient.id)}
                                className="ml-3 p-1 rounded hover:bg-destructive/10 transition-smooth flex-shrink-0"
                            >
                                <Icon name="XMarkIcon" size={18} className="text-destructive" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecipientSelector;