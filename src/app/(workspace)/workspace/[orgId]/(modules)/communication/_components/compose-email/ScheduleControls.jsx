'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';



const ScheduleControls = ({
    scheduleType,
    scheduledDate,
    scheduledTime,
    onScheduleTypeChange,
    onScheduledDateChange,
    onScheduledTimeChange,
}) => {
    const [isExpanded, setIsExpanded] = useState(scheduleType === 'scheduled');

    const handleScheduleTypeChange = (type) => {
        onScheduleTypeChange(type);
        setIsExpanded(type === 'scheduled');
    };

    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const getMinTime = () => {
        const now = new Date();
        const selectedDate = new Date(scheduledDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate.getTime() === today.getTime()) {
            return now.toTimeString().slice(0, 5);
        }
        return '00:00';
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">
                Delivery Schedule
            </label>

            <div className="space-y-3">
                <button
                    type="button"
                    onClick={() => handleScheduleTypeChange('immediate')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-md border transition-smooth ${scheduleType === 'immediate' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted'
                        }`}
                >
                    <div className="flex items-center space-x-3">
                        <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${scheduleType === 'immediate' ? 'border-primary' : 'border-muted-foreground'
                                }`}
                        >
                            {scheduleType === 'immediate' && (
                                <div className="w-3 h-3 rounded-full bg-primary" />
                            )}
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-foreground">Send Immediately</p>
                            <p className="text-xs text-muted-foreground font-caption">
                                Email will be sent as soon as you click send
                            </p>
                        </div>
                    </div>
                    <Icon
                        name="BoltIcon"
                        size={20}
                        className={
                            scheduleType === 'immediate' ? 'text-primary' : 'text-muted-foreground'
                        }
                    />
                </button>

                <button
                    type="button"
                    onClick={() => handleScheduleTypeChange('scheduled')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-md border transition-smooth ${scheduleType === 'scheduled' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted'
                        }`}
                >
                    <div className="flex items-center space-x-3">
                        <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${scheduleType === 'scheduled' ? 'border-primary' : 'border-muted-foreground'
                                }`}
                        >
                            {scheduleType === 'scheduled' && (
                                <div className="w-3 h-3 rounded-full bg-primary" />
                            )}
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-foreground">Schedule for Later</p>
                            <p className="text-xs text-muted-foreground font-caption">
                                Choose a specific date and time for delivery
                            </p>
                        </div>
                    </div>
                    <Icon
                        name="CalendarIcon"
                        size={20}
                        className={
                            scheduleType === 'scheduled' ? 'text-primary' : 'text-muted-foreground'
                        }
                    />
                </button>
            </div>

            {isExpanded && scheduleType === 'scheduled' && (
                <div className="bg-muted/50 rounded-md p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Date
                            </label>
                            <div className="relative">
                                <Icon
                                    name="CalendarIcon"
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                />
                                <input
                                    type="date"
                                    value={scheduledDate}
                                    onChange={(e) => onScheduledDateChange(e.target.value)}
                                    min={getMinDate()}
                                    className="w-full pl-10 pr-4 py-2.5 bg-card border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Time
                            </label>
                            <div className="relative">
                                <Icon
                                    name="ClockIcon"
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                />
                                <input
                                    type="time"
                                    value={scheduledTime}
                                    onChange={(e) => onScheduledTimeChange(e.target.value)}
                                    min={getMinTime()}
                                    className="w-full pl-10 pr-4 py-2.5 bg-card border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                        </div>
                    </div>

                    {scheduledDate && scheduledTime && (
                        <div className="flex items-start space-x-2 p-3 bg-primary/10 rounded-md">
                            <Icon
                                name="InformationCircleIcon"
                                size={18}
                                className="text-primary flex-shrink-0 mt-0.5"
                            />
                            <p className="text-sm text-foreground">
                                Email will be sent on{' '}
                                <span className="font-medium">
                                    {new Date(scheduledDate + 'T' + scheduledTime).toLocaleString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ScheduleControls;