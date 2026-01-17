'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const ReportGeneratorModal = ({ isOpen, onClose, pricingData }) => {
    const [selectedReports, setSelectedReports] = useState([]);
    const [dateRange, setDateRange] = useState('last30days');
    const [exportFormat, setExportFormat] = useState('pdf');
    const [includeCharts, setIncludeCharts] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    const reportTypes = [
        {
            id: 'pricing_summary',
            name: 'Pricing Summary Report',
            description: 'Overview of all pricing tiers and current rates',
            icon: 'DocumentTextIcon',
            category: 'Overview',
        },
        {
            id: 'revenue_analysis',
            name: 'Revenue Impact Analysis',
            description: 'Projected vs. actual revenue by service category',
            icon: 'CurrencyDollarIcon',
            category: 'Financial',
        },
        {
            id: 'utilization_report',
            name: 'Service Utilization Report',
            description: 'Usage statistics and utilization rates',
            icon: 'ChartBarIcon',
            category: 'Performance',
        },
        {
            id: 'competitive_analysis',
            name: 'Competitive Pricing Analysis',
            description: 'Market comparison and positioning',
            icon: 'ScaleIcon',
            category: 'Market',
        },
        {
            id: 'discount_effectiveness',
            name: 'Discount Effectiveness Report',
            description: 'Impact of discount tiers on revenue',
            icon: 'ReceiptPercentIcon',
            category: 'Financial',
        },
        {
            id: 'price_change_history',
            name: 'Price Change History',
            description: 'Historical pricing modifications and trends',
            icon: 'ClockIcon',
            category: 'Historical',
        },
        {
            id: 'department_breakdown',
            name: 'Department Breakdown',
            description: 'Pricing analysis by department',
            icon: 'BuildingOfficeIcon',
            category: 'Organizational',
        },
        {
            id: 'insurance_coverage',
            name: 'Insurance Coverage Report',
            description: 'Insurance acceptance rates and reimbursement',
            icon: 'ShieldCheckIcon',
            category: 'Insurance',
        },
        {
            id: 'profitability_analysis',
            name: 'Service Profitability Analysis',
            description: 'Margin analysis and cost-to-revenue ratios',
            icon: 'TrendingUpIcon',
            category: 'Financial',
        },
        {
            id: 'compliance_audit',
            name: 'Compliance Audit Report',
            description: 'Regulatory compliance and audit trail',
            icon: 'ClipboardDocumentCheckIcon',
            category: 'Compliance',
        },
    ];

    const dateRangeOptions = [
        { value: 'last7days', label: 'Last 7 Days' },
        { value: 'last30days', label: 'Last 30 Days' },
        { value: 'last90days', label: 'Last 90 Days' },
        { value: 'lastquarter', label: 'Last Quarter' },
        { value: 'lastyear', label: 'Last Year' },
        { value: 'custom', label: 'Custom Range' },
    ];

    const exportFormatOptions = [
        { value: 'pdf', label: 'PDF Document', icon: 'DocumentIcon' },
        { value: 'excel', label: 'Excel Spreadsheet', icon: 'TableCellsIcon' },
        { value: 'csv', label: 'CSV File', icon: 'DocumentTextIcon' },
        { value: 'json', label: 'JSON Data', icon: 'CodeBracketIcon' },
    ];

    const toggleReport = (reportId) => {
        setSelectedReports((prev) =>
            prev?.includes(reportId) ? prev?.filter((id) => id !== reportId) : [...prev, reportId]
        );
    };

    const selectAllReports = () => {
        setSelectedReports(reportTypes?.map((r) => r?.id));
    };

    const clearAllReports = () => {
        setSelectedReports([]);
    };

    const handleGenerate = async () => {
        if (selectedReports?.length === 0) {
            alert('Please select at least one report to generate');
            return;
        }

        setIsGenerating(true);
        // Simulate report generation
        setTimeout(() => {
            setIsGenerating(false);
            alert(`Generated ${selectedReports?.length} report(s) successfully! Download will begin shortly.`);
            onClose();
        }, 2000);
    };

    const groupedReports = reportTypes?.reduce((acc, report) => {
        if (!acc?.[report?.category]) {
            acc[report?.category] = [];
        }
        acc?.[report?.category]?.push(report);
        return acc;
    }, {});

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">Generate Reports</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Select reports to generate and configure export options
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-md transition-colors"
                        aria-label="Close modal"
                    >
                        <Icon name="XMarkIcon" size={20} className="text-muted-foreground" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Quick Actions */}
                    <div className="flex items-center gap-3 mb-6">
                        <button
                            onClick={selectAllReports}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-md transition-colors"
                        >
                            <Icon name="CheckCircleIcon" size={16} />
                            Select All
                        </button>
                        <button
                            onClick={clearAllReports}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted rounded-md transition-colors"
                        >
                            <Icon name="XCircleIcon" size={16} />
                            Clear All
                        </button>
                        <div className="flex-1" />
                        <span className="text-sm text-muted-foreground">
                            {selectedReports?.length} of {reportTypes?.length} selected
                        </span>
                    </div>

                    {/* Report Types */}
                    <div className="space-y-6 mb-6">
                        {Object?.entries(groupedReports)?.map(([category, reports]) => (
                            <div key={category}>
                                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                    <div className="h-px flex-1 bg-border" />
                                    {category}
                                    <div className="h-px flex-1 bg-border" />
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {reports?.map((report) => (
                                        <button
                                            key={report?.id}
                                            onClick={() => toggleReport(report?.id)}
                                            className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left ${selectedReports?.includes(report?.id)
                                                ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground hover:bg-muted/30'
                                                }`}
                                        >
                                            <div
                                                className={`flex-shrink-0 p-2 rounded-md ${selectedReports?.includes(report?.id) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                                    }`}
                                            >
                                                <Icon name={report?.icon} size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-foreground mb-1">{report?.name}</h4>
                                                <p className="text-xs text-muted-foreground">{report?.description}</p>
                                            </div>
                                            {selectedReports?.includes(report?.id) && (
                                                <Icon name="CheckCircleIcon" size={20} className="flex-shrink-0 text-primary" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Configuration Options */}
                    <div className="bg-muted/30 rounded-lg p-6 space-y-6">
                        <h3 className="text-sm font-semibold text-foreground mb-4">Report Configuration</h3>

                        {/* Date Range */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Date Range</label>
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e?.target?.value)}
                                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                            >
                                {dateRangeOptions?.map((option) => (
                                    <option key={option?.value} value={option?.value}>
                                        {option?.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Export Format */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Export Format</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {exportFormatOptions?.map((format) => (
                                    <button
                                        key={format?.value}
                                        onClick={() => setExportFormat(format?.value)}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${exportFormat === format?.value
                                            ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground hover:bg-muted/30'
                                            }`}
                                    >
                                        <Icon
                                            name={format?.icon}
                                            size={24}
                                            className={exportFormat === format?.value ? 'text-primary' : 'text-muted-foreground'}
                                        />
                                        <span className="text-xs font-medium text-foreground">{format?.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Additional Options */}
                        <div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={includeCharts}
                                    onChange={(e) => setIncludeCharts(e?.target?.checked)}
                                    className="w-4 h-4 text-primary bg-background border-input rounded focus:ring-2 focus:ring-ring"
                                />
                                <span className="text-sm text-foreground">Include charts and visualizations</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 p-6 border-t border-border bg-muted/30">
                    <div className="text-sm text-muted-foreground">
                        {selectedReports?.length > 0 && (
                            <span>Ready to generate {selectedReports?.length} report(s)</span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-foreground bg-muted rounded-md hover:bg-muted/80 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={selectedReports?.length === 0 || isGenerating}
                            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <>
                                    <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Icon name="DocumentArrowDownIcon" size={16} />
                                    Generate Reports
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

ReportGeneratorModal.propTypes = {
    isOpen: PropTypes?.bool?.isRequired,
    onClose: PropTypes?.func?.isRequired,
    pricingData: PropTypes?.array,
};

export default ReportGeneratorModal;