'use client'
import React, { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useDispatch, useSelector } from 'react-redux'
import { useOrg } from '@/providers/OrgProvider'
import moment from 'moment'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ContentTopbar } from './(misc)/_components/ContentTopbar'
import { Users, Calendar, BedDouble, Receipt, Stethoscope, Activity, TrendingUp, Clock } from "lucide-react";
import { ActivityFeed, BedOccupancy, DepartmentStats, DoctorsList, EmergencyAlerts, InventoryStatus, LiveStats, MiniCalendar, PatientDemographics, PatientOverview, PerformanceMetrics, QuickActions, RecentAppointments, RevenueChart, StaffSchedule, StatCard, UpcomingSurgeries } from './(misc)/_components/dashboard'



export default function Dashboard() {
    const { data: session } = useSession()
    const { server } = useOrg()
    const doctorsdata = useSelector((state) => state.appointment.doctors)
    const loading = useSelector((state) => state.org.loading)
    const dispatch = useDispatch()

    useEffect(() => {
        //dispatch(setLoading(true))
        //appointments({ userId: session?.user?.userId, role: session?.user?.role, serverId: server?.id })
        //doctors({ userId: session?.user?.userId })
        //users({ userId: session?.user?.userId })
    }, [session, server])






    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <ContentTopbar
                title='Dashboard'
                description="Complete overview of all hospital operations and patient management. Monitor. Manage. Move forward."
            />


            <ScrollArea className='h-[85vh] flex flex-grow rounded-md '>
                <div className="space-y-6 animate-fade-in">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">
                                Welcome back, <span className="text-primary">Admin</span>
                            </h1>
                            <p className="text-sm text-muted-foreground mt-0.5">Here's what's happening at your hospital today.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 rounded-md bg-success/10 px-3 py-1.5 border border-success/20">
                                <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                                <span className="text-xs font-medium text-success">System Online</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid - Top Row */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total Patients"
                            value="2,847"
                            change="+12% from last month"
                            changeType="positive"
                            icon={Users}
                        />
                        <StatCard
                            title="Appointments Today"
                            value="48"
                            change="8 pending confirmation"
                            changeType="neutral"
                            icon={Calendar}
                        />
                        <StatCard
                            title="Available Beds"
                            value="32"
                            change="75% occupancy rate"
                            changeType="neutral"
                            icon={BedDouble}
                        />
                        <StatCard
                            title="Revenue Today"
                            value="$42,580"
                            change="+8% from yesterday"
                            changeType="positive"
                            icon={Receipt}
                        />
                    </div>

                    {/* Stats Grid - Second Row */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Active Doctors"
                            value="24"
                            change="3 on emergency"
                            changeType="neutral"
                            icon={Stethoscope}
                        />
                        <StatCard
                            title="Surgeries Today"
                            value="12"
                            change="4 completed"
                            changeType="positive"
                            icon={Activity}
                        />
                        <StatCard
                            title="Avg Wait Time"
                            value="14 min"
                            change="-3 min from avg"
                            changeType="positive"
                            icon={Clock}
                        />
                        <StatCard
                            title="Satisfaction"
                            value="94.2%"
                            change="+2.1% this week"
                            changeType="positive"
                            icon={TrendingUp}
                        />
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid gap-4 lg:grid-cols-12">
                        {/* Left Column */}
                        <div className="lg:col-span-8 space-y-4">
                            <RevenueChart />
                            <PatientOverview />
                            <UpcomingSurgeries />
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-4 space-y-4">
                            <QuickActions />
                            <MiniCalendar />
                            <EmergencyAlerts />
                            <LiveStats />
                        </div>
                    </div>

                    {/* Middle Grid */}
                    <div className="grid gap-4 lg:grid-cols-3">
                        <DoctorsList />
                        <StaffSchedule />
                        <InventoryStatus />
                    </div>

                    {/* Bottom Grid */}
                    <div className="grid gap-4 lg:grid-cols-3">
                        <DepartmentStats />
                        <BedOccupancy />
                        <PatientDemographics />
                    </div>

                    {/* Bottom Section */}
                    <div className="grid gap-4 lg:grid-cols-2">
                        <RecentAppointments />
                        <PerformanceMetrics />
                    </div>

                    {/* Activity Feed */}
                    <ActivityFeed />
                </div>
            </ScrollArea>



            {/* <div className='h-96 bg-red-200' /> */}

        </div>
    )
}
