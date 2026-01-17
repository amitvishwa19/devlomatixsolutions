'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';



const TemplateListItem = ({ template, isSelected, onSelect }) => {
    const [isHydrated, setIsHydrated] = useState(false);

    useState(() => {
        setIsHydrated(true);
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-success/10 text-success';
            case 'pending':
                return 'bg-warning/10 text-warning';
            case 'draft':
                return 'bg-muted text-muted-foreground';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return 'CheckCircleIcon';
            case 'pending':
                return 'ClockIcon';
            case 'draft':
                return 'DocumentTextIcon';
            default:
                return 'DocumentTextIcon';
        }
    };

    const handleClick = () => {
        if (isHydrated) {
            onSelect(template.id);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`w-full text-left p-4 rounded-lg border transition-smooth hover:shadow-elevation-sm ${isSelected
                ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'
                }`}
        >
            <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                    {template.name}
                </h3>
                <span
                    className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(
                        template.status
                    )}`}
                >
                    <Icon name={getStatusIcon(template.status)} size={14} />
                    <span className="capitalize">{template.status}</span>
                </span>
            </div>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {template.description}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-caption">{template.category}</span>
                <span className="font-caption">{template.lastModified}</span>
            </div>
        </button>
    );
};

export default TemplateListItem;