'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function LabResultsPanel({ labResults }) {
    const [selectedTest, setSelectedTest] = useState(null);
    const [viewMode, setViewMode] = useState('list');

    const getStatusColor = (status) => {
        switch (status) {
            case 'normal':
                return 'text-accent bg-accent/10';
            case 'abnormal':
                return 'text-error bg-error/10';
            case 'critical':
                return 'text-error bg-error/20 font-semibold';
            default:
                return 'text-text-secondary bg-muted';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'normal':
                return 'CheckCircleIcon';
            case 'abnormal':
                return 'ExclamationCircleIcon';
            case 'critical':
                return 'ExclamationTriangleIcon';
            default:
                return 'InformationCircleIcon';
        }
    };

    const handleTestSelect = (test) => {
        setSelectedTest(test);
        setViewMode('trend');
    };

    const handleBackToList = () => {
        setSelectedTest(null);
        setViewMode('list');
    };

    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    {viewMode === 'trend' && (
                        <button
                            onClick={handleBackToList}
                            className="p-2 hover:bg-muted rounded-lg transition-colors duration-200"
                        >
                            <Icon name="ArrowLeftIcon" size={20} className="text-text-secondary" />
                        </button>
                    )}
                    <h2 className="text-lg font-semibold text-foreground">
                        {viewMode === 'list' ? 'Laboratory Results' : `Trend Analysis: ${selectedTest?.name || ''}`}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <Icon name="BeakerIcon" size={20} className="text-primary" />
                </div>
            </div>
            {viewMode === 'list' ? (
                <div className="space-y-3">
                    {labResults?.map((result) => (
                        <div
                            key={result?.id}
                            className="bg-background border border-border rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-base font-semibold text-foreground">{result?.name}</h3>
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result?.status)}`}>
                                            <Icon name={getStatusIcon(result?.status)} size={14} />
                                            {result?.status?.charAt(0)?.toUpperCase() + result?.status?.slice(1)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-text-secondary">{result?.date}</p>
                                </div>
                                <button
                                    onClick={() => handleTestSelect(result)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                                >
                                    <span>View Trend</span>
                                    <Icon name="ChartBarIcon" size={16} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-card p-3 rounded-lg">
                                    <span className="text-xs font-medium text-text-secondary block mb-1">Result</span>
                                    <span className="text-lg font-semibold text-foreground">{result?.value} {result?.unit}</span>
                                </div>
                                <div className="bg-card p-3 rounded-lg">
                                    <span className="text-xs font-medium text-text-secondary block mb-1">Normal Range</span>
                                    <span className="text-sm text-foreground">{result?.normalRange}</span>
                                </div>
                                <div className="bg-card p-3 rounded-lg">
                                    <span className="text-xs font-medium text-text-secondary block mb-1">Ordered By</span>
                                    <span className="text-sm text-foreground">{result?.orderedBy}</span>
                                </div>
                            </div>

                            {result?.notes && (
                                <div className="mt-3 p-3 bg-muted rounded-lg">
                                    <span className="text-xs font-medium text-text-secondary block mb-1">Clinical Notes</span>
                                    <p className="text-sm text-foreground">{result?.notes}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-background p-4 rounded-lg border border-border">
                            <span className="text-xs font-medium text-text-secondary block mb-2">Latest Result</span>
                            <span className="text-2xl font-bold text-foreground">{selectedTest?.value} {selectedTest?.unit}</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(selectedTest?.status || 'normal')}`}>
                                <Icon name={getStatusIcon(selectedTest?.status || 'normal')} size={14} />
                                {selectedTest?.status?.charAt(0)?.toUpperCase() + selectedTest?.status?.slice(1)}
                            </span>
                        </div>
                        <div className="bg-background p-4 rounded-lg border border-border">
                            <span className="text-xs font-medium text-text-secondary block mb-2">Normal Range</span>
                            <span className="text-lg font-semibold text-foreground">{selectedTest?.normalRange}</span>
                        </div>
                        <div className="bg-background p-4 rounded-lg border border-border">
                            <span className="text-xs font-medium text-text-secondary block mb-2">Test Date</span>
                            <span className="text-lg font-semibold text-foreground">{selectedTest?.date}</span>
                        </div>
                    </div>

                    <div className="bg-background p-6 rounded-lg border border-border">
                        <h3 className="text-sm font-semibold text-foreground mb-4">Historical Trend</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={selectedTest?.trendData || []}>
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
                                <ReferenceLine
                                    y={selectedTest?.normalMin || 0}
                                    stroke="#10B981"
                                    strokeDasharray="3 3"
                                    label={{ value: 'Min Normal', position: 'left', fill: '#10B981', fontSize: 10 }}
                                />
                                <ReferenceLine
                                    y={selectedTest?.normalMax || 100}
                                    stroke="#10B981"
                                    strokeDasharray="3 3"
                                    label={{ value: 'Max Normal', position: 'left', fill: '#10B981', fontSize: 10 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#2563EB"
                                    strokeWidth={2}
                                    dot={{ fill: '#2563EB', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}

LabResultsPanel.propTypes = {
    labResults: PropTypes?.arrayOf(
        PropTypes?.shape({
            id: PropTypes?.string?.isRequired,
            name: PropTypes?.string?.isRequired,
            value: PropTypes?.oneOfType([PropTypes?.string, PropTypes?.number])?.isRequired,
            unit: PropTypes?.string?.isRequired,
            status: PropTypes?.oneOf(['normal', 'abnormal', 'critical'])?.isRequired,
            date: PropTypes?.string?.isRequired,
            normalRange: PropTypes?.string?.isRequired,
            orderedBy: PropTypes?.string?.isRequired,
            notes: PropTypes?.string,
            normalMin: PropTypes?.number,
            normalMax: PropTypes?.number,
            trendData: PropTypes?.arrayOf(
                PropTypes?.shape({
                    date: PropTypes?.string?.isRequired,
                    value: PropTypes?.number?.isRequired
                })
            )
        })
    )?.isRequired
};