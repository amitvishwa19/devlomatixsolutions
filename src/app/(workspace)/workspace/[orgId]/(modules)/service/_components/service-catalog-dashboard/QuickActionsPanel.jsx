'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const QuickActionsPanel = ({ userRole }) => {
    const [activeAction, setActiveAction] = useState(null);

    const actions = [
        {
            id: 'add-service',
            label: 'Add New Service',
            icon: 'PlusCircleIcon',
            color: 'bg-primary text-primary-foreground',
            roles: ['admin', 'manager'],
        },
        {
            id: 'bulk-import',
            label: 'Bulk Import',
            icon: 'ArrowUpTrayIcon',
            color: 'bg-accent text-accent-foreground',
            roles: ['admin', 'manager'],
        },
        {
            id: 'generate-reports',
            label: 'Generate Reports',
            icon: 'DocumentChartBarIcon',
            color: 'bg-secondary text-secondary-foreground',
            roles: ['admin', 'manager', 'billing'],
        },
        {
            id: 'manage-categories',
            label: 'Manage Categories',
            icon: 'FolderIcon',
            color: 'bg-muted text-foreground',
            roles: ['admin', 'manager'],
        },
    ];

    const filteredActions = actions?.filter((action) =>
        action?.roles?.includes(userRole)
    );

    const handleActionClick = (actionId) => {
        setActiveAction(actionId);
        setTimeout(() => setActiveAction(null), 300);
    };

    return (
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredActions?.map((action) => (
                    <button
                        key={action?.id}
                        onClick={() => handleActionClick(action?.id)}
                        className={`${action?.color} rounded-lg p-4 transition-all duration-200 hover:scale-105 hover:shadow-md ${activeAction === action?.id ? 'scale-95' : ''
                            }`}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <Icon name={action?.icon} size={32} variant="solid" />
                            <span className="text-sm font-medium text-center">{action?.label}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

QuickActionsPanel.propTypes = {
    userRole: PropTypes?.oneOf(['admin', 'manager', 'billing', 'staff'])?.isRequired,
};

export default QuickActionsPanel;