'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from "@/components/ui/checkbox"


const ContentForm = ({ formData, onFormChange }) => {
    const [topicLength, setTopicLength] = useState(0);

    const categories = [
        { value: 'business', label: 'Business' },
        { value: 'personal', label: 'Personal' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'educational', label: 'Educational' }
    ];

    const tones = [
        { value: 'professional', label: 'Professional', icon: 'BriefcaseIcon' },
        { value: 'casual', label: 'Casual', icon: 'ChatBubbleLeftIcon' },
        { value: 'humorous', label: 'Humorous', icon: 'FaceSmileIcon' },
        { value: 'promotional', label: 'Promotional', icon: 'MegaphoneIcon' }
    ];

    const contentLengths = [
        { value: 'short', label: 'Short' },
        { value: 'medium', label: 'Medium' },
        { value: 'long', label: 'Long' }
    ];

    const handleTopicChange = (e) => {
        const value = e?.target?.value;
        setTopicLength(value?.length);
        onFormChange({ ...formData, topic: value });
    };

    return (
        <div className="space-y-6">


            {/* Category Selection */}
            <div className="space-y-2 flex flex-col">
                <label htmlFor="category" className="block text-sm font-semibold text-foreground">
                    Content Category
                </label>

                <Select className='w-full' defaultValue={formData?.category} onValueChange={(e) => onFormChange({ ...formData, category: e?.target?.value })}>
                    <SelectTrigger className="">
                        <SelectValue placeholder="Content Category" />
                    </SelectTrigger>
                    <SelectContent className=''>
                        {categories?.map((cat) => (
                            <SelectItem key={cat?.value} value={cat?.value}>
                                {cat?.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>


            {/* Tone Selection */}
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                    Content Tone
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {tones?.map((tone) => (
                        <Button
                            key={tone?.value}
                            variant={'outline'}
                            onClick={() => onFormChange({ ...formData, tone: tone?.value })}
                            className={`
                                        h-12 flex items-center space-x-2 p-3 rounded-md  transition-all duration-200
                                        ${formData?.tone === tone?.value
                                    ? 'border-primary bg-primary/5 text-primary dark:bg-darkFocusColor border' : 'border-border bg-card text-foreground hover:border-primary/50'
                                }
              `}
                        >
                            <div className={`p-2 ${formData?.tone === tone?.value && 'bg-blue-500 rounded-lg'}`}>
                                <Icon name={tone?.icon} size={18} variant={formData?.tone === tone?.value ? 'solid' : 'outline'} />
                            </div>
                            <span className="text-sm font-medium">{tone?.label}</span>
                        </Button>
                    ))}
                </div>
            </div>


            {/* Topic Input */}
            <div className="space-y-2">
                <label htmlFor="topic" className="block text-sm font-semibold text-foreground">
                    Topic / Prompt
                </label>
                <Textarea
                    id="topic"

                    value={formData?.topic}
                    onChange={handleTopicChange}
                    placeholder="Enter your topic or prompt for content generation..."
                    rows={4}
                    maxLength={500}

                />
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Provide clear context for better results</span>
                    <span className={topicLength > 450 ? 'text-warning' : ''}>{topicLength}/500</span>
                </div>
            </div>

            {/* Content Length */}
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                    Content Length
                </label>
                <div className="flex space-x-2">
                    {contentLengths?.map((length) => (
                        <Button
                            key={length?.value}
                            variant='outline'
                            onClick={() => onFormChange({ ...formData, contentLength: length?.value })}
                            className={`
                                    h-10 flex-1 py-2 px-4 rounded-md border text-sm font-medium transition-all duration-200
                                    ${formData?.contentLength === length?.value
                                    ? 'border-primary bg-primary dark:bg-darkFocusColor'
                                    : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                                }
              `}
                        >
                            {length?.label}
                        </Button>
                    ))}
                </div>
            </div>


            {/* Target Audience */}
            <div className="space-y-2">
                <label htmlFor="audience" className="block text-sm font-semibold text-foreground">
                    Target Audience (Optional)
                </label>
                <Textarea
                    id="audience"
                    type="text"
                    rows='2'
                    value={formData?.targetAudience}
                    onChange={(e) => onFormChange({ ...formData, targetAudience: e?.target?.value })}
                    placeholder="e.g., Small business owners, Tech enthusiasts"

                />
            </div>


            {/* Hashtag Preferences */}
            <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-foreground">
                    {/* <input
                        type="checkbox"
                        checked={formData?.includeHashtags}
                        onChange={(e) => onFormChange({ ...formData, includeHashtags: e?.target?.checked })}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                    /> */}
                    <Checkbox checked={formData?.includeHashtags} onCheckedChange={(e) => onFormChange({ ...formData, includeHashtags: e?.target?.checked })} />
                    <span>Include Hashtag Suggestions</span>
                </label>
            </div>

        </div>
    );
};

ContentForm.propTypes = {
    formData: PropTypes?.shape({
        category: PropTypes?.string?.isRequired,
        tone: PropTypes?.string?.isRequired,
        topic: PropTypes?.string?.isRequired,
        contentLength: PropTypes?.string?.isRequired,
        targetAudience: PropTypes?.string,
        includeHashtags: PropTypes?.bool?.isRequired
    })?.isRequired,
    onFormChange: PropTypes?.func?.isRequired
};

export default ContentForm;