'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import PricingMatrixTable from './PricingMatrixTable';
import PricingAnalytics from './PricingAnalytics';
import PricingEditorModal from './PricingEditorModal';
import PricingHistoryModal from './PricingHistoryModal';
import ReportGeneratorModal from './ReportGeneratorModal';
import Icon from '@/components/ui/AppIcon';

const PricingManagementInteractive = ({ initialData }) => {
    const [pricingData, setPricingData] = useState(initialData?.pricingData);
    const [filteredData, setFilteredData] = useState(initialData?.pricingData);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [activeFilter, setActiveFilter] = useState('all');

    const handleSearch = (query) => {
        const filtered = pricingData?.filter(
            (item) =>
                item?.serviceName?.toLowerCase()?.includes(query?.toLowerCase()) ||
                item?.serviceCode?.toLowerCase()?.includes(query?.toLowerCase()) ||
                item?.category?.toLowerCase()?.includes(query?.toLowerCase())
        );
        setFilteredData(filtered);
    };

    const handleEditPrice = (service) => {
        setSelectedService(service);
        setIsEditorOpen(true);
    };

    const handleViewHistory = (service) => {
        setSelectedService(service);
        setIsHistoryOpen(true);
    };

    const handleDuplicateTier = (service) => {
        const newService = {
            ...service,
            id: pricingData?.length + 1,
            serviceName: `${service?.serviceName} (Copy)`,
            status: 'Pending',
        };
        setPricingData([...pricingData, newService]);
        setFilteredData([...filteredData, newService]);
    };

    const handleSavePrice = (updatedService) => {
        const updated = pricingData?.map((item) => (item?.id === updatedService?.id ? updatedService : item));
        setPricingData(updated);
        setFilteredData(updated);
    };

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        if (filter === 'all') {
            setFilteredData(pricingData);
        } else {
            const filtered = pricingData?.filter((item) => item?.status?.toLowerCase() === filter?.toLowerCase());
            setFilteredData(filtered);
        }
    };

    const handleCreatePricingTier = () => {
        setSelectedService(null);
        setIsEditorOpen(true);
    };

    const handleBulkUpdate = () => {
        alert('Bulk pricing update functionality would be implemented here');
    };

    const handleImportPriceList = () => {
        alert('Import price list functionality would be implemented here');
    };

    const handleGenerateReport = () => {
        setIsReportModalOpen(true);
    };

    const handleSubmitForApproval = () => {
        alert('Submit for approval functionality would be implemented here');
    };

    return (
        <div className="min-h-screen bg-background">
            {/* <Header userRole="admin" notificationCount={3} /> */}
            <main className="w-full px-4 lg:px-6 py-6">
                <div className="max-w-[1600px] mx-auto">

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">Pricing Management</h1>
                            <p className="text-sm text-muted-foreground">
                                Configure pricing structures, discount tiers, and billing parameters
                            </p>
                        </div>
                        <div className="flex items-center gap-3">

                            <button
                                onClick={handleCreatePricingTier}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
                            >
                                <Icon name="PlusIcon" size={20} />
                                Create Pricing Tier
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-muted-foreground">Total Services</span>
                                <Icon name="CubeIcon" size={20} className="text-primary" />
                            </div>
                            <p className="text-2xl font-bold text-foreground">{pricingData?.length}</p>
                            <p className="text-xs text-success mt-1">+5 this month</p>
                        </div>

                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-muted-foreground">Active Tiers</span>
                                <Icon name="CheckCircleIcon" size={20} className="text-success" />
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {pricingData?.filter((item) => item?.status === 'Active')?.length}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Currently in use</p>
                        </div>

                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-muted-foreground">Pending Approval</span>
                                <Icon name="ClockIcon" size={20} className="text-warning" />
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {pricingData?.filter((item) => item?.status === 'Pending')?.length}
                            </p>
                            <p className="text-xs text-warning mt-1">Requires review</p>
                        </div>

                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-muted-foreground">Avg. Discount</span>
                                <Icon name="ReceiptPercentIcon" size={20} className="text-accent" />
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {(pricingData?.reduce((sum, item) => sum + item?.discount, 0) / pricingData?.length)?.toFixed(1)}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Across all services</p>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6 mb-6">


                        <PricingMatrixTable
                            pricingData={filteredData}
                            onEditPrice={handleEditPrice}
                            onViewHistory={handleViewHistory}
                            onDuplicateTier={handleDuplicateTier}
                        />
                    </div>

                    <PricingAnalytics analyticsData={initialData?.analyticsData} />

                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <button
                            onClick={handleGenerateReport}
                            className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-foreground bg-muted rounded-md hover:bg-muted/80 transition-colors"
                        >
                            <Icon name="DocumentChartBarIcon" size={20} />
                            Generate Pricing Report
                        </button>
                        <button
                            onClick={handleSubmitForApproval}
                            className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
                        >
                            <Icon name="CheckCircleIcon" size={20} />
                            Submit for Approval
                        </button>
                    </div>
                </div>
            </main>
            <PricingEditorModal
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                selectedService={selectedService}
                onSave={handleSavePrice}
            />
            <PricingHistoryModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                service={selectedService}
                historyData={initialData?.historyData}
            />
            <ReportGeneratorModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                pricingData={pricingData}
            />
        </div>
    );
};

PricingManagementInteractive.propTypes = {
    initialData: PropTypes?.shape({
        pricingData: PropTypes?.arrayOf(
            PropTypes?.shape({
                id: PropTypes?.number?.isRequired,
                serviceName: PropTypes?.string?.isRequired,
                serviceCode: PropTypes?.string?.isRequired,
                category: PropTypes?.string?.isRequired,
                basePrice: PropTypes?.number?.isRequired,
                insuranceRate: PropTypes?.number?.isRequired,
                discount: PropTypes?.number?.isRequired,
                effectiveDate: PropTypes?.string?.isRequired,
                status: PropTypes?.string?.isRequired,
            })
        )?.isRequired,
        analyticsData: PropTypes?.object?.isRequired,
        historyData: PropTypes?.array?.isRequired,
        notifications: PropTypes?.array?.isRequired,
    })?.isRequired,
};

export default PricingManagementInteractive;