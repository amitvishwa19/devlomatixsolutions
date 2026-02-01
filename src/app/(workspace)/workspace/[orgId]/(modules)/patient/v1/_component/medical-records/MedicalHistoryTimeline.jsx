'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function MedicalHistoryTimeline({ historyData }) {
    const [expandedEntries, setExpandedEntries] = useState(new Set());

    const toggleEntry = (entryId) => {
        setExpandedEntries(prev => {
            const newSet = new Set(prev);
            if (newSet?.has(entryId)) {
                newSet?.delete(entryId);
            } else {
                newSet?.add(entryId);
            }
            return newSet;
        });
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'diagnosis':
                return 'ClipboardDocumentCheckIcon';
            case 'procedure':
                return 'BeakerIcon';
            case 'treatment':
                return 'HeartIcon';
            case 'visit':
                return 'CalendarDaysIcon';
            default:
                return 'DocumentTextIcon';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'diagnosis':
                return 'bg-error/10 text-error';
            case 'procedure':
                return 'bg-warning/10 text-warning';
            case 'treatment':
                return 'bg-accent/10 text-accent';
            case 'visit':
                return 'bg-primary/10 text-primary';
            default:
                return 'bg-muted text-text-secondary';
        }
    };

    return (
        <div className="space-y-4">
            {historyData?.map((entry, index) => (
                <div key={entry?.id} className="relative">
                    {index !== historyData?.length - 1 && (
                        <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-border" />
                    )}

                    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(entry?.type)}`}>
                                <Icon name={getTypeIcon(entry?.type)} size={24} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <div>
                                        <h3 className="text-base font-semibold text-foreground">{entry?.title}</h3>
                                        <p className="text-sm text-text-secondary">{entry?.date}</p>
                                    </div>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(entry?.type)}`}>
                                        {entry?.type?.charAt(0)?.toUpperCase() + entry?.type?.slice(1)}
                                    </span>
                                </div>

                                <p className="text-sm text-foreground mb-3">{entry?.summary}</p>

                                {entry?.details && (
                                    <>
                                        <button
                                            onClick={() => toggleEntry(entry?.id)}
                                            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                                        >
                                            <span>{expandedEntries?.has(entry?.id) ? 'Hide Details' : 'View Details'}</span>
                                            <Icon
                                                name="ChevronDownIcon"
                                                size={16}
                                                className={`transition-transform duration-200 ${expandedEntries?.has(entry?.id) ? 'rotate-180' : ''}`}
                                            />
                                        </button>

                                        {expandedEntries?.has(entry?.id) && (
                                            <div className="mt-3 p-4 bg-muted rounded-lg space-y-2">
                                                {entry?.details?.provider && (
                                                    <div className="flex items-start gap-2">
                                                        <Icon name="UserIcon" size={16} className="text-text-secondary mt-0.5" />
                                                        <div>
                                                            <span className="text-xs font-medium text-text-secondary">Provider:</span>
                                                            <p className="text-sm text-foreground">{entry?.details?.provider}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {entry?.details?.location && (
                                                    <div className="flex items-start gap-2">
                                                        <Icon name="MapPinIcon" size={16} className="text-text-secondary mt-0.5" />
                                                        <div>
                                                            <span className="text-xs font-medium text-text-secondary">Location:</span>
                                                            <p className="text-sm text-foreground">{entry?.details?.location}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {entry?.details?.notes && (
                                                    <div className="flex items-start gap-2">
                                                        <Icon name="DocumentTextIcon" size={16} className="text-text-secondary mt-0.5" />
                                                        <div>
                                                            <span className="text-xs font-medium text-text-secondary">Notes:</span>
                                                            <p className="text-sm text-foreground">{entry?.details?.notes}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {entry?.details?.outcome && (
                                                    <div className="flex items-start gap-2">
                                                        <Icon name="CheckCircleIcon" size={16} className="text-accent mt-0.5" />
                                                        <div>
                                                            <span className="text-xs font-medium text-text-secondary">Outcome:</span>
                                                            <p className="text-sm text-foreground">{entry?.details?.outcome}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

MedicalHistoryTimeline.propTypes = {
    historyData: PropTypes?.arrayOf(
        PropTypes?.shape({
            id: PropTypes?.string?.isRequired,
            type: PropTypes?.oneOf(['diagnosis', 'procedure', 'treatment', 'visit'])?.isRequired,
            title: PropTypes?.string?.isRequired,
            date: PropTypes?.string?.isRequired,
            summary: PropTypes?.string?.isRequired,
            details: PropTypes?.shape({
                provider: PropTypes?.string,
                location: PropTypes?.string,
                notes: PropTypes?.string,
                outcome: PropTypes?.string
            })
        })
    )?.isRequired
};