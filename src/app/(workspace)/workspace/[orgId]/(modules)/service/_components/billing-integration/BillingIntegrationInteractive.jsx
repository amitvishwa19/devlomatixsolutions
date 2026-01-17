'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import BillingQueueTable from './BillingQueueTable';
import BillingAnalyticsDashboard from './BillingAnalyticsDashboard';
import ServiceSelectionPanel from './ServiceSelectionPanel';
import InvoiceBuilder from './InvoiceBuilder';
import PaymentProcessingModal from './PaymentProcessingModal';
import Icon from '@/components/ui/AppIcon';

const BillingIntegrationInteractive = ({ initialData }) => {
    const [billingQueue, setBillingQueue] = useState(initialData?.billingQueue);
    const [selectedBilling, setSelectedBilling] = useState(null);
    const [selectedServices, setSelectedServices] = useState([]);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [activeView, setActiveView] = useState('queue');
    const [showServicePanel, setShowServicePanel] = useState(false);

    const handleSelectBilling = (billing) => {
        setSelectedBilling(billing);
        setActiveView('invoice');
    };

    const handleProcessPayment = (billing) => {
        setSelectedBilling(billing);
        setIsPaymentModalOpen(true);
    };

    const handleGenerateInvoice = (billing) => {
        setSelectedBilling(billing);
        setActiveView('invoice');
    };

    const handleAddService = (service) => {
        setSelectedServices(prev => [...prev, service]);
    };

    const handleRemoveService = (serviceId) => {
        setSelectedServices(prev => prev?.filter(s => s?.id !== serviceId));
    };

    const handleUpdateService = (serviceId, quantity) => {
        setSelectedServices(prev => prev?.map(service =>
            service?.id === serviceId
                ? { ...service, quantity, subtotal: service?.price * quantity }
                : service
        ));
    };

    const handleApplyDiscount = (discount) => {
        console.log('Discount applied:', discount);
    };

    const handleGenerateInvoiceFromBuilder = (invoiceData) => {
        console.log('Invoice generated:', invoiceData);
        alert('Invoice generated successfully!');
    };

    const handlePaymentComplete = (paymentData) => {
        console.log('Payment processed:', paymentData);
        alert(`Payment of $${paymentData?.amount?.toFixed(2)} processed successfully!`);
        setIsPaymentModalOpen(false);
    };

    const handleBatchProcess = () => {
        alert('Batch processing initiated for selected items');
    };

    const handleExportData = () => {
        alert('Exporting billing data...');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setActiveView('queue')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'queue' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'
                            }`}
                    >
                        <Icon name="QueueListIcon" size={20} />
                        Billing Queue
                    </button>
                    <button
                        onClick={() => setActiveView('invoice')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'invoice' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'
                            }`}
                    >
                        <Icon name="DocumentTextIcon" size={20} />
                        Invoice Builder
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleBatchProcess}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-muted rounded-md hover:bg-muted/80 transition-colors"
                    >
                        <Icon name="BoltIcon" size={20} />
                        <span className="hidden sm:inline">Batch Process</span>
                    </button>
                    <button
                        onClick={handleExportData}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-muted rounded-md hover:bg-muted/80 transition-colors"
                    >
                        <Icon name="ArrowDownTrayIcon" size={20} />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                    <button
                        onClick={() => setShowServicePanel(!showServicePanel)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
                    >
                        <Icon name="PlusCircleIcon" size={20} />
                        <span className="hidden sm:inline">New Invoice</span>
                    </button>
                </div>
            </div>
            <BillingAnalyticsDashboard analytics={initialData?.analytics} />
            {activeView === 'queue' && (
                <BillingQueueTable
                    billingQueue={billingQueue}
                    onSelectBilling={handleSelectBilling}
                    onProcessPayment={handleProcessPayment}
                    onGenerateInvoice={handleGenerateInvoice}
                />
            )}
            {activeView === 'invoice' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {showServicePanel && (
                        <ServiceSelectionPanel
                            services={initialData?.availableServices}
                            selectedServices={selectedServices}
                            onAddService={handleAddService}
                            onRemoveService={handleRemoveService}
                            onUpdateQuantity={handleUpdateService}
                        />
                    )}
                    <div className={showServicePanel ? '' : 'lg:col-span-2'}>
                        <InvoiceBuilder
                            selectedServices={selectedServices}
                            patientInfo={selectedBilling ? {
                                name: selectedBilling?.patientName,
                                id: selectedBilling?.patientId
                            } : null}
                            onUpdateService={handleUpdateService}
                            onRemoveService={handleRemoveService}
                            onApplyDiscount={handleApplyDiscount}
                            onGenerateInvoice={handleGenerateInvoiceFromBuilder}
                        />
                    </div>
                </div>
            )}
            <PaymentProcessingModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                billingInfo={selectedBilling}
                onProcessPayment={handlePaymentComplete}
            />
        </div>
    );
};

BillingIntegrationInteractive.propTypes = {
    initialData: PropTypes?.shape({
        billingQueue: PropTypes?.array?.isRequired,
        analytics: PropTypes?.array?.isRequired,
        availableServices: PropTypes?.array?.isRequired
    })?.isRequired
};

export default BillingIntegrationInteractive;