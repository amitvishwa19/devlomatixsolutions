import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function VitalSignsCard({ vitals }) {
    const getVitalStatus = (value, normal) => {
        if (!normal) return 'normal';
        const [min, max] = normal?.split('-')?.map(v => parseFloat(v));
        const val = parseFloat(value);
        if (val < min || val > max) return 'abnormal';
        return 'normal';
    };

    const vitalItems = [
        {
            label: 'Blood Pressure',
            value: vitals?.bloodPressure,
            unit: 'mmHg',
            icon: 'HeartIcon',
            normal: '90-120',
            color: 'text-error'
        },
        {
            label: 'Heart Rate',
            value: vitals?.heartRate,
            unit: 'bpm',
            icon: 'BoltIcon',
            normal: '60-100',
            color: 'text-primary'
        },
        {
            label: 'Temperature',
            value: vitals?.temperature,
            unit: '°F',
            icon: 'FireIcon',
            normal: '97-99',
            color: 'text-warning'
        },
        {
            label: 'Respiratory Rate',
            value: vitals?.respiratoryRate,
            unit: 'breaths/min',
            icon: 'CloudIcon',
            normal: '12-20',
            color: 'text-accent'
        },
        {
            label: 'Oxygen Saturation',
            value: vitals?.oxygenSaturation,
            unit: '%',
            icon: 'BeakerIcon',
            normal: '95-100',
            color: 'text-success'
        },
        {
            label: 'Weight',
            value: vitals?.weight,
            unit: 'lbs',
            icon: 'ScaleIcon',
            normal: null,
            color: 'text-text-secondary'
        }
    ];

    return (
        <div className="bg-card border border-border rounded-lg p-2 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Icon name="ChartBarIcon" size={24} className="text-primary" />
                    Vital Signs
                </h2>
                <span className="text-sm text-text-secondary">Last recorded: {vitals?.lastRecorded}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {vitalItems?.map((vital, index) => {
                    const status = getVitalStatus(vital?.value, vital?.normal);
                    return (
                        <div key={index} className="bg-muted rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status === 'abnormal' ? 'bg-error/10' : 'bg-primary/10'
                                    }`}>
                                    <Icon name={vital?.icon} size={20} className={status === 'abnormal' ? 'text-error' : vital?.color} />
                                </div>
                                {status === 'abnormal' && (
                                    <Icon name="ExclamationCircleIcon" size={20} className="text-error" />
                                )}
                            </div>
                            <div className="text-sm text-text-secondary mb-1">{vital?.label}</div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-foreground">{vital?.value}</span>
                                <span className="text-sm text-text-secondary">{vital?.unit}</span>
                            </div>
                            {vital?.normal && (
                                <div className="text-xs text-text-secondary mt-1">Normal: {vital?.normal} {vital?.unit}</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
