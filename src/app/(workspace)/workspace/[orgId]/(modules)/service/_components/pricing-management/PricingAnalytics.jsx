'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '@/components/ui/AppIcon';

const PricingAnalytics = ({ analyticsData }) => {
    const [activeTab, setActiveTab] = useState('revenue');

    const tabs = [
        { id: 'revenue', label: 'Revenue Impact', icon: 'CurrencyDollarIcon' },
        { id: 'utilization', label: 'Utilization', icon: 'ChartBarIcon' },
        { id: 'competitive', label: 'Competitive Analysis', icon: 'ScaleIcon' },
    ];

    const renderChart = () => {
        switch (activeTab) {
            case 'revenue':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analyticsData?.revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis dataKey="month" stroke="#64748B" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#64748B" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Bar dataKey="projected" fill="#2563EB" name="Projected Revenue" />
                            <Bar dataKey="actual" fill="#059669" name="Actual Revenue" />
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'utilization':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analyticsData?.utilizationData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis dataKey="service" stroke="#64748B" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#64748B" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Line type="monotone" dataKey="utilization" stroke="#2563EB" strokeWidth={2} name="Utilization Rate %" />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'competitive':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analyticsData?.competitiveData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis type="number" stroke="#64748B" style={{ fontSize: '12px' }} />
                            <YAxis dataKey="service" type="category" stroke="#64748B" style={{ fontSize: '12px' }} width={120} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Bar dataKey="ourPrice" fill="#2563EB" name="Our Price" />
                            <Bar dataKey="marketAvg" fill="#64748B" name="Market Average" />
                        </BarChart>
                    </ResponsiveContainer>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Pricing Analytics</h2>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-md transition-colors">
                    <Icon name="ArrowDownTrayIcon" size={16} />
                    Export
                </button>
            </div>
            <div className="flex gap-2 mb-6 border-b border-border">
                {tabs?.map((tab) => (
                    <button
                        key={tab?.id}
                        onClick={() => setActiveTab(tab?.id)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === tab?.id
                            ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'
                            }`}
                    >
                        <Icon name={tab?.icon} size={16} />
                        {tab?.label}
                    </button>
                ))}
            </div>
            <div className="mb-6" aria-label={`${tabs?.find((t) => t?.id === activeTab)?.label} Chart`}>
                {renderChart()}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Icon name="TrendingUpIcon" size={20} className="text-success" />
                        <span className="text-sm font-medium text-muted-foreground">Revenue Growth</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">+12.5%</p>
                    <p className="text-xs text-muted-foreground mt-1">vs. last quarter</p>
                </div>

                <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Icon name="UserGroupIcon" size={20} className="text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">Avg. Utilization</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">78.3%</p>
                    <p className="text-xs text-muted-foreground mt-1">across all services</p>
                </div>

                <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Icon name="ScaleIcon" size={20} className="text-accent" />
                        <span className="text-sm font-medium text-muted-foreground">Market Position</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">-3.2%</p>
                    <p className="text-xs text-muted-foreground mt-1">below market avg.</p>
                </div>
            </div>
        </div>
    );
};

PricingAnalytics.propTypes = {
    analyticsData: PropTypes?.shape({
        revenueData: PropTypes?.arrayOf(
            PropTypes?.shape({
                month: PropTypes?.string?.isRequired,
                projected: PropTypes?.number?.isRequired,
                actual: PropTypes?.number?.isRequired,
            })
        )?.isRequired,
        utilizationData: PropTypes?.arrayOf(
            PropTypes?.shape({
                service: PropTypes?.string?.isRequired,
                utilization: PropTypes?.number?.isRequired,
            })
        )?.isRequired,
        competitiveData: PropTypes?.arrayOf(
            PropTypes?.shape({
                service: PropTypes?.string?.isRequired,
                ourPrice: PropTypes?.number?.isRequired,
                marketAvg: PropTypes?.number?.isRequired,
            })
        )?.isRequired,
    })?.isRequired,
};

export default PricingAnalytics;