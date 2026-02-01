'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import BillingOverviewCard from './BillingOverviewCard';
import RecentTransactionsTable from './RecentTransactionsTable';
import InsuranceClaimsPanel from './InsuranceClaimsPanel';
import PaymentProcessingModal from './PaymentProcessingModal';
import AccountsReceivableChart from './AccountsReceivableChart';
import BillingFilters from './BillingFilters';

export default function BillingManagementInteractive({ initialData }) {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [activeTab, setActiveTab] = useState('transactions');

    const handleViewDetails = (transactionId) => {
        console.log('Viewing transaction details:', transactionId);
        const transaction = initialData?.transactions?.find(t => t?.id === transactionId);
        if (transaction) {
            setSelectedPatient({
                name: transaction?.patientName,
                patientId: transaction?.patientId,
                balance: transaction?.amount,
                insurance: 'Blue Cross Blue Shield'
            });
            setIsPaymentModalOpen(true);
        }
    };

    const handleProcessClaim = (claimId) => {
        console.log('Processing claim:', claimId);
    };

    const handleFilterChange = (filters) => {
        console.log('Filters changed:', filters);
    };

    const handleNewInvoice = () => {
        console.log('Creating new invoice');
    };

    const handleExportReport = () => {
        console.log('Exporting financial report');
    };

    return (
        <div className="min-h-screen bg-background pt-16">
            <div className="max-w-[1920px] mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Billing Management</h1>
                        <p className="text-text-secondary">Manage patient billing, insurance claims, and financial operations</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportReport}
                            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors duration-200 text-sm font-medium text-foreground"
                        >
                            <Icon name="ArrowDownTrayIcon" size={20} />
                            <span>Export Report</span>
                        </button>
                        <button
                            onClick={handleNewInvoice}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 text-sm font-medium"
                        >
                            <Icon name="PlusIcon" size={20} />
                            <span>New Invoice</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    {initialData?.overviewCards?.map((card, index) => (
                        <BillingOverviewCard key={index} {...card} />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-card border border-border rounded-lg">
                            <div className="border-b border-border">
                                <div className="flex items-center gap-1 p-2">
                                    {[
                                        { id: 'transactions', label: 'Recent Transactions', icon: 'CurrencyDollarIcon' },
                                        { id: 'claims', label: 'Insurance Claims', icon: 'ShieldCheckIcon' },
                                        { id: 'analytics', label: 'Analytics', icon: 'ChartBarIcon' }
                                    ]?.map((tab) => (
                                        <button
                                            key={tab?.id}
                                            onClick={() => setActiveTab(tab?.id)}
                                            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === tab?.id
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-text-secondary hover:text-foreground hover:bg-muted'
                                                }`}
                                        >
                                            <Icon name={tab?.icon} size={20} />
                                            <span>{tab?.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6">
                                {activeTab === 'transactions' && (
                                    <RecentTransactionsTable
                                        transactions={initialData?.transactions}
                                        onViewDetails={handleViewDetails}
                                    />
                                )}
                                {activeTab === 'claims' && (
                                    <InsuranceClaimsPanel
                                        claims={initialData?.claims}
                                        onProcessClaim={handleProcessClaim}
                                    />
                                )}
                                {activeTab === 'analytics' && (
                                    <AccountsReceivableChart data={initialData?.chartData} />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <BillingFilters onFilterChange={handleFilterChange} />
                    </div>
                </div>
            </div>
            <PaymentProcessingModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                patientData={selectedPatient}
            />
        </div>
    );
}

BillingManagementInteractive.propTypes = {
    initialData: PropTypes?.shape({
        overviewCards: PropTypes?.arrayOf(
            PropTypes?.shape({
                title: PropTypes?.string?.isRequired,
                amount: PropTypes?.string?.isRequired,
                change: PropTypes?.string?.isRequired,
                changeType: PropTypes?.string?.isRequired,
                icon: PropTypes?.string?.isRequired,
                iconBg: PropTypes?.string?.isRequired
            })
        )?.isRequired,
        transactions: PropTypes?.arrayOf(
            PropTypes?.shape({
                id: PropTypes?.number?.isRequired,
                invoiceId: PropTypes?.string?.isRequired,
                patientName: PropTypes?.string?.isRequired,
                patientId: PropTypes?.string?.isRequired,
                date: PropTypes?.string?.isRequired,
                amount: PropTypes?.string?.isRequired,
                paymentMethod: PropTypes?.string?.isRequired,
                status: PropTypes?.string?.isRequired
            })
        )?.isRequired,
        claims: PropTypes?.arrayOf(
            PropTypes?.shape({
                id: PropTypes?.number?.isRequired,
                claimId: PropTypes?.string?.isRequired,
                patientName: PropTypes?.string?.isRequired,
                submissionDate: PropTypes?.string?.isRequired,
                insuranceProvider: PropTypes?.string?.isRequired,
                status: PropTypes?.string?.isRequired,
                claimAmount: PropTypes?.string?.isRequired,
                approvedAmount: PropTypes?.string?.isRequired,
                patientResponsibility: PropTypes?.string?.isRequired
            })
        )?.isRequired,
        chartData: PropTypes?.arrayOf(
            PropTypes?.shape({
                period: PropTypes?.string?.isRequired,
                amount: PropTypes?.number?.isRequired
            })
        )?.isRequired
    })?.isRequired
};