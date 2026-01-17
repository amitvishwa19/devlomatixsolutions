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
                    <Icon name="ScissorsIcon" size={20} className="text-primary" />
                    Patient History
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

