'use client';

import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/button';

const TemplateSelector = ({ selectedTemplate, onTemplateChange }) => {


    const templates = [
        {
            id: 'blank',
            name: 'Start from Scratch',
            description: 'Create completely custom content',
            icon: 'DocumentIcon'
        },
        {
            id: 'announcement',
            name: 'Announcement',
            description: 'Share news and updates',
            icon: 'MegaphoneIcon'
        },
        {
            id: 'question',
            name: 'Question',
            description: 'Engage with questions',
            icon: 'QuestionMarkCircleIcon'
        },
        {
            id: 'tips',
            name: 'Tips & Advice',
            description: 'Share helpful insights',
            icon: 'LightBulbIcon'
        },
        {
            id: 'promotion',
            name: 'Promotion',
            description: 'Promote products/services',
            icon: 'TagIcon'
        },
        {
            id: 'story',
            name: 'Story',
            description: 'Tell engaging stories',
            icon: 'BookOpenIcon'
        }
    ];

    return (
        <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground">
                Choose Template
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {templates?.map((template) => (
                    <Button
                        key={template?.id}
                        variant='outline'
                        onClick={() => onTemplateChange(template?.id)}
                        className={`
                                   h-14 flex  space-x-3 rounded-md border text-left transition-all duration-200 items-center
                                 ${selectedTemplate === template?.id
                                ? 'border-primary bg-primary/5 shadow-md'
                                : 'border-border bg-card hover:border-primary/50 hover:shadow-sm'
                            }
            `}
                    >
                        <div className={`p-2 rounded-lg ${selectedTemplate === template?.id ? 'bg-blue-500' : 'bg-muted'}`}>
                            <Icon
                                name={template?.icon}
                                size={20}
                                className={selectedTemplate === template?.id ? 'text-white' : 'text-muted-foreground'}
                                variant={selectedTemplate === template?.id ? 'solid' : 'outline'}
                            />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">{template?.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{template?.description}</p>
                        </div>
                        {selectedTemplate === template?.id && (
                            <Icon name="CheckCircleIcon" size={18} className="text-primary" variant="solid" />
                        )}
                    </Button>
                ))}
            </div>
        </div>
    );
};

TemplateSelector.propTypes = {
    selectedTemplate: PropTypes?.string?.isRequired,
    onTemplateChange: PropTypes?.func?.isRequired
};

export default TemplateSelector;