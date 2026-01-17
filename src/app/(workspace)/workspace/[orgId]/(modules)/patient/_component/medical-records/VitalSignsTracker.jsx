'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function VitalSignsTracker({ vitalSigns }) {
    const [selectedVital, setSelectedVital] = useState('bloodPressure');

    const vitalTypes = [
        { id: 'bloodPressure', name: 'Blood Pressure', icon: 'HeartIcon', unit: 'mmHg', color: '#DC2626' },
        { id: 'heartRate', name: 'Heart Rate', icon: 'BoltIcon', unit: 'bpm', color: '#2563EB' },
        { id: 'temperature', name: 'Temperature', icon: 'FireIcon', unit: '°F', color: '#F59E0B' },
        { id: 'oxygenSaturation', name: 'Oxygen Saturation', icon: 'CloudIcon', unit: '%', color: '#059669' }
    ];

    const getLatestReading = (vitalId) => {
        const readings = vitalSigns?.[vitalId];
        return readings && readings?.length > 0 ? readings?.[readings?.length - 1] : null;
    };

    const getStatusColor = (vitalId, value) => {
        switch (vitalId) {
            case 'bloodPressure':
                if (value?.systolic > 140 || value?.diastolic > 90) return 'text-error';
                if (value?.systolic < 90 || value?.diastolic < 60) return 'text-warning';
                return 'text-accent';
            case 'heartRate':
                if (value < 60 || value > 100) return 'text-warning';
                return 'text-accent';
            case 'temperature':
                if (value > 100.4 || value < 97) return 'text-error';
                return 'text-accent';
            case 'oxygenSaturation':
                if (value < 95) return 'text-error';
                return 'text-accent';
            default:
                return 'text-foreground';
        }
    };

    const formatValue = (vitalId, value) => {
        if (vitalId === 'bloodPressure') {
            return `${value?.systolic}/${value?.diastolic}`;
        }
        return value;
    };

    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Vital Signs</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors duration-200">
                    <Icon name="PlusIcon" size={16} />
                    <span>Record Vitals</span>
                </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {vitalTypes?.map((vital) => {
                    const latestReading = getLatestReading(vital?.id);
                    const value = latestReading?.value;

                    return (
                        <button
                            key={vital?.id}
                            onClick={() => setSelectedVital(vital?.id)}
                            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${selectedVital === vital?.id
                                ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/50'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${vital?.color}20` }}>
                                    <Icon name={vital?.icon} size={16} style={{ color: vital?.color }} />
                                </div>
                            </div>
                            <div className="text-xs font-medium text-text-secondary mb-1">{vital?.name}</div>
                            {value ? (
                                <>
                                    <div className={`text-xl font-bold ${getStatusColor(vital?.id, value)}`}>
                                        {formatValue(vital?.id, value)} <span className="text-sm font-normal">{vital?.unit}</span>
                                    </div>
                                    <div className="text-xs text-text-secondary mt-1">{latestReading?.date}</div>
                                </>
                            ) : (
                                <div className="text-sm text-text-secondary">No data</div>
                            )}
                        </button>
                    );
                })}
            </div>
            <div className="bg-background p-6 rounded-lg border border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                    {vitalTypes?.find(v => v?.id === selectedVital)?.name} Trend
                </h3>

                {vitalSigns?.[selectedVital] && vitalSigns?.[selectedVital]?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={vitalSigns?.[selectedVital]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis
                                dataKey="date"
                                stroke="#64748B"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis
                                stroke="#64748B"
                                style={{ fontSize: '12px' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '8px',
                                    fontSize: '12px'
                                }}
                            />
                            <Legend />
                            {selectedVital === 'bloodPressure' ? (
                                <>
                                    <Line
                                        type="monotone"
                                        dataKey="value.systolic"
                                        stroke="#DC2626"
                                        strokeWidth={2}
                                        name="Systolic"
                                        dot={{ fill: '#DC2626', r: 4 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value.diastolic"
                                        stroke="#2563EB"
                                        strokeWidth={2}
                                        name="Diastolic"
                                        dot={{ fill: '#2563EB', r: 4 }}
                                    />
                                </>
                            ) : (
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke={vitalTypes?.find(v => v?.id === selectedVital)?.color || '#2563EB'}
                                    strokeWidth={2}
                                    dot={{ fill: vitalTypes?.find(v => v?.id === selectedVital)?.color || '#2563EB', r: 4 }}
                                />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-64 text-text-secondary">
                        No historical data available
                    </div>
                )}
            </div>
        </div>
    );
}

VitalSignsTracker.propTypes = {
    vitalSigns: PropTypes?.shape({
        bloodPressure: PropTypes?.arrayOf(
            PropTypes?.shape({
                date: PropTypes?.string?.isRequired,
                value: PropTypes?.shape({
                    systolic: PropTypes?.number?.isRequired,
                    diastolic: PropTypes?.number?.isRequired
                })?.isRequired
            })
        ),
        heartRate: PropTypes?.arrayOf(
            PropTypes?.shape({
                date: PropTypes?.string?.isRequired,
                value: PropTypes?.number?.isRequired
            })
        ),
        temperature: PropTypes?.arrayOf(
            PropTypes?.shape({
                date: PropTypes?.string?.isRequired,
                value: PropTypes?.number?.isRequired
            })
        ),
        oxygenSaturation: PropTypes?.arrayOf(
            PropTypes?.shape({
                date: PropTypes?.string?.isRequired,
                value: PropTypes?.number?.isRequired
            })
        )
    })?.isRequired
};