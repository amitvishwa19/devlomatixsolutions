'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MetricsCard from './MetricsCard';
import QuickActionsPanel from './QuickActionsPanel';
import ActivityFeed from './ActivityFeed';
//import UtilizationChart from './UtilizationChart';
import DepartmentBreakdown from './DepartmentBreakdown';
import NavigationShortcuts from './NavigationShortcuts';

const DashboardInteractive = ({ initialData }) => {
    const [metricsData, setMetricsData] = useState(initialData?.metrics);
    const [activitiesData, setActivitiesData] = useState(initialData?.activities);

    useEffect(() => {
        const interval = setInterval(() => {
            setMetricsData((prev) => ({
                ...prev,
                totalServices: prev?.totalServices + Math.floor(Math.random() * 2),
            }));
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metricsData?.cards?.map((metric) => (
                    <MetricsCard
                        key={metric?.id}
                        title={metric?.title}
                        value={metric?.value}
                        change={metric?.change}
                        changeType={metric?.changeType}
                        icon={metric?.icon}
                        iconColor={metric?.iconColor}
                    />
                ))}
            </div>
            <QuickActionsPanel userRole={initialData?.userRole} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                <div className="lg:col-span-2">
                    <ActivityFeed activities={activitiesData} />
                </div>
                <div className="space-y-2">
                    <NavigationShortcuts shortcuts={initialData?.shortcuts} />
                    <DepartmentBreakdown departments={initialData?.departments} />
                </div>
            </div>

        </div>
    );
};

DashboardInteractive.propTypes = {
    initialData: PropTypes?.shape({
        userRole: PropTypes?.string?.isRequired,
        metrics: PropTypes?.shape({
            totalServices: PropTypes?.number?.isRequired,
            cards: PropTypes?.arrayOf(
                PropTypes?.shape({
                    id: PropTypes?.number?.isRequired,
                    title: PropTypes?.string?.isRequired,
                    value: PropTypes?.oneOfType([PropTypes?.string, PropTypes?.number])?.isRequired,
                    change: PropTypes?.string?.isRequired,
                    changeType: PropTypes?.string?.isRequired,
                    icon: PropTypes?.string?.isRequired,
                    iconColor: PropTypes?.string?.isRequired,
                })
            )?.isRequired,
        })?.isRequired,
        activities: PropTypes?.array?.isRequired,
        departments: PropTypes?.array?.isRequired,
        chartData: PropTypes?.array?.isRequired,
        shortcuts: PropTypes?.array?.isRequired,
    })?.isRequired,
};

export default DashboardInteractive;