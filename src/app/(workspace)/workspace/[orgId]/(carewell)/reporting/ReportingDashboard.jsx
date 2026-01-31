import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, RefreshCw, Users, CalendarDays, DollarSign, Pill, Clock, Star } from 'lucide-react';
import { REPORT_PERIODS, REPORT_PERIOD_LABELS } from './types';
import { summaryStats } from './mockReportingData';
import {
  SummaryCard,
  PatientTrendChart,
  AppointmentVolumeChart,
  RevenueChart,
  DepartmentPieChart,
  AgeDistributionChart,
  TopMedicationsCard,
} from './components';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

export default function ReportingDashboard() {
  const [period, setPeriod] = useState(REPORT_PERIODS.YEAR);

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      <div className="p-6 space-y-6 flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Analytics & Reporting
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track key metrics, trends, and performance insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REPORT_PERIODS).map(([key, value]) => (
                  <SelectItem key={value} value={value}>
                    {REPORT_PERIOD_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 pb-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <SummaryCard
                title="Total Patients"
                value={summaryStats.totalPatients.toLocaleString()}
                change={summaryStats.patientGrowth}
                subtitle="vs last period"
                icon={Users}
              />
              <SummaryCard
                title="Appointments"
                value={summaryStats.totalAppointments.toLocaleString()}
                change={summaryStats.appointmentGrowth}
                subtitle="vs last period"
                icon={CalendarDays}
              />
              <SummaryCard
                title="Revenue"
                value={formatCurrency(summaryStats.totalRevenue)}
                change={summaryStats.revenueGrowth}
                subtitle="vs last period"
                icon={DollarSign}
              />
              <SummaryCard
                title="Prescriptions"
                value={summaryStats.totalPrescriptions.toLocaleString()}
                change={summaryStats.prescriptionGrowth}
                subtitle="vs last period"
                icon={Pill}
              />
              <SummaryCard
                title="Avg Wait Time"
                value={`${summaryStats.avgWaitTime} min`}
                change={summaryStats.waitTimeChange}
                subtitle="vs last period"
                icon={Clock}
              />
              <SummaryCard
                title="Satisfaction"
                value={`${summaryStats.patientSatisfaction}/5`}
                change={summaryStats.satisfactionChange * 100}
                subtitle="vs last period"
                icon={Star}
              />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PatientTrendChart />
              <AppointmentVolumeChart />
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RevenueChart />
              </div>
              <DepartmentPieChart />
            </div>

            {/* Charts Row 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AgeDistributionChart />
              <TopMedicationsCard />
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
