'use client';


import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/button';

const PlatformSelector = ({ selectedPlatform, onPlatformChange }) => {
    const platforms = [
        { id: 'twitter', name: 'Twitter', icon: 'ChatBubbleLeftIcon', color: 'bg-blue-500', maxChars: 280 },
        { id: 'facebook', name: 'Facebook', icon: 'UserGroupIcon', color: 'bg-blue-600', maxChars: 63206 },
        { id: 'instagram', name: 'Instagram', icon: 'CameraIcon', color: 'bg-pink-500', maxChars: 2200 },
        { id: 'linkedin', name: 'LinkedIn', icon: 'BriefcaseIcon', color: 'bg-blue-700', maxChars: 3000 }
    ];

    return (
        <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground">
                Select Platform
            </label>
            <div className="grid grid-cols-2 gap-3">
                {platforms?.map((platform) => (
                    <Button
                        key={platform?.id}
                        variant='outline'
                        onClick={() => onPlatformChange(platform?.id)}
                        className={`
                                h-14 flex items-center space-x-3 p-4 rounded-md  transition-all duration-200 dark:hover:bg-darkFocusColor
                                ${selectedPlatform === platform?.id
                                ? 'border-primary bg-primary/5 shadow-md dark:bg-darkFocusColor'
                                : 'border-border bg-card hover:border-primary/50 hover:shadow-sm'
                            }
            `}
                    >
                        <div className={`p-2 rounded-lg ${selectedPlatform === platform?.id && 'bg-blue-500'}`}>
                            <Icon name={platform?.icon} size={20} className="text-white" variant="solid" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-semibold text-foreground">{platform?.name}</p>
                            <p className="text-xs text-muted-foreground">{platform?.maxChars} chars</p>
                        </div>
                        {selectedPlatform === platform?.id && (
                            <Icon name="CheckCircleIcon" size={20} className="text-primary" variant="solid" />
                        )}
                    </Button>
                ))}
            </div>
        </div>
    );
};

PlatformSelector.propTypes = {
    selectedPlatform: PropTypes?.string?.isRequired,
    onPlatformChange: PropTypes?.func?.isRequired
};

export default PlatformSelector;