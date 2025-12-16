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



export default DashboardInteractive;