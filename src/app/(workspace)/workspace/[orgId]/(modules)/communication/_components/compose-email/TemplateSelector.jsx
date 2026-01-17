'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';



const TemplateSelector = ({
    templates,
    selectedTemplate,
    onTemplateSelect,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTemplates = templates.filter(
        (template) =>
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleTemplateSelect = (template) => {
        onTemplateSelect(template);
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleClearTemplate = () => {
        onTemplateSelect(null);
        setSearchQuery('');
    };

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-foreground mb-2">
                Email Template
            </label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-card border border-input rounded-md text-left hover:bg-muted transition-smooth focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <span className="text-sm text-foreground">
                        {selectedTemplate ? selectedTemplate.name : 'Select a template or compose from scratch'}
                    </span>
                    <Icon
                        name={isOpen ? 'ChevronUpIcon' : 'ChevronDownIcon'}
                        size={20}
                        className="text-muted-foreground"
                    />
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-md shadow-elevation-lg max-h-96 overflow-hidden">
                        <div className="p-3 border-b border-border">
                            <div className="relative">
                                <Icon
                                    name="MagnifyingGlassIcon"
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                />
                                <input
                                    type="text"
                                    placeholder="Search templates..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                        </div>

                        <div className="overflow-y-auto max-h-80">
                            {filteredTemplates.length === 0 ? (
                                <div className="px-4 py-8 text-center">
                                    <Icon
                                        name="DocumentTextIcon"
                                        size={48}
                                        className="mx-auto text-muted-foreground mb-2"
                                    />
                                    <p className="text-sm text-muted-foreground">No templates found</p>
                                </div>
                            ) : (
                                <div className="py-2">
                                    {filteredTemplates.map((template) => (
                                        <button
                                            key={template.id}
                                            type="button"
                                            onClick={() => handleTemplateSelect(template)}
                                            className={`w-full px-4 py-3 text-left hover:bg-muted transition-smooth ${selectedTemplate?.id === template.id ? 'bg-muted' : ''
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-popover-foreground">
                                                        {template.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1 font-caption">
                                                        {template.category}
                                                    </p>
                                                </div>
                                                {selectedTemplate?.id === template.id && (
                                                    <Icon
                                                        name="CheckIcon"
                                                        size={20}
                                                        className="text-primary flex-shrink-0 ml-2"
                                                    />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {selectedTemplate && (
                <button
                    type="button"
                    onClick={handleClearTemplate}
                    className="mt-2 text-sm text-primary hover:text-primary/80 transition-smooth flex items-center space-x-1"
                >
                    <Icon name="XMarkIcon" size={16} />
                    <span>Clear template and compose from scratch</span>
                </button>
            )}
        </div>
    );
};

export default TemplateSelector;