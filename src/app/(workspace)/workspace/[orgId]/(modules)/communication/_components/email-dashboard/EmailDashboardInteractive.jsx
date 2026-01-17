'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QuickActionCard from './QuickActionCard';
import MetricCard from './MetricCard';
import ActivityItem from './ActivityItem';
import NotificationAlert from './NotificationAlert';
import DepartmentWidget from './DepartmentWidget';
import ScheduledEmailCard from './ScheduledEmailCard';





export default function EmailDashboardInteractive() {
    const router = useRouter();
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const quickActions = [
        {
            title: 'Send New Email',
            description: 'Compose and send emails to patients, staff, or doctors using predefined templates',
            iconName: 'PencilSquareIcon',
            route: '/compose-email',
            iconColor: 'bg-primary',
        },
        {
            title: 'Manage Templates',
            description: 'Create, edit, and organize email templates for various hospital communications',
            iconName: 'DocumentTextIcon',
            route: '/template-management',
            iconColor: 'bg-secondary',
        },
        {
            title: 'View Reports',
            description: 'Access detailed analytics, delivery statistics, and compliance reports',
            iconName: 'DocumentChartBarIcon',
            route: '/email-reports',
            iconColor: 'bg-accent',
        },
    ];

    const metrics = [
        {
            label: "Today's Sent Emails",
            value: 247,
            trend: { direction: 'up', percentage: 12 },
            iconName: 'PaperAirplaneIcon',
            iconColor: 'bg-primary',
        },
        {
            label: 'Delivery Rate',
            value: '98.5%',
            trend: { direction: 'up', percentage: 2 },
            iconName: 'CheckCircleIcon',
            iconColor: 'bg-success',
        },
        {
            label: 'Pending Approvals',
            value: 5,
            iconName: 'ClockIcon',
            iconColor: 'bg-warning',
        },
        {
            label: 'Active Templates',
            value: 32,
            iconName: 'DocumentDuplicateIcon',
            iconColor: 'bg-accent',
        },
    ];

    const recentActivities = [
        {
            type: 'delivered',
            title: 'Appointment Reminder Sent',
            description: 'Daily appointment reminders delivered successfully',
            timestamp: '5 minutes ago',
            recipientCount: 45,
        },
        {
            type: 'sent',
            title: 'Lab Results Notification',
            description: 'Test results notification sent to patients',
            timestamp: '15 minutes ago',
            recipientCount: 23,
        },
        {
            type: 'pending',
            title: 'Billing Statement Scheduled',
            description: 'Monthly billing statements queued for delivery',
            timestamp: '30 minutes ago',
            recipientCount: 156,
        },
        {
            type: 'delivered',
            title: 'Staff Meeting Announcement',
            description: 'Department meeting notification delivered',
            timestamp: '1 hour ago',
            recipientCount: 34,
        },
        {
            type: 'failed',
            title: 'Prescription Reminder Failed',
            description: '3 emails bounced due to invalid addresses',
            timestamp: '2 hours ago',
            recipientCount: 3,
        },
    ];

    const systemAlerts = [
        {
            type: 'warning',
            title: 'Template Approval Required',
            message: 'New discharge instructions template is pending administrative review',
            actionLabel: 'Review Now',
        },
        {
            type: 'info',
            title: 'Scheduled Maintenance',
            message: 'Email service maintenance scheduled for tonight at 2:00 AM EST',
        },
    ];

    const departmentStats = [
        { department: 'Emergency', sentToday: 89, deliveryRate: 99 },
        { department: 'Cardiology', sentToday: 56, deliveryRate: 98 },
        { department: 'Pediatrics', sentToday: 43, deliveryRate: 97 },
        { department: 'Radiology', sentToday: 34, deliveryRate: 100 },
    ];

    const scheduledEmails = [
        {
            id: '1',
            subject: 'Weekly Health Tips Newsletter',
            scheduledTime: 'Tomorrow, 9:00 AM',
            recipientCount: 1250,
            template: 'Patient Newsletter',
        },
        {
            id: '2',
            subject: 'Vaccination Reminder Campaign',
            scheduledTime: 'Dec 31, 10:00 AM',
            recipientCount: 450,
            template: 'Vaccination Reminder',
        },
    ];

    const handleAlertAction = () => {
        router.push('/template-management');
    };

    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-[1600px] mx-auto px-6 py-8">
                    <div className="animate-pulse space-y-8">
                        <div className="h-8 bg-muted rounded w-64" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-32 bg-muted rounded-lg" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-[1600px] mx-auto px-6 py-8">


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-4">
                                Quick Actions
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {quickActions.map((action, index) => (
                                    <QuickActionCard key={index} {...action} />
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-4">
                                Key Metrics
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {metrics.map((metric, index) => (
                                    <MetricCard key={index} {...metric} />
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-4">
                                Recent Activity
                            </h2>
                            <div className="bg-card rounded-lg shadow-elevation-sm divide-y divide-border">
                                {recentActivities.map((activity, index) => (
                                    <ActivityItem key={index} {...activity} />
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-4">
                                System Alerts
                            </h2>
                            <div className="space-y-4">
                                {systemAlerts.map((alert, index) => (
                                    <NotificationAlert
                                        key={index}
                                        {...alert}
                                        onActionClick={
                                            alert.actionLabel ? handleAlertAction : undefined
                                        }
                                    />
                                ))}
                            </div>
                        </section>

                        <section>
                            <DepartmentWidget stats={departmentStats} />
                        </section>

                        <section>
                            <ScheduledEmailCard emails={scheduledEmails} />
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}