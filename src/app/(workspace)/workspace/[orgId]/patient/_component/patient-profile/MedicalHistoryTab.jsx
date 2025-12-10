'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import { mockPatientData } from './PatientProfilePage';

export default function MedicalHistoryTab() {
    const [expandedCondition, setExpandedCondition] = useState(null);
    const history = mockPatientData.medicalHistory
    const toggleCondition = (id) => {
        setExpandedCondition(expandedCondition === id ? null : id);
    };

    return (
        <div className="space-y-2 w-full">
            <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Icon name="ClipboardDocumentListIcon" size={20} className="text-primary" />
                    Chronic Conditions
                </h3>
                <div className="space-y-3">
                    {history?.chronicConditions?.map((condition) => (
                        <div key={condition?.id} className="border border-border rounded-lg overflow-hidden">
                            <button
                                onClick={() => toggleCondition(condition?.id)}
                                className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors duration-200 ease-out text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${condition?.status === 'Active' ? 'bg-error' : 'bg-success'
                                        }`} />
                                    <div>
                                        <div className="text-sm font-medium text-foreground">{condition?.name}</div>
                                        <div className="text-xs text-text-secondary">Diagnosed: {condition?.diagnosedDate}</div>
                                    </div>
                                </div>
                                <Icon
                                    name="ChevronDownIcon"
                                    size={20}
                                    className={`text-text-secondary transition-transform duration-200 ease-out ${expandedCondition === condition?.id ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>
                            {expandedCondition === condition?.id && (
                                <div className="px-4 pb-4 border-t border-border bg-muted/50">
                                    <div className="pt-4 space-y-2">
                                        <div className="text-sm text-foreground">{condition?.description}</div>
                                        <div className="text-xs text-text-secondary">Treatment: {condition?.treatment}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Icon name="ScissorsIcon" size={20} className="text-primary" />
                    Past Surgeries
                </h3>
                <div className="space-y-3">
                    {history?.pastSurgeries?.map((surgery, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                            <Icon name="CheckCircleIcon" size={20} className="text-success flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <div className="text-sm font-medium text-foreground">{surgery?.name}</div>
                                <div className="text-xs text-text-secondary mt-1">{surgery?.date} • {surgery?.hospital}</div>
                                <div className="text-xs text-text-secondary mt-1">{surgery?.notes}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Icon name="UserGroupIcon" size={20} className="text-primary" />
                    Family History
                </h3>
                <div className="space-y-3">
                    {history?.familyHistory?.map((item, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                            <Icon name="InformationCircleIcon" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <div className="text-sm font-medium text-foreground">{item?.condition}</div>
                                <div className="text-xs text-text-secondary mt-1">{item?.relation} • {item?.notes}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

