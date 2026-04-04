'use client';

import React from 'react';
import * as LucideIcons from 'lucide-react';

export const DynamicIcon = ({ name, size = 24, className = '', ...props }) => {
    // Convert kebab-case to PascalCase (e.g., shopping-cart -> ShoppingCart)
    const toPascalCase = (str) => {
        return str
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');
    };

    const iconName = toPascalCase(name);
    const IconComponent = LucideIcons[iconName] || LucideIcons.HelpCircle;

    return <IconComponent size={size} className={className} {...props} />;
};
